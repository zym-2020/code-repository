import xlrd
import sqlite3

# 流速流向


def execute(path, db_path):
    xlsx = xlrd.open_workbook(path)
    sheets = xlsx.sheets()

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    arr = []
    for i in range(len(sheets)):
        sheet = sheets[i]
        type_value = sheet.cell_value(1, 14)
        name_value = 'S-' + \
            sheet.cell_value(1, 1)[0: len(sheet.cell_value(1, 1)) - 1]
        distance_value = sheet.name
        for j in range(4, sheet.nrows):
            arr.append((xlrd.xldate_as_datetime(sheet.cell_value(j, 0), 0).strftime("%Y-%m-%d %H:%M:%S"), name_value, type_value, distance_value, sheet.row(j)[1].value, sheet.row(
                j)[2].value, sheet.row(j)[3].value, sheet.row(j)[4].value, sheet.row(j)[5].value, sheet.row(j)[6].value, sheet.row(j)[7].value, sheet.row(j)[8].value, sheet.row(j)[9].value, sheet.row(j)[10].value, sheet.row(j)[11].value, sheet.row(j)[12].value, sheet.row(j)[13].value, sheet.row(j)[14].value, sheet.row(j)[15].value))
    cur.executemany(
        "insert into v_d_result values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()


execute("D:/zhuomian/苏通二通道最终成果/附表/附件1：ADCP断面各垂线平均流速流向成果表/XWX#小潮流速流向成果表.xls",
        "D:/zhuomian/monitor.db")
