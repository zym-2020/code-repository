const iconv = require("iconv-lite");
const sqlite = require("sqlite3").verbose();
const uuid = require("node-uuid");

const dateFormat = (date, format) => {
  let dateObj = new Date(Date.parse(date));
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

const res = `$GPZDA,031113.00,19,04,2023,,*68
$GLGSV,2,1,07,83,74,009,,73,57,345,,80,54,112,,84,37,216,*62
$GLGSV,2,2,07,82,28,028,,74,13,326,,79,06,134,*50
$GPGSV,5,1,20,21,72,122,,07,64,270,,01,51,178,47,08,51,030,*7F
$GPGSV,5,2,20,30,36,308,,27,21,051,,16,18,099,,14,14,304,*7A
$GPGSV,5,3,20,09,08,224,,17,06,248,,10,04,056,,04,01,194,*79
$GPGSV,5,4,20,50,53,169,,56,53,201,,43,47,147,,35,47,142,*75
$GPGSV,5,5,20,45,43,226,,41,35,237,37,57,32,239,,40,12,257,*76
$BDGSV,4,1,16,26,88,181,,07,64,325,,10,53,304,,09,51,229,35*65
$BDGSV,4,2,16,03,51,200,39,01,45,141,46,06,42,206,39,24,40,317,*69
$BDGSV,4,3,16,16,39,201,42,04,35,123,41,02,35,235,,12,34,232,36*65
$BDGSV,4,4,16,05,14,254,,29,12,045,,08,09,175,,13,03,185,*6A
$GPGGA,031113.00,3105.9243448,N,12117.3602870,E,2,07,6.0,59.780,M,10.50,M,99,0128*6C
$GPHDT,,T*1B
$GNVTG,353.838,T,353.838,M,0.548,N,1.015,K,A*31
$GNGRS,031113.00,1,0.0,,,,,,,,,,,,1,0*7E
$GNGRS,031113.00,1,-0.1,-1.4,1.0,0.1,0.8,,,,,,,,4,0*77

`;
const buf = iconv.encode(res, "utf-8");
console.log(buf.toString("hex"));

const execute = (dbPath) => {
  const id = uuid.v1();
  const time = dateFormat(new Date(), "yyyy-MM-dd hh:mm");
  const data = buf;
  const db = new sqlite.Database(dbPath, (err) => {
    if (err) throw err;
  });
  db.run(
    `insert into device_a values('${id}', '${time}', X'${data.toString(
      "hex"
    )}')`,
    (err) => {
      if (err) throw err;
    }
  );
};

// execute("D:/zhuomian/毕业/node-manage/monitoring.db");
