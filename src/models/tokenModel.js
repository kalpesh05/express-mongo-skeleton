const mongoose = require("mongoose");

const schema = {
  _id: {
    type: String
  },
  token: {
    type: String
  },
  user_id: {
    type: String
  },
  type: {
    type: String
  },
  expires_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
};
const options = {
  versionKey: false,
  toObject: {
    virtual: true,
    transform: function(doc, ret) {}
  },
  toJSON: {
    virtual: true,
    transform: function(doc, ret) {
      delete ret.id;
    }
  }
};
const TokenSchema = new mongoose.Schema(schema, options);

TokenSchema.virtual("user", {
  ref: "user",
  localField: "user_id",
  foreignField: "_id",
  autopopulate: true,
  justOne: true
});

TokenSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("token", TokenSchema);
