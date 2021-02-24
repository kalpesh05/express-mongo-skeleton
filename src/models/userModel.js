const mongoose = require("mongoose");

const schema = {
  _id: {
    type: String
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String
  },
  role: {
    type: String,
    default: "user"
  },
  avatar_image_url: {
    type: String,
    default: ""
  },
  linkdin_url: {
    type: String
  },
  address: {
    type: Object,
    default: { city: null, state: null, street: null, zip: null }
  },
  primary_phone: {
    type: String
  },
  secondary_phone: {
    type: String
  },
  gender: {
    type: String
  },
  personal_website: {
    type: String
  },
  profile_description: {
    type: String
  },
  profile_title: {
    type: String
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  extra_fields: {
    type: Array,
    default: []
  },
  updated_by: {
    type: String,
    default: null
  },
  deleted_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
};
const options = {
  versionKey: false,
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {}
  },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.acquired_skills;
      delete ret.password;
      delete ret.salt;
      delete ret.id;
    }
  }
};

const UserSchema = new mongoose.Schema(schema, options);
// UserSchema.virtual("skills", {
//   ref: "skill",
//   localField: "acquired_skills",
//   foreignField: "slug",
//   autopopulate: { select: "name xp level_xp" }
// });
UserSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("user", UserSchema);
