const net = require("net");
const schedule = require("node-schedule");

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

const execute = (host, port) => {
  let flag = false;
  let client;
  function conn(h, p) {
    const client = net.createConnection({
      host: h,
      port: p,
    });

    client.on("connect", () => {
      console.log("连接!");
      flag = true;
    });

    client.on("error", (err) => {
      console.error("服务器异常：", err);
    });

    client.on("close", (err) => {
      console.log("客户端链接断开！", err);
      flag = false;
    });
    return client;
  }

  client = conn(host, port);
  schedule.scheduleJob("0 11 * * * *", () => {
    if (!flag) {
      client = conn(host, port);
    }
    const time = dateFormat(new Date(), "yyyy-MM-dd hh:mm");
    client.write(Math.random().toFixed(3) + "\t" + Math.random().toFixed(3));
    console.log(time + "发送数据");
  });
};

const param = process.argv;
const host = param[2];
const port = param[3];
execute(host, port);
