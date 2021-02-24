const { userService, tokenService } = require("../../services");
const passport = require("passport");
const moment = require("moment-timezone");
const {
  USER_REGISTER,
  EMAIL_VERIFY,
  EMAIL_ALREADY_VERIFIED,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  FORGOT_PASSWORD_SUCCESS,
  RESET_PASSWORD_SUCCESS
} = require("../constants/successMessages");
const {
  LOGIN_FAILED,
  INVALID_PASSWORD_TOKEN,
  INVALID_EMAIL_TOKEN,
  USER_NOT_FOUND,
  USER_NOT_ALLOWED
} = require("../constants/errorMessages");
const {
  randomString,
  cryptoPassword
} = require("../../helpers/commonFunction");

class authController {
  /**
   * Register
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async register(req, res, next) {
    let model = req.body;

    try {
      let user = await userService.create(model);

      /**
       * Send email verification mail
       */
      // Welcome email won't be sent on production
      if (!process.env.NODE_ENV == "production") {
        await userService.sendVerificationMail(req.body, user._id);
      }

      // generate token
      let tokenData = await tokenService.createToken({
        user_id: user._id,
        type: "user_login"
      });

      return res.json({
        message: USER_REGISTER,
        data: { user: user, token: tokenData.token }
      });
    } catch (error) {
      // console.log("<<<<<<<<<>>>>>>>>>>", error);
      return next(error);
    }
  }

  /**
   * Login
   * @param req
   * @param res
   * @param {*} next
   * @returns {Promise<*>}
   */
  async login(req, res, next) {
    passport.authenticate("login", function(err, user) {
      try {
        let role = req.body.role ? req.body.role : "user";

        if (req.body && user && role != user.user.role) {
          throw new Error(USER_NOT_ALLOWED);
        }

        if (user) {
          req.logIn(user, err => {
            if (err) {
              return next(LOGIN_FAILED);
            }

            let token = user.token;
            let userData = user.user;

            res.send({
              message: LOGIN_SUCCESS,
              data: {
                user: userData,
                token: token
              }
            });
          });
        } else {
          return next(err);
        }
      } catch (error) {
        // console.log(error);
        return next(error);
      }
    })(req, res, next);
  }

  /**
   * Logout
   * @param req
   * @param res
   * @param {*} next
   * @returns {Promise<*>}
   */
  async logout(req, res, next) {
    // console.log(req.user);
    let { user, headers } = req;

    try {
      /**
       * Token get from header
       */
      const tokenString = headers.authorization.slice(
        7,
        req.headers.authorization.length
      );
      // console.log(req.user);
      let token = await tokenService.remove({
        user_id: user._id,
        token: tokenString
      });

      return res.json({
        message: LOGOUT_SUCCESS,
        data: ""
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * User verify email API main function
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async verifyEmail(req, res, next) {
    let { removeToken, verfiyToken } = tokenService;
    try {
      /**
       * Validate token
       */
      const userId = await verfiyToken(req.params.token);

      /**
       * Check user email verified
       */
      let user = await userService.getOneWhere({
        _id: userId,
        deleted_at: null
      });

      if (!user) throw new Error(INVALID_EMAIL_TOKEN);

      if (user.is_email_verified) throw new Error(EMAIL_ALREADY_VERIFIED);

      /**
       * User email verify flag update in database
       */
      user = await userService.update(userId, {
        is_email_verified: true
      });

      if (!user) throw new Error(DATABASE_INTERNAL);

      /**
       * Remove token from database
       */
      await removeToken(userId, "email_verification");

      /**
       * API response
       */
      return res.send({
        message: EMAIL_VERIFY,
        data: ""
      });
    } catch (error) {
      /**
       * Error send in error handler middleware
       */
      return next(error);
    }
  }

  /**
   * Forgot password
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async forgotPassword(req, res, next) {
    try {
      let { email } = req.body;
      let { getOneWhere, sendForgotPasswordMail } = userService;
      let { removeToken } = tokenService;

      const user = await getOneWhere({ email, deleted_at: null });

      if (!user) throw new Error(USER_NOT_FOUND);
      let userId = user._id;
      const tokenString = randomString(16);

      const tokenObj = {
        user_id: userId,
        token: tokenString,
        type: "password_reset"
      };

      let token = await tokenService.create(tokenObj);

      // if (token.error) throw new Error(DATABASE_INTERNAL);
      // console.log(user);
      /**
       * Send email forgot password mail
       */
      await sendForgotPasswordMail(user.data, token.token);

      let tokenRemove = await removeToken(userId, "user_login");

      if (!tokenRemove) throw new Error(DATABASE_INTERNAL);

      /**
       * API response
       */
      return res.send({
        message: FORGOT_PASSWORD_SUCCESS,
        data: ""
      });
    } catch (error) {
      /**
       * Error send in error handler middleware
       */
      return next(error);
    }
  }

  /**
   * Reset password
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async resetPassword(req, res, next) {
    let { token, new_password } = req.body;
    let { update } = userService;
    let { removeToken, getOneWhere } = tokenService;
    try {
      const tokenData = await getOneWhere({
        token: token,
        type: "password_reset"
      });

      if (!tokenData) throw new Error(INVALID_PASSWORD_TOKEN);

      const currentDate = new Date();

      if (currentDate > moment(tokenData.data.created_at).add("24", "hours"))
        throw new Error(INVALID_PASSWORD_TOKEN);

      let userId = tokenData.user_id;

      const Password = cryptoPassword(null, new_password);

      const user = await update(userId, {
        password: Password.password,
        salt: Password.salt
      });

      if (!user) throw new Error(DATABASE_INTERNAL);

      /**
       * Remove token from database
       */
      await removeToken(userId, "password_reset");

      /**
       * Remove login session from database
       */
      await removeToken(userId, "user_login");

      /**
       * API response
       */
      return res.send({
        message: RESET_PASSWORD_SUCCESS,
        data: ""
      });
    } catch (error) {
      /**
       * Error send in error handler middleware
       */
      return next(error);
    }
  }

  /**
   * Get LoggedIn User Detail
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async getMyDetail(req, res, next) {
    try {
      // console.log(req.user);
      const user = await userService.getOne(req.user._id);

      /**
       * API response
       */
      return res.send({
        message: "",
        data: user
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new authController();
