import sqlite3
import xlrd
import json


def execute(path, db_path):
    xlsx = xlrd.open_workbook(path)
    sheets = xlsx.sheets()

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    arr = []
    for i in range(len(sheets)):
        sheet = sheets[i]
        for j in range(7, sheet.nrows):
            location = sheet.cell_value(j, 3)
            level = [
                {
                    "key": "1.000",
                    "value": float(sheet.cell_value(j, 5)) if sheet.cell_value(j, 5) != "" else 0
                },
                {
                    "key": "0.500",
                    "value": float(sheet.cell_value(j, 6)) if sheet.cell_value(j, 6) != "" else 0
                },
                {
                    "key": "0.250",
                    "value": float(sheet.cell_value(j, 7)) if sheet.cell_value(j, 7) != "" else 0
                },
                {
                    "key": "0.125",
                    "value": float(sheet.cell_value(j, 8)) if sheet.cell_value(j, 8) != "" else 0
                },
                {
                    "key": "0.100",
                    "value": float(sheet.cell_value(j, 9)) if sheet.cell_value(j, 9) != "" else 0
                },
                {
                    "key": "0.070",
                    "value": float(sheet.cell_value(j, 10)) if sheet.cell_value(j, 10) != "" else 0
                },
                {
                    "key": "0.062",
                    "value": float(sheet.cell_value(j, 11)) if sheet.cell_value(j, 11) != "" else 0
                },
                {
                    "key": "0.031",
                    "value": float(sheet.cell_value(j, 12)) if sheet.cell_value(j, 12) != "" else 0
                },
                {
                    "key": "0.016",
                    "value": float(sheet.cell_value(j, 13)) if sheet.cell_value(j, 13) != "" else 0
                },
                {
                    "key": "0.008",
                    "value": float(sheet.cell_value(j, 14)) if sheet.cell_value(j, 14) != "" else 0
                },
                {
                    "key": "0.005",
                    "value": float(sheet.cell_value(j, 15)) if sheet.cell_value(j, 15) != "" else 0
                },
                {
                    "key": "0.002",
                    "value": float(sheet.cell_value(j, 16)) if sheet.cell_value(j, 16) != "" else 0
                }
            ]

            arr.append((xlrd.xldate_as_datetime(
                sheet.cell_value(j, 4), 0).strftime("%Y-%m-%d %H:%M:%S"), location[:-2], location[-2:], sheet.cell_value(j, 20), json.dumps(level)))

    cur.executemany("insert into substrate_result values(?,?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()


execute("D:/zhuomian/苏通二通道最终成果/附表/附表5 底质颗粒分析成果表.xls",
        "E:/monitor/project/c5221577-6578-9e72-67dd-a66914ee7afd/dataset.db")
