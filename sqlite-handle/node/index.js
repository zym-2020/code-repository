const fs = require("fs");
const uuid = require("node-uuid");
const sqlite = require("sqlite3").verbose();

console.log(uuid.v1());

const execute = (dbPath, jsonPath) => {
  fs.readFile(jsonPath, "utf-8", (err, res) => {
    const db = new sqlite.Database(dbPath, (err) => {
      if (err) throw err;
    });
    const stations = JSON.parse(res);

    stations.forEach((item) => {
      const id = uuid.v1();
      const keys = { key: item.keys };
      const keys_cn = { key: item.keys_cn };
      const startTime = { key: item.startTime };
      db.run(
        `insert into stations values('${id}', '${item.name}', '${
          item.name_en
        }', '${JSON.stringify(keys)}', '${JSON.stringify(keys_cn)}', ${
          item.lon
        }, ${item.lat}, '${item.type}', '${JSON.stringify(startTime)}')`,
        (err) => {
          if (err) throw err;
        }
      );
    });
  });
};

const executeBridge = (dbPath, jsonPath) => {
  fs.readFile(jsonPath, "utf-8", (err, res) => {
    const db = new sqlite.Database(dbPath, (err) => {
      if (err) throw err;
    });
    const bridges = JSON.parse(res);
    bridges.forEach((item) => {
      const id = uuid.v1();
      db.run(
        `insert into bridges values('${id}', '${item["桥区水域范围"]}', '${
          item["桥涵标"]
        }', '${item["桥区水域水上航路航法"]}', '${item["航评批复文件"]}', '${
          item["海事管理机构"]
        }', '${item["桥梁属性"]}', '${item["设计通航代表船型、船队"]}',
        '${item["桥柱灯"]}', '${item["区段通航代表船型、船队"]}',
        '${item["桥梁主动防撞设施"]}', '${item["桥梁运行管理单位"]}', '${
          item["通车时间"]
        }', '${item["桥梁被动防撞设施"]}', '${item["日均断面流量"]}', '${
          item["桥区视频设施"]
        }', '${item["已建立的桥区水域水上交通安全管理制度"]}', '${
          item["桥区水域内临河设施"]
        }',
        '${item["其他"]}', '${item["主通航孔编号"]}', '${
          item["桥区水域内锚地、停泊区"]
        }', '${item["桥区水域内跨河设施"]}', '${item["桥区水上航标布置"]}', '${
          item["小轮通航孔编号"]
        }', '${JSON.stringify(item["polygon"])}', '${item["航道养护单位"]}', '${
          item["桥梁名称"]
        }',
        '${item["name"]}', '${item["主通航孔桥墩防船撞能力"]}')`,
        (err) => {
          if (err) throw err;
        }
      );
    });
  });
};

// execute(
//   "D:/zhuomian/水科院/python/data/static_database.db",
//   "E:/codes/code-repository/sqlite-handle/node/station_name.json"
// );

executeBridge(
  "D:/zhuomian/水科院/python/data/static_database.db",
  "E:/codes/code-repository/sqlite-handle/node/bridge.json"
);
