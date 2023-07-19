<template>
  <div class="flow-field">
    <div id="container"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import mapBoxGl, { MercatorCoordinate, MapboxOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import ComputeWorker from "worker-loader!@/worker/compute-worker.ts";
export default defineComponent({
  setup() {
    let map: mapBoxGl.Map;
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

    onMounted(() => {
      const worker: Worker = new ComputeWorker();
      worker.postMessage("开启线程");
      worker.onmessage = (e) => {
        console.log(e);
        worker.terminate();
      };
      
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