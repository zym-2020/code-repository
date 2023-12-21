<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import mapBoxGl, { MapboxOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
export default defineComponent({
  setup() {
    let map: mapBoxGl.Map;
    const container = ref<HTMLDivElement>();
    const initMap = () => {
      const mapOpt: MapboxOptions & { useWebGL2: boolean } = {
        container: container.value!,
        style: "mapbox://styles/johnnyt/clblx2t3v000a14proaq4e9qv",
        center: [118.785067, 32.059148],
        zoom: 8.8,
        useWebGL2: true,
        antialias: true,
        accessToken: "pk.eyJ1Ijoiam9obm55dCIsImEiOiJja2xxNXplNjYwNnhzMm5uYTJtdHVlbTByIn0.f1GfZbFLWjiEayI6hb_Qvg",
      };
      map = new mapBoxGl.Map(mapOpt);
      map.on("load", async () => {
        const res = await axios.get("/json/crossroad_NJ.geojson").then((res) => res.data);
        map.loadImage("/png/walker.png", (error, image) => {
          if (error) throw error;
          map.addImage("walker", image!);

          map.addSource("point", {
            type: "geojson",
            data: res,
            
          });
          map.addLayer({
            id: "points",
            type: "symbol",
            source: "point",
            layout: {
              "icon-image": "walker",
              "icon-size": 0.15,
            //   "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "icon-rotate": 0,
              
            },
          });
        });
      });
    };
    onMounted(() => {
      initMap();
    });

    return { container };
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: 800px;
}
</style>
