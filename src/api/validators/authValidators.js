const Joi = require("joi");
const errorMessages = require("../constants/errorMessages");

exports.register = Joi.object().keys({
  email: Joi.string()
    .min(3)
    .max(100)
    .email()
    .error(new Error(errorMessages.EMAIL))
    .required(),
  first_name: Joi.string()
    .min(3)
    .max(15)
    .error(new Error(errorMessages.FIRST_NAME))
    .required(),
  last_name: Joi.string()
    .min(1)
    .max(15)
    .error(new Error(errorMessages.LAST_NAME))
    .required(),
  password: Joi.string()
    .min(8)
    .error(new Error(errorMessages.PASSWORD))
    .required(),
  role: Joi.string()
    .error(new Error(errorMessages.ROLE))
    .optional(),
  avatar_image_url: Joi.string()
    .error(new Error(errorMessages.PROFILE_IMAGE_URL))
    .optional()
});

exports.login = Joi.object().keys({
  email: Joi.string()
    .min(3)
    .max(100)
    .email()
    .error(new Error(errorMessages.EMAIL))
    .required(),
  password: Joi.string()
    .min(8)
    .error(new Error(errorMessages.PASSWORD))
    .required(),
  role: Joi.string()
    .error(new Error(errorMessages.ROLE))
    .optional()
});

exports.forgotPassword = Joi.object().keys({
  email: Joi.string()
    .min(3)
    .max(100)
    .email()
    .error(new Error(errorMessages.EMAIL))
    .required()
});

exports.resetPassword = Joi.object().keys({
  token: Joi.string()
    .error(new Error(errorMessages.INVALID_TOKEN))
    .required(),
  new_password: Joi.string()
    .min(8)
    .error(new Error(errorMessages.NEW_PASSWORD))
    .required()
});

exports.resendVerifyEmail = Joi.object().keys({
  email: Joi.string()
    .min(3)
    .max(100)
    .email()
    .error(new Error(errorMessages.EMAIL))
    .required()
});
