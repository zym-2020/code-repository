import matplotlib.pyplot as plt
import numpy as np

# 生成符号的顶点数量数据（随机生成示例数据）
np.random.seed(42)
vertex_counts = np.random.randint(1, 1000, size=509193)

# 设置直方图的边界和区间数量
bin_edges = np.linspace(0, 1000, 51)  # 设置边界为0到1000，分为50个区间

# 绘制直方图
plt.hist(vertex_counts, bins=bin_edges, edgecolor='black')

# 设置x轴和y轴标签
plt.xlabel('Vertex Count')
plt.ylabel('Number of Symbols')

# 设置x轴和y轴的范围
plt.xlim(0, 1000)
plt.ylim(0, 55000)

# 绘制95%范围内的区域
plt.axvspan(50, 500, alpha=0.3, color='gray')

# 显示图形
plt.show()
