/**
 * Common function
 */
const crypto = require("crypto");
const moment = require("moment-timezone");

exports.cryptoPassword = function(userSalt, password) {
  let salt = `${Math.round(new Date().valueOf() * Math.random())}`;

  if (userSalt) {
    salt = userSalt;
  }

  const newPassword = crypto
    .createHmac("sha1", salt)
    .update(password)
    .digest("hex");

  return {
    salt,
    password: newPassword
  };
};

exports.generateKeyPair = function() {
  let { generateKeyPair } = crypto;
  return generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem"
    }
  });
};

exports.randomString = function(length) {
  const token = crypto.randomBytes(length).toString("hex");

  return token;
};

exports.mongoId = function(model) {
  let token = crypto.randomBytes(12).toString("hex");

  switch (model) {
    case "user":
      token = `usr_${token}`;
      break;

    default:
      token = token;
      break;
  }

  return token;
};

exports.addTime = function(time, type) {
  const date = new Date(Date.parse(moment().add(time, type)));

  return date;
};
