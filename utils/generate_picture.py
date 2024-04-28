from PIL import Image

def hex_to_rgb(hex_string):
    # 去除字符串开头的 #
    hex_string = hex_string.lstrip("#")

    # 将字符串转换为整数
    value = int(hex_string, 16)

    # 提取红、绿和蓝分量的值
    red = (value >> 16) & 0xFF
    green = (value >> 8) & 0xFF
    blue = value & 0xFF

    # 返回 RGB 数组
    return (red, green, blue)

def generate_image(data):
    width = 27
    height = 1

    # 创建一个新的图像对象
    image = Image.new("RGB", (width, height))

    # 将数据中的每个像素颜色应用到图像中
    for x in range(width):
        color = data[x]
        rgb = tuple(hex_to_rgb(color))  # 将十六进制颜色转换为 RGB 值
        image.putpixel((x, 0), rgb)

    # 保存图像为 PNG 文件
    image.save("output.png")

# 示例数据
data = ["#08a3f4", "#f4e92a", "#1195db", "#898989", "#c3c3c3", "#dfebfd", "#d8d8d8",
        "#979797", "#d44f16", "#970e00", "#ffffff", "#d3d8df", "#000000", "#e6db4d",
        "#c3c3c3", "#dfebfd", "#d8d8d8", "#979797", "#970e00", "#d44f16", "#3fa3e6",
        "#ffffff", "#d3d8df", "#215087", "#67aff7", "#ffffff", "#3b89e1"]

generate_image(data)





