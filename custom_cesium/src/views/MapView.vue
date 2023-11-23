<template>
  <div class="map" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
// import * as Cesium from "@/utils/Cesium.js";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "cesium/Build/Cesium/Widgets/widgets.css";
// import "@/utils/Cesium.js"
import { RenderObj } from "@/utils/render-util";

export default defineComponent({
  setup() {
    const container = ref<HTMLElement>();
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNjRiYjA0OS0wYTNjLTQwODItYjhmOS1kNTA3NTNlMzhiZWIiLCJpZCI6MTcxNjM3LCJpYXQiOjE2OTcxODE0NDN9.NXFWJtgHshH3lJbrl9QmfjGM3-KRRoQpy5827zZJJV0";

    const initMap = async () => {
      const view = new Cesium.Viewer(container.value!, {
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        // terrainProvider: Cesium.createWorldTerrain(),
      });
      //   view.scene.globe.show = false;
      view.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(118.81259, 32.048116, 400000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
        },
      });

      function _render_three_frame(scene: any, frustum: any, pass: any) {
        // if (pass === "SCREEN") {
        //   const gl: WebGLRenderingContext = scene.context._gl;

        //   const vertexScript = `
        //   uniform vec4 position;
          
        //   void main() {
        //       gl_Position = position;
        //       gl_PointSize = 10.0;
        //   }`;
        //   const fragmentScript = `precision highp float;

        //   void main() {
        //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        //   }`;
        //   const vShader = gl.createShader(gl.VERTEX_SHADER);
        //   const fShader = gl.createShader(gl.FRAGMENT_SHADER);
        //   gl.shaderSource(vShader!, vertexScript);
        //   gl.shaderSource(fShader!, fragmentScript);
        //   gl.compileShader(vShader!);
        //   if (!gl.getShaderParameter(vShader!, gl.COMPILE_STATUS))
        //     console.log(gl.getShaderInfoLog(vShader!));
        //   gl.compileShader(fShader!);
        //   const program = gl.createProgram()!;
        //   gl.attachShader(program, vShader!);
        //   gl.attachShader(program, fShader!);
        //   gl.linkProgram(program);
        //   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        //       console.log(gl.getProgramInfoLog(program));
        //   }

        //   gl.useProgram(program);
        //   const positionLoc = gl.getUniformLocation(program, "position");
        //   gl.uniform4fv(positionLoc, [0.5, 0.5, 0.0, 1.0]);
        //   gl.drawArrays(gl.POINTS, 0, 1);
        // }
      }
      if (!(view as any)._cesiumWidget.scene.render_external_frame_functions) (view.scene as any).render_external_frame_functions = [];
      (view as any)._cesiumWidget.scene.render_external_frame_functions.push(_render_three_frame);
    };

    onMounted(initMap);

    return { container };
  },
});
</script>

<style>
.map {
  height: 100%;
}
</style>
