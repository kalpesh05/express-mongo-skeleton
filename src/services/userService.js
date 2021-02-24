const { userModel, tokenModel } = require("../models");
const tokenService = require("./tokenService");
const {
  EMAIL_ADDRESS_ALREADY_REGISTERED,
  EXTRA_FIELD_NOT_FOUND
} = require("../api/constants/errorMessages");
// const bcrypt = require("bcrypt");

// const request = require("request-promise");
const jwt = require("jsonwebtoken");
const {
  cryptoPassword,
  mongoId,
  generateKeyPair
} = require("../helpers/commonFunction");
const {
  forgotPasswordEmailSend,
  emailVerificationEmailSend
} = require("../helpers/mailSendUsingTemplateId");

class userService {
  async getAllUsersWhere(where = {}) {
    return userModel.find(where).sort("-created_at");
  }

  async getOne(id) {
    return userModel.findOne({ _id: id });
  }

  async getOneWhere(where) {
    return userModel.findOne(where);
  }

  async create(model) {
    // try {
    // let obj = { data: null, error: null };
    // try {
    let user = await userModel.findOne({ email: model.email });
    // console.log(user);
    // if (user) obj.error = EMAIL_ADDRESS_ALREADY_REGISTERED;
    if (user) throw new Error(EMAIL_ADDRESS_ALREADY_REGISTERED);

    const { salt, password } = cryptoPassword(null, model.password);

    model.password = password;
    model.salt = salt;
    model._id = mongoId("user");
    return userModel.create(model);
  }

  async getAllUsers() {
    return userModel.find();
  }

  //   removeAuthToken(token) {
  //     return app.models.Token.deleteOne({ token });
  //   }

  async update(id, model) {
    return userModel.findOneAndUpdate({ _id: id }, model, {
      new: true
    });
  }

  async addExtraField(userId, model) {
    let user = await userModel.findOne({ _id: userId });

    user.extra_fields.push(model);

    return user.save();
  }

  async updateExtraField(userId, index, model) {
    let user = await userModel.findOne({ _id: userId });

    // user.extra_fields.push(model);
    let extraFieldIndex = user.extra_fields.findIndex(v => v.index === index);

    if (extraFieldIndex === -1) throw new Error(EXTRA_FIELD_NOT_FOUND);

    user.extra_fields[extraFieldIndex] = model;

    return user.save();
  }

  /**
   * Send verification mail to user email
   */
  async sendVerificationMail(body, userId) {
    let tokenData = await tokenService.createToken({
      user_id: userId,
      type: "email_verification"
    });

    await emailVerificationEmailSend(
      body.email,
      body.first_name,
      `${process.env.FRONTEND_URL}/verify/email/${tokenData.token}`
    );

    return true;
  }

  /**
   * Send forgot password mail to user email
   */
  async sendForgotPasswordMail(user, token) {
    await forgotPasswordEmailSend(
      user.email,
      user.first_name,
      `${process.env.FRONTEND_URL}/reset-password/${token}`
    );

    return true;
  }
}

module.exports = new userService();
