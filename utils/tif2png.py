from osgeo import gdal

input_tiff = "CJ.tif"
output_png = "output.png"

ds = gdal.Open(input_tiff)
gdal.Translate(output_png, ds, format='PNG')

# 关闭数据集
ds = None