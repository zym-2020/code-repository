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
        print(sheet.name)
        for j in range(sheet.nrows):
            arr.append((sheet.row(j)[0].value, sheet.name, sheet.row(j)[1].value, sheet.row(j)[2].value, sheet.row(j)[3].value))
    cur.executemany("insert into locus_result values(?,?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()


execute("D:/zhuomian/苏通二通道最终成果/附表/附表8 表面流迹成果表.xls", "D:/zhuomian/monitor.db")
