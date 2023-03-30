import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import TileGrid from "ol/tilegrid/TileGrid";
import { defaults as defaultControls } from "ol/control";

const map = new Map({
  target: "map",
  view: new View({
    center: [120.851, 31.864],
    zoom: 10,
    projection: "EPSG:4326",
  }),
  layers: [
    new TileLayer({
      source: new XYZ({
        // url: "http://t0.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=35a94ab5985969d0b93229c30db6abd6",
        url: `http://localhost:8002/visual/getRaster/3884904c-7fc6-4811-b3a1-588853da8942/{x}/{y}/{z}`,
        projection: "EPSG:3857",
      }),
    }),
  ],
  controls: defaultControls({
    zoom: false,
    rotate: false,
    attribution: false,
  }),
});
