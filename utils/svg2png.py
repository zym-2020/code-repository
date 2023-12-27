import cairosvg

# 指定SVG文件路径和输出PNG文件路径
svg_file_path = 'bicycle-24.svg'
png_file_path = 'output.png'

# 使用CairoSVG进行转换
cairosvg.svg2png(url=svg_file_path, write_to=png_file_path)

print(f"Conversion complete. PNG file saved at: {png_file_path}")
