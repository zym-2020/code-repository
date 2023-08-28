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
        type_value = sheet.cell_value(3, 3)
        name_value = sheet.name
        for j in range(7, sheet.nrows):
            arr.append((xlrd.xldate_as_datetime(sheet.cell_value(j, 0), 0).strftime("%Y-%m-%d %H:%M:%S"), name_value, type_value, sheet.row(j)[1].value, sheet.row(
                j)[2].value, sheet.row(j)[3].value, sheet.row(j)[4].value, sheet.row(j)[5].value, sheet.row(j)[6].value, sheet.row(j)[7].value, sheet.row(j)[8].value))
    cur.executemany(
        "insert into sand_content_result values(?,?,?,?,?,?,?,?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()


execute("D:/zhuomian/苏通二通道最终成果/附表/附表3 实测含沙量成果表.xls", "E:/monitor/project/c5221577-6578-9e72-67dd-a66914ee7afd/dataset.db")
