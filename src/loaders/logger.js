const winston = require("winston");
const config = require("../configs");

const transports = [];
if (process.env.NODE_ENV !== "development") {
  transports.push(new winston.transports.Console());
} else {
  transports.push(
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
      silent: false,
      format: winston.format.combine(
        winston.format.cli(),
        winston.format.splat()
      )
    })
  );

  transports.push(
    new winston.transports.File({
      prettyPrint: false,
      level: "info",
      silent: false,
      colorize: true,
      timestamp: true,
      filename: "./express-mongo-skeleton.log",
      maxsize: 40000,
      maxFiles: 10,
      json: false
    })
  );
}
module.exports = winston.createLogger({
  levels: config.logs.myCustomLevel.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports
});
