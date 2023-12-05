from PIL import Image

def crop_image(input_path, output_path, left, top, right, bottom):
    """
    裁剪指定区域的图片并保存到输出路径。

    参数：
    - input_path: 输入图片的路径
    - output_path: 输出裁剪后的图片路径
    - left: 裁剪区域的左边界坐标
    - top: 裁剪区域的上边界坐标
    - right: 裁剪区域的右边界坐标
    - bottom: 裁剪区域的下边界坐标
    """
    try:
        # 打开图片
        img = Image.open(input_path)

        # 裁剪图片
        cropped_img = img.crop((left, top, right, bottom))

        # 保存裁剪后的图片
        cropped_img.save(output_path)

        print("图片裁剪成功！")
    except Exception as e:
        print(f"发生错误：{e}")

# 示例用法
input_image_path = "D:/zhuomian/毕业/论文/picture/最邻近插值修勾.png"
output_image_path = "D:/zhuomian/毕业/论文/picture/最邻近插值修勾1.png"

# 指定裁剪区域的坐标
left_coord = 150
top_coord = 100
right_coord = 500
bottom_coord = 400

# 调用裁剪函数
crop_image(input_image_path, output_image_path, left_coord, top_coord, right_coord, bottom_coord)