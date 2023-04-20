const net = require("net");
const fs = require("fs");
const writeFile = require("./writeFile");
const logger = require("./log");
const sqlite = require("sqlite3").verbose();
const uuid = require("node-uuid");

const dateFormat = (date, format) => {
  let dateObj = date;
  let fmt = format || "yyyy-MM-dd hh:mm:ss";
  //author: meizz
  var o = {
    "M+": dateObj.getMonth() + 1, //月份
    "d+": dateObj.getDate(), //日
    "h+": dateObj.getHours(), //小时
    "m+": dateObj.getMinutes(), //分
    "s+": dateObj.getSeconds(), //秒
    "q+": Math.floor((dateObj.getMonth() + 3) / 3), //季度
    S: dateObj.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (dateObj.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? o[k].toString()
          : ("00" + o[k].toString()).substr(("" + o[k].toString()).length)
      );
  return fmt;
};

const readConfig = () => {
  const data = fs.readFileSync("config.json", "utf-8");
  return JSON.parse(data);
};

const execute = () => {
  const config = readConfig();
  const host = config.host;
  const port = config.port;
  const path = config.path;
  const dbPath = config.dbPath;

  const server = net.createServer();
  server.listen(port, host);

  server.on("listening", () => {
    logger.info(`服务已开启在 ${host}:${port}`);
  });

  server.on("connection", (socket) => {
    console.log("连接");
    // data 事件就是读取数据
    socket.on("data", (buffer) => {
      logger.info("接收一次数据");
      writeFile(
        dateFormat(new Date(), "yyyy-MM-dd hh:mm") +
          "\n" +
          buffer.toString("hex") +
          "\n\n",
        path
      );

      const id = uuid.v1();
      const time = dateFormat(new Date(), "yyyy-MM-dd hh:mm");
      const db = new sqlite.Database(dbPath, (err) => {
        if (err) throw err;
      });
      db.run(
        `insert into device_a values('${id}', '${time}', X'${buffer.toString(
          "hex"
        )}')`,
        (err) => {
          if (err) throw err;
        }
      );
      db.close();
    });
    socket.on("error", (err) => {
      logger.info("socket错误,可能是客户端关闭导致", err);
    });
    socket.on("close", (e) => {
      logger.info("socket关闭");
    });
  });

  server.on("close", () => {
    logger.info("Server Close!");
  });

  server.on("error", (err) => {
    console.log(1);
    if (err.code === "EADDRINUSE") {
      logger.info("地址正被使用，重试中...");

      setTimeout(() => {
        server.close();
        server.listen(port, host);
      }, 1000);
    } else {
      logger.info("服务器异常：", err);
    }
  });
};

execute();
