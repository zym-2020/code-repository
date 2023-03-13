import json
import geojson2shp

if __name__ == '__main__':
    f = open('bridge.json', 'r', encoding='utf-8')
    content = f.read()
    bridge = json.loads(content)
    f.close()
    for polygon in bridge:
        d = {
            "type": "Feature",
            "properties": {},
            "geometry": polygon['polygon']
        }
        j = json.dumps(d)
        file = open('./jsons/' + polygon['name'] +
                    ".json", 'w', encoding='utf-8')
        file.write(j)
        file.close()
        geojson2shp.geojson2shp(
            './jsons/' + polygon['name'] + ".json", "./shpfiles/" + polygon['name'] + ".shp")
