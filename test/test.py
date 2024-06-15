import PyPDF2

import os

folder_path = r"E:\QQ下载\1161384816\FileRecv\1715237835781308569"

for root, dirs, files in os.walk(folder_path):
    for file in files:
        file_path = os.path.join(root, file)
        with open(file_path, 'rb') as f:
            # 创建一个PdfFileReader对象
            pdf_reader = PyPDF2.PdfFileReader(f)

            # 获取PDF文件的总页数
            num_pages = pdf_reader.numPages
            page = pdf_reader.getPage(2)
            text = page.extract_text()
            lines = text.split('\n')
            line_content = lines[14][4:6]
            print(file[0:9],line_content)



