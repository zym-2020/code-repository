import dolfyn
from dolfyn.adp import api

ds = dolfyn.read(
    './data/BMS1_D_002.PD0')
dat_dolfyn = ds.velds
print(ds)
print("########################")

# print(ds.dims)
# print(ds.coords)
# print(ds.attrs)
print(ds.data_vars)

print(ds.data_vars['vel_bt'][3][1])
print(len(ds.data_vars['vel_bt'][0]))
# print("########################")
# print(len(ds))
# for key in ds.keys():
#     print(type(ds[key]))
# print(len(ds['time']))
# print(ds['time'])
