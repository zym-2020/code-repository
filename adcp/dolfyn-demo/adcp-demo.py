import dolfyn
from dolfyn.adp import api

ds = dolfyn.read(
    './data/SAVE2023_4_19_9-27-03.DAT')

# print(ds)

print(ds.dims)
print(ds.coords)
print(ds.attrs)
print(ds.data_vars)
print("########################")
print(len(ds))
for key in ds.keys():
    print(type(ds[key]))
# print(len(ds['time']))
# print(ds['time'])