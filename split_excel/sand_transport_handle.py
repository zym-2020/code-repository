import sqlite3
import xlrd
import uuid


def execute(path, db_path):
    xlsx = xlrd.open_workbook(path)
    sheets = xlsx.sheets()

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    arr = []
    for i in range(len(sheets)):
        table_id = uuid.uuid1()
        sheet = sheets[i]
        type_value = sheet.name[-5:-3]
        for j in range(2, sheet.nrows):
            for k in range(6):
                arr.append((xlrd.xldate_as_datetime(
                    sheet.cell_value(j, 0), 0).strftime("%Y-%m-%d %H:%M:%S"), sheet.row(1)[k + 1].value[:-1], type_value, sheet.row(j)[k + 1].value, str(table_id)))
    cur.executemany("insert into sand_transport_result values(?,?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()



execute("D:/zhuomian/苏通二通道最终成果/附表/附表7 断面输沙率成果表.xls",
         "E:/monitor/project/c5221577-6578-9e72-67dd-a66914ee7afd/dataset.db")