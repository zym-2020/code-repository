<template>
  <div><canvas class="container" ref="container" width="400" height="300"></canvas></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { GlHandle } from "@/utils/glUtil";
import { mat4 } from "gl-matrix";
import axios from "axios";
export default defineComponent({
  setup() {
    const container = ref<HTMLCanvasElement>();
    let gl: WebGL2RenderingContext;
    let glHandle: GlHandle;

    const positionArray: number[] = [100, 100, 20];

    const initWebGL = () => {
      gl = container.value!.getContext("webgl2")!;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      // gl.clearColor(0, 0, 0, 1);
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // gl.enable(gl.DEPTH_TEST);
      // gl.enable(gl.CULL_FACE);
      glHandle = new GlHandle(gl);
    };

    const initResource = async () => {
      const vertexScript = await axios.get(`/shader/demo5Draw.vert.glsl`).then((res) => res.data);
      const fragmentScript = await axios.get(`/shader/demo5Draw.frag.glsl`).then((res) => res.data);
      glHandle.bindShader(vertexScript, "vertex");
      glHandle.bindShader(fragmentScript, "fragment");
      glHandle.createProgram();
      glHandle.bindVBO(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW, new Float32Array(positionArray), 0, 3, gl.FLOAT, false, 3 * 4, 0);
      glHandle.setDefaultVAO();
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      glHandle.useProgram();
      
      const matrix = mat4.perspective(mat4.create(), 0, container.value!.clientWidth / container.value!.clientHeight, 1, 2000);
      console.log(matrix)
      const matrixLoc = glHandle.getUniformLocation("u_matrix");
      gl.uniformMatrix4fv(matrixLoc, false, matrix);
      glHandle.bindVAO();
      gl.drawArrays(gl.POINTS, 0, positionArray.length / 3);
    };

    const addEvent = () => {
      container.value?.addEventListener("click", (e) => {
        positionArray.push(e.clientX, e.clientY, 20);
        glHandle.bindVBO(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW, new Float32Array(positionArray), 0, 3, gl.FLOAT, false, 3 * 4, 0);
        draw();
      });
    };

    onMounted(async () => {
      initWebGL();
      await initResource();
      // addEvent();
      draw();
    });

    return { container };
  },
});
</script>

<style lang="scss" scoped></style>
