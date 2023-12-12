# 文件名: fourier_spectrum_plot.py

import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft2, fftshift
from scipy.ndimage import rotate

# 生成一个简单的图像（黑白）
image_size = 128
image = np.zeros((image_size, image_size))
image[image_size//3:2*image_size//3, image_size//3:2*image_size//3] = 1

# 将图像旋转45度
image = rotate(image, angle=45, reshape=False)

# 计算傅里叶变换
fft_result = fft2(image)
fft_result_shifted = fftshift(fft_result)

# 计算频谱图
magnitude_spectrum = np.abs(fft_result_shifted)

# 显示原始图像
plt.subplot(121), plt.imshow(image, cmap='gray')
plt.title('Original Image'), plt.xticks([]), plt.yticks([])

# 显示傅里叶频谱图
plt.subplot(122), plt.imshow(np.log(1 + magnitude_spectrum), cmap='gray')
plt.title('Magnitude Spectrum'), plt.xticks([]), plt.yticks([])

plt.show()
