const mongoose = require("mongoose");
const config = require("../configs");

mongoose
  .connect(config.databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("MongoDB connected successfully."));
