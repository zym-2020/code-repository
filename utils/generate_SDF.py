import math
import numpy as np
import cv2 as cv

def get_dis(x, y):
    return math.sqrt(x * x + y * y)

def compare(point_list, centerX, centerY, offsetX, offsetY, width, height):
    point_offsetX = centerX + offsetX
    point_offsetY = centerY + offsetY
    
    if point_offsetX < 0 or point_offsetX > width - 1:
        return
    
    if point_offsetY < 0 or point_offsetY > height - 1:
        return

    center_point = point_list[centerX][centerY]
    compare_point = point_list[centerX + offsetX][centerY + offsetY]
    
    center_dis = get_dis(center_point[0], center_point[1])
    compare_dis = get_dis(compare_point[0] + offsetX, compare_point[1] + offsetY)
    
    if center_dis > compare_dis:
        point_list[centerX][centerY][0] = compare_point[0] + offsetX
        point_list[centerX][centerY][1] = compare_point[1] + offsetY
    
    return

def generate_sdf(point_list, width, height, dis_img):
    for x in range(width):
        for y in range(height):
            compare(point_list, x, y, -1, 0, width, height)
            compare(point_list, x, y, 0, -1, width, height)
            compare(point_list, x, y, -1, -1, width, height)
            compare(point_list, x, y, 1, -1, width, height)
    
    for y in range(height - 1, -1, -1):
        compare(point_list, x, y, 1, 0, width, height)

    for x in range(width - 1, -1, -1):
        for y in range(height - 1, -1, -1):
            compare(point_list, x, y, 1, 0, width, height)
            compare(point_list, x, y, 0, 1, width, height)
            compare(point_list, x, y, -1, 1, width, height)
            compare(point_list, x, y, 1, 1, width, height)
        
    for y in range(img_shape[1]):
        compare(point_list, x, y, -1, 0, width, height)
    
    max_dis = 0
    for x in range(width):
        for y in range(height):
            point = point_list[x][y]
            point_dis = get_dis(point[0], point[1])
            if point_dis > max_dis:
                max_dis = point_dis
                
            dis_img[x][y] = point_dis 
    
    #直接砍半 方便直接合并
    for x in range(width):
        for y in range(height):
            dis_img[x][y] = dis_img[x][y] / max_dis * 128
                  
    return


input_path = "D:/zhuomian/毕业/论文/picture/triangle.png"
output_path = "D:/zhuomian/毕业/论文/picture/triangle_SDF.png"

#read gray image
ori_img = cv.imread(input_path, 0)

# 高度 宽度  通道数 [0,1,2]
img_shape = ori_img.shape
img_width = img_shape[0]
img_height = img_shape[1]

inside_img = np.zeros((img_width, img_height, 3), np.uint32)
outside_img = np.zeros((img_width, img_height, 3), np.uint32)
output_img = np.zeros((img_width, img_height, 3), np.uint8)

max_num = 9999
min_num = 0

inside_list = [[[x,y] for y in range(img_height)] for x in range(img_width)]
outside_list = [[[x,y] for y in range(img_height)] for x in range(img_width)]

# inside_dict：黑填0 白填9999  outside_dict：黑填9999 白填0
for x in range(img_width):
    for y in range(img_height):
        if(ori_img[x][y] < 128):
            inside_list[x][y][0] = min_num
            inside_list[x][y][1] = min_num
            
            outside_list[x][y][0] = max_num
            outside_list[x][y][1] = max_num
        else:
            inside_list[x][y][0] = max_num
            inside_list[x][y][1] = max_num
            
            outside_list[x][y][0] = min_num
            outside_list[x][y][1] = min_num
        
generate_sdf(inside_list, img_width, img_height, inside_img)
generate_sdf(outside_list, img_width, img_height, outside_img)

for x in range(img_width):
    for y in range(img_height):
        output_img[x][y] = outside_img[x][y] + 128 - inside_img[x][y]    
        
cv.imshow("output", output_img)

cv.waitKey()

cv.imwrite(output_path, output_img)



