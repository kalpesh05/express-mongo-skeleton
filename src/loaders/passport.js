/**
 * Passport middleware
 */
const jwt = require("jsonwebtoken");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const bcrypt = require("bcryptjs");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const config = require("../configs");
const { cryptoPassword } = require("../helpers/commonFunction");
const { getOneWhere } = require("../services/UserService");
const { create } = require("../services/TokenService");

const {
  INVALID_PASSWORD,
  UNAUTHORIZED,
  USER_NOT_FOUND
} = require("../api/constants/errorMessages");

passport.serializeUser(async (user, done) => {
  // console.log(user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

/**
 * JWT option
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret
};

/**
 * Passport jwt strategy
 */
const jwtStrategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  const user = await getOneWhere({
    _id: jwtPayload.id,
    deleted_at: null
  });

  if (user) {
    next(null, user);
  } else {
    next({ message: UNAUTHORIZED }, false);
  }
});

/**
 * Passport JWT strategy include in passport
 */
passport.use(jwtStrategy);

/**
 * Passport login local strategy
 */
const loginLocalStrategy = new localStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    session: false
  },
  async (email, password, done) => {
    const user = await getOneWhere({
      email,
      deleted_at: null
    });

    if (!user) {
      return done({ message: USER_NOT_FOUND }, false);
    }

    const { password: saltedPassword } = await cryptoPassword(
      user.salt,
      password
    );

    const isMatchPassword = saltedPassword === user.password ? true : false;

    if (isMatchPassword) {
      const tokenObj = {
        user_id: user._id,
        type: "user_login"
      };

      const token = await create(tokenObj);

      return done(null, { user, token });
    } else {
      return done({ message: INVALID_PASSWORD }, false);
    }
  }
);

/**
 * Passport login local strategy
 */
passport.use("login", loginLocalStrategy);

module.exports = passport;
