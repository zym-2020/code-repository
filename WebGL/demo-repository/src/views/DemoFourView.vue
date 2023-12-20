<template>
  <div>
    <canvas class="container" ref="canvas" height="300" width="400"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { GlHandle } from "@/utils/glUtil";
import m4 from "@/utils/m4z.js";
import axios from "axios";
export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    let gl: WebGL2RenderingContext;
    let glHandle: GlHandle;
    let time = 0.001;

    const initWebGL = () => {
      gl = canvas.value?.getContext("webgl2")!;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      glHandle = new GlHandle(gl);
    };
    const position = [
      -0.1, 0.4, -0.1, -0.4, 0.1, -0.4, -0.1, 0.4, 0.1, -0.4, 0.1, 0.4, -0.4,
      -0.1, 0.4, -0.1, -0.4, 0.1, -0.4, 0.1, 0.4, -0.1, 0.4, 0.1,
    ];
    const colors = [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1];

    let matrixBuffer: WebGLBuffer;

    const initResource = async () => {
      const vertexScript = await axios
        .get("./shader/instancedDraw.vert.glsl")
        .then((res) => res.data);
      const fragmentScript = await axios
        .get("./shader/instancedDraw.frag.glsl")
        .then((res) => res.data);
      glHandle.bindShader(vertexScript, "vertex");
      glHandle.bindShader(fragmentScript, "fragment");
      glHandle.createProgram();
      glHandle.bindVBO(
        gl.ARRAY_BUFFER,
        gl.STATIC_DRAW,
        new Float32Array(position),
        0,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      glHandle.bindVBO(
        gl.ARRAY_BUFFER,
        gl.STATIC_DRAW,
        new Float32Array(colors),
        1,
        4,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.vertexAttribDivisor(1, 1);

      matrixBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, 4 * 16 * 5, gl.DYNAMIC_DRAW);

      const bytesPerMatrix = 4 * 16;
      for (let i = 0; i < 4; ++i) {
        const loc = 2 + i;
        gl.enableVertexAttribArray(loc);
        const offset = i * 16;
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, offset);
        gl.vertexAttribDivisor(loc, 1);
      }
      glHandle.setDefaultVAO();
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      glHandle.useProgram();
      glHandle.bindVAO();

      const matrices = [
        m4.identity(),
        m4.identity(),
        m4.identity(),
        m4.identity(),
        m4.identity(),
      ];
      const matrixData: number[] = [];

      matrices.forEach((mat, ndx) => {
        m4.translation(-0.5 + ndx * 0.25, 0, 0, mat);
        m4.zRotate(mat, time * (0.1 + 0.1 * ndx), mat);
        matrixData.push(...mat);
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(matrixData));
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 12, 5);
      requestAnimationFrame(() => {
        time += 0.1;
        draw();
      });
    };

    onMounted(async () => {
      initWebGL();
      await initResource();
      draw();
    });

    return { canvas };
  },
});
</script>

<style lang="scss" scoped>
</style>