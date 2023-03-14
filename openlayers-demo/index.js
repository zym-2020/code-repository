import Map from "./node_modules/ol/Map.js";
import View from "./node_modules/ol/View.js";
import XYZ from "./node_modules/ol/source/XYZ.js";
import TileLayer from "./node_modules/ol/layer/Tile.js";
import { defaults as defaultControls } from "./node_modules/ol/control/defaults.js";
console.log(1);
const map = new Map({
  target: "map",
  view: new View({
    center: [120.851, 31.864],
    zoom: 12,
    projection: "EPSG:4326",
  }),
  layers: [
    // new TileLayer({
    //   source: new XYZ({
    //     url: "http://t0.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=35a94ab5985969d0b93229c30db6abd6",
    //     projection: "EPSG:4326",
    //   }),
    // }),
    new TileLayer({
      source: new XYZ({
        url: "http://localhost:8002/multiSource/seaChart/yangtze/{x}/{y}/{z}",
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
