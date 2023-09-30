<template>
  <div>
    <canvas class="canvas" ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { GlHandle, m4 } from "@/utils/glUtil";
import axios from "axios";

export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    let gl: WebGL2RenderingContext;
    let glHandle: GlHandle;
    const positions = new Float32Array([
      // left column front
      0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

      // top rung front
      30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

      // middle rung front
      30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

      // left column back
      0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

      // top rung back
      30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

      // middle rung back
      30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

      // top
      0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

      // top rung right
      100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

      // under top rung
      30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

      // between top rung and middle
      30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

      // top of middle rung
      30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

      // right of middle rung
      67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

      // bottom of middle rung.
      30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

      // right of bottom
      30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

      // bottom
      0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

      // left side
      0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
    ]);

    const colors = new Uint8Array([
      // left column front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // top rung front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // middle rung front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // left column back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // top rung back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // middle rung back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // top
      70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70,
      200, 210,

      // top rung right
      200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
      200, 70,

      // under top rung
      210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210,
      100, 70,

      // between top rung and middle
      210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
      160, 70,

      // top of middle rung
      70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70,
      180, 210,

      // right of middle rung
      100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100,
      70, 210,

      // bottom of middle rung.
      76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76,
      210, 100,

      // right of bottom
      140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140,
      210, 80,

      // bottom
      90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90,
      130, 110,

      // left side
      160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220,
      160, 160, 220,
    ]);

    const degToRad = (d: number) => {
      return (d * Math.PI) / 180;
    };
    let fieldOfViewRadians = degToRad(60);
    let translation: number[] = [-150, -50, -360];
    const rotationValue = [190, 40, 30];

    let scale = [1, 1, 1];
    let rotationSpeed = 1.2;

    const initWebGL = () => {
      gl = canvas.value?.getContext("webgl2")!;
      gl.viewport(0, 0, canvas.value!.clientWidth, canvas.value!.clientHeight);
      glHandle = new GlHandle(gl);
    };

    const initResource = async (
      vertexShaderAddress: string,
      fragmentShaderAddress: string
    ) => {
      const vertexShaderSource = await axios
        .get(vertexShaderAddress)
        .then((res) => res.data);
      const fragmentShaderSource = await axios
        .get(fragmentShaderAddress)
        .then((res) => res.data);
      glHandle.bindShader(vertexShaderSource, "vertex");
      glHandle.bindShader(fragmentShaderSource, "fragment");
      glHandle.createProgram();
      glHandle.bindVBO(
        gl.ARRAY_BUFFER,
        gl.STATIC_DRAW,
        positions,
        0,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );
      glHandle.bindVBO(
        gl.ARRAY_BUFFER,
        gl.STATIC_DRAW,
        colors,
        1,
        3,
        gl.UNSIGNED_BYTE,
        true,
        0,
        0
      );
      glHandle.setDefaultVAO();
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      glHandle.useProgram();
      glHandle.bindVAO();

      const aspect = canvas.value!.clientWidth / canvas.value!.clientHeight;
      const zNear = 1;
      const zFar = 2000;
      let matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
      let rotation = [
        degToRad(rotationValue[0]),
        degToRad(rotationValue[1]),
        degToRad(rotationValue[2]),
      ];

      matrix = m4.translate(
        matrix,
        translation[0],
        translation[1],
        translation[2]
      );
      matrix = m4.xRotate(matrix, rotation[0]);
      matrix = m4.yRotate(matrix, rotation[1]);
      matrix = m4.zRotate(matrix, rotation[2]);
      matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

      gl.uniformMatrix4fv(
        glHandle.getUniformLocation("u_matrix"),
        false,
        matrix
      );
      gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
      requestAnimationFrame(() => {
        rotationValue[1] += rotationSpeed;
        draw();
      });
    };

    onMounted(async () => {
      initWebGL();
      await initResource(
        `./shader/drawF.vert.glsl`,
        `./shader/drawF.frag.glsl`
      );
      draw();
    });
    return { canvas };
  },
});
</script>

<style lang="scss" scoped>
.canvas {
  height: 300px;
  width: 400px;
}
</style>