const log4js = require("log4js")
const logPath = "E:/real-time/log/"

log4js.configure({
  appenders: {
    realTime: {
      type: "file",
      filename: logPath + "realTime.log",
      maxLogSize: 10,
    },
  },
  categories: { default: { appenders: ["realTime"], level: "info" } },
});

const logger = log4js.getLogger("realTime");
module.exports = logger
