const Joi = require("joi");
const errorMessages = require("../constants/errorMessages");

exports.updateProfile = Joi.object().keys({
  first_name: Joi.string()
    .min(3)
    .max(15)
    .error(new Error(errorMessages.FIRST_NAME)),
  last_name: Joi.string()
    .min(1)
    .max(15)
    .error(new Error(errorMessages.LAST_NAME)),
  avatar_image_url: Joi.string()
    .min(1)
    .error(new Error(errorMessages.PROFILE_IMAGE_URL)),
  linkedIn_url: Joi.string()
    .min(1)
    .error(new Error(errorMessages.LINKED_IN_URL)),
  address: Joi.object().error(new Error(errorMessages.ADDRESS)),
  primary_phone: Joi.string()
    .min(1)
    .error(new Error(errorMessages.PRIMARY_PHONE)),
  secondary_phone: Joi.string()
    .min(1)
    .error(new Error(errorMessages.SECONDARY_PHONE)),
  gender: Joi.string()
    .valid("male", "female")
    .error(new Error(errorMessages.GENDER)),
  personal_website: Joi.string()
    .min(1)
    .error(new Error(errorMessages.PERSONAL_WEBSITE)),
  profile_title: Joi.string()
    .min(1)
    .error(new Error(errorMessages.PROFILE_TITLE)),
  interested_languages: Joi.array()
    .items(Joi.string())
    .min(1)
    .error(new Error(errorMessages.INTERESTED_LANGUAGE)),
  profile_description: Joi.string()
    .min(1)
    .error(new Error(errorMessages.PROFILE_DESCRIPTION))
});

exports.extraFieldCreate = Joi.object().keys({
  heading: Joi.string()
    .error(new Error(errorMessages.USER_EXTRA_FIELD_HEADING))
    .required(),
  body: Joi.string()
    .error(new Error(errorMessages.USER_EXTRA_FIELD_BODY))
    .required(),
  index: Joi.number()
    .error(new Error(errorMessages.USER_EXTRA_FIELD_INDEX))
    .required()
});

exports.extraFieldUpdate = Joi.object().keys({
  heading: Joi.string().error(new Error(errorMessages.USER_EXTRA_FIELD_HEADING)),
  body: Joi.string().error(new Error(errorMessages.USER_EXTRA_FIELD_BODY)),
  index: Joi.number().error(new Error(errorMessages.USER_EXTRA_FIELD_INDEX))
});
