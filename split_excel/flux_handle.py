import xlrd
import sqlite3


def execute(path, db_path):
    xlsx = xlrd.open_workbook(path)
    sheets = xlsx.sheets()

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    arr = []
    for i in range(len(sheets)):
        sheet = sheets[i]
        type_value = "大潮" if i % 2 == 0 else "小潮"
        for j in range(2, sheet.nrows):
            for k in range(8):
                arr.append((xlrd.xldate_as_datetime(
                    sheet.cell_value(j, 0), 0).strftime("%Y-%m-%d %H:%M:%S"), sheet.row(1)[k + 1].value, type_value, sheet.row(j)[k + 1].value))
    cur.executemany("insert into flux_result values(?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()


execute("D:/zhuomian/苏通二通道最终成果/附表/附表6 潮流量成果表/附表6-1 断面潮流量成果表.xls",
        "D:/zhuomian/monitor.db")
