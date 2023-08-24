import xlrd
import json
import sqlite3


def execute(path, output_path):
    xlsx = xlrd.open_workbook(path)
    sheets = xlsx.sheets()

    res = {
        "name": "",
        "angle": "",
        "time": "",
        "value": []
    }
    for i in range(len(sheets)):
        sheet = sheets[i]
        if sheet.name[len(sheet.name) - 1] == '1':
            res = {
                "name": sheet.name[0: len(sheet.name) - 3],
                "angle": sheet.cell_value(4, 0)[6:],
                "time": sheet.cell_value(4, 6)[5:],
                "value": []
            }
        
        for j in range(2):
            for k in range(6, sheet.nrows):
                if (sheet.cell_type(k, j * 4) != 0):
                    res['value'].append({
                        "number": sheet.cell_value(k, j * 4),
                        "distance": sheet.cell_value(k, j * 4 + 1),
                        "elevation": sheet.cell_value(k, j * 4 + 2),
                    })
                else:
                    break
        if i + 1 == len(sheets) or sheets[i + 1].name[len(sheets[i + 1].name) - 1] == '1':
            j = json.dumps(res)
            f = open(output_path + res['name'] + '.json', 'w')
            f.write(j)
            f.close()


def execute1(path, db_path):
    xlsx = xlrd.open_workbook(path)
    sheets = xlsx.sheets()

    arr = []
    for i in range(len(sheets)):
        sheet = sheets[i]
        
        for j in range(2):
            for k in range(6, sheet.nrows):
                if (sheet.cell_type(k, j * 4) != 0):
                    arr.append((sheet.name[0: len(sheet.name) - 3] + "#", sheet.cell_value(k, j * 4), sheet.cell_value(k, j * 4 + 1), sheet.cell_value(k, j * 4 + 2)))
                    
                else:
                    break
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.executemany(
        "insert into section_elevation values(?,?,?,?)", arr)
    conn.commit()
    cur.close()
    conn.close()



# execute("D:/zhuomian/苏通二通道最终成果/附表/附表2 实测大断面成果表.xls", "D:/zhuomian/苏通二通道最终成果/section/")
execute1("D:/zhuomian/苏通二通道最终成果/附表/附表2 实测大断面成果表.xls", "E:/monitor/project/c5221577-6578-9e72-67dd-a66914ee7afd/dataset.db")
