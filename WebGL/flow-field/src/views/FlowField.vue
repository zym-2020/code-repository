<template>
  <div class="flow-field">
    <div id="container"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import mapBoxGl, { MercatorCoordinate, MapboxOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { loadShader } from "@/api/request";
// import ComputeWorker from "worker-loader!@/worker/compute-worker.ts";
export default defineComponent({
  setup() {
    let map: mapBoxGl.Map;
    let vertexScript: string;
    let fragmentScript: string;
    let projectionImage: HTMLImageElement;
    let positionImage: HTMLImageElement;
    const initMap = () => {
      const mapOpt: MapboxOptions & { useWebGL2: boolean } = {
        container: "container",
        style: "mapbox://styles/johnnyt/clblx2t3v000a14proaq4e9qv",
        center: [120.862723, 31.956117],
        zoom: 8.8,
        useWebGL2: true,
        accessToken:
          "pk.eyJ1Ijoiam9obm55dCIsImEiOiJja2xxNXplNjYwNnhzMm5uYTJtdHVlbTByIn0.f1GfZbFLWjiEayI6hb_Qvg",
      };
      map = new mapBoxGl.Map(mapOpt);
    };

    const initData = async (
      vertAddress: string,
      fragAddress: string,
      projectionImageAddress: string,
      positionImageAddress: string
    ) => {
      vertexScript = await loadShader(vertAddress);
      fragmentScript = await loadShader(fragAddress);
      projectionImage.src = projectionImageAddress;
      positionImage.src = positionImageAddress;
      await new Promise((res) => {
        projectionImage.onload = () => {
          res(null);
        };
      });
      await new Promise((res) => {
        positionImage.onload = () => {
          res(null);
        };
      });
    };

    onMounted(async () => {
      // const worker: Worker = new ComputeWorker();
      // worker.postMessage("开启线程");
      // worker.onmessage = (e) => {
      //   console.log(e);
      //   worker.terminate();
      // };
      await initData(
        "/shader/test.vert.glsl",
        "/shader/test.frag.glsl",
        "/image/projection.png",
        "/image/uv_100.png"
      );

      initMap();
    });
  },
});
</script>

<style lang="scss" scoped>
.flow-field {
  height: 100%;
  #container {
    width: 100%;
    height: 100%;
  }
}
</style>