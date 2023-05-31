import dolfyn
from dolfyn.adp import api
import json
import datetime
import numpy as np

# ds = dolfyn.read(
#     './data/SAVE2023_4_19_9-27-03.DAT')
# print(ds['vel'].dims.tolist())
# print("########################")

# print(ds.time)

# for key in ds.data_vars.keys():
#     print(key)
#     for c in ds.data_vars[key].coords.keys():
#         print(c)
#     print(len(ds.data_vars[key]), ds.data_vars[key][0])

# print(ds.data_vars)
# for key in ds.keys():
#     print(ds.data_vars[key].coords.keys())
# print(ds.attrs)
# print(ds.coords)
# for key in ds.coords.keys():
#     print(key)
# print(ds.data_vars['vel_bt'][3][1])
# print(len(ds.data_vars['vel_bt'][0]))
# print("########################")
# print(len(ds))
# for key in ds.keys():
#     print(type(ds[key]))
# print(len(ds['time']))
# print(ds['time'])


class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            print("MyEncoder-datetime.datetime")
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, bytes):
            return str(obj, encoding='utf-8')
        if isinstance(obj, int):
            return int(obj)
        elif isinstance(obj, float):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, tuple):
            return list(obj)
        else:
            return super(MyEncoder, self).default(obj)


def execute(path, output):
    ds = dolfyn.read(path)
    res = {}
    res['attrs'] = ds.attrs
    coords = {}
    for key in ds.coords.keys():
        coords[key] = np.nan_to_num(ds[key].data)
    res['coords'] = coords
    data = {}
    for key in ds.data_vars.keys():
        obj = {
            "coords": ds[key].dims,
            "value": np.nan_to_num(ds[key].data)
        }
        data[key] = obj
    res['data'] = data

    with open(output, "w", encoding='utf-8') as f:
        json.dump(res, f, cls=MyEncoder, indent=2,
                  sort_keys=True, ensure_ascii=False)  # 写为多行

execute('./data/SAVE2023_4_19_9-27-03.DAT', 'result.json')
