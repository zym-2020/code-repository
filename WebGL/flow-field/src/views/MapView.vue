<template>
  <div class="map">
    <div class="container" ref="container"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import mapBoxGl, { MercatorCoordinate, MapboxOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CustomLayer } from "./custom-layer";
import { TempCustomLayer } from "./test-layer";
import axios from "axios";
export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement>();
    let vertexScript: string;
    let fragmentScript: string;
    const sampleInfoArray: number[] = [];
    const positionArray: number[] = [];
    const rotationArray: number[] = [];

    const symbolImage = new Image();
    const paletteIamge = new Image();

    let map: mapBoxGl.Map;

    const initMap = () => {
      const mapOpt: MapboxOptions & { useWebGL2: boolean } = {
        container: container.value!,
        style: "mapbox://styles/johnnyt/clblx2t3v000a14proaq4e9qv",
        // style: {
        //   version: 8,
        //   sources: {
        //     tdtVec: {
        //       type: "raster",
        //       tiles: [
        //         "http://t0.tianditu.com/vec_w/wmts?tk=35a94ab5985969d0b93229c30db6abd6&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
        //       ],
        //       tileSize: 256,
        //     },
        //     txt: {
        //       type: "raster",
        //       tiles: [
        //         "http://t0.tianditu.com/cva_w/wmts?tk=35a94ab5985969d0b93229c30db6abd6&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
        //       ],
        //       tileSize: 256,
        //     },
        //   },
        //   layers: [
        //     // {
        //     //   id: "tdtVec",
        //     //   type: "raster",
        //     //   source: "tdtVec",
        //     // },
        //     // {
        //     //   id: "txt",
        //     //   type: "raster",
        //     //   source: "txt",
        //     // },
        //   ],
        // },
        center: [118.785067, 32.059148],
        zoom: 8.8,
        useWebGL2: true,
        accessToken:
          "pk.eyJ1Ijoiam9obm55dCIsImEiOiJja2xxNXplNjYwNnhzMm5uYTJtdHVlbTByIn0.f1GfZbFLWjiEayI6hb_Qvg",
      };
      map = new mapBoxGl.Map(mapOpt);

      //   debugger;
      map.on("load", async () => {
        const customLayer = new CustomLayer(
          "test",
          vertexScript,
          fragmentScript,
          sampleInfoArray,
          positionArray,
          rotationArray,
          symbolImage,
          paletteIamge
        );
        map.addLayer(customLayer);
      });
    };

    const initData = async () => {
      vertexScript = await axios.get("./shader/test.vert.glsl").then((res) => {
        return res.data;
      });
      fragmentScript = await axios
        .get("./shader/test.frag.glsl")
        .then((res) => {
          return res.data;
        });

      const geo = await axios.get("./json/crossroad_NJ.geojson").then((res) => {
        return res.data;
      });
      const symbol = await axios.get("./json/tbvs.json").then((res) => {
        return res.data;
      });
      const arr = symbol.markers.description;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].name === "sidewalk_kai") {
          const instanceNum = Math.ceil(arr[i].length / 64);
          const features = geo.features;
          for (let j = 0; j < features.length; j++) {
            const coord = MercatorCoordinate.fromLngLat({
              lng: features[j].geometry.coordinates[0],
              lat: features[j].geometry.coordinates[1],
            });

            for (let k = 0; k < instanceNum; k++) {
              sampleInfoArray.push(arr[i].base, arr[i].length, k, arr[i].ID);
              positionArray.push(coord.x, coord.y);
              rotationArray.push(0);
            }
          }
          break;
        }
      }

      symbolImage.src = "/images/strip.png";
      paletteIamge.src = "./images/palette.png";

      await new Promise((res) => {
        symbolImage.onload = () => {
          res(null);
        };
      });

      await new Promise((res) => {
        paletteIamge.onload = () => {
          res(null);
        };
      });
    };

    onMounted(async () => {
      await initData();
      initMap();
    });
    return { container };
  },
});
</script>

<style lang="scss" scoped>
.map {
  height: 100%;
  .container {
    height: 100%;
  }
}
</style>