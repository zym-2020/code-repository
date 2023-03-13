import geopandas as gpd

def geojson2shp(geojson_file, shp_file):
    out_data = gpd.read_file(geojson_file)
    out_data.to_file(shp_file, driver='ESRI Shapefile', encoding='utf-8')


def shp2geojson(geojson_file, shp_file):
    out_data = gpd.read_file(shp_file)
    crs = out_data.crs
    out_data = gpd.GeoSeries(out_data.geometry, crs=crs).simplify(tolerance=0.0002)
    out_data.to_file(geojson_file, driver='GeoJSON', encoding="utf-8")