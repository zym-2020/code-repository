import xlrd
import json


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


execute("D:/zhuomian/苏通二通道最终成果/附表/附表2 实测大断面成果表.xls", "D:/zhuomian/苏通二通道最终成果/section/")
