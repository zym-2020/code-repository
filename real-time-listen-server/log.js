const log4js = require("log4js");
const fs = require("fs");
// const logPath = "E:/real-time/log/";

const readLogPath = () => {
  const data = fs.readFileSync("config.json", "utf-8");
  return JSON.parse(data)["log"];
};

const logPath = readLogPath();

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
module.exports = logger;
