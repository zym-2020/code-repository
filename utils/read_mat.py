from scipy.io import loadmat
import netCDF4 as nc

# # 读取.mat文件
# mat_data = loadmat('')

# # 打印.mat文件中的所有变量
# print(mat_data.keys())

# 获取特定变量的值

# 处理你的数据...
# print(len(mat_data['hpre']))
# print(len(mat_data['hz']))
# print(mat_data['hz'])



# 打开NetCDF文件
netcdf_file = nc.Dataset('D:/zhuomian/20230831/adcirc_addwind.nc', 'r')

# 获取文件中的所有变量
variables = netcdf_file.variables

# 打印所有变量的名称
print("Variable names:", variables.keys())

# # 获取特定变量的值
# your_variable_data = variables['your_variable_name'][:]

# # 处理你的数据...
# # 例如，打印数据的形状
# print("Data shape:", your_variable_data.shape)

# 关闭NetCDF文件
netcdf_file.close()