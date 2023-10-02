<template>
  <div>
    <canvas class="canvas" ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import m4 from "@/utils/m4z";
import { GlHandle } from "@/utils/glUtil";
import axios from "axios";
export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    let gl: WebGL2RenderingContext;
    let glHandle: GlHandle;

    function degToRad(d: number) {
      return (d * Math.PI) / 180;
    }
    const fieldOfViewRadians = degToRad(60);
    let modelXRotationRadians = degToRad(0);
    let modelYRotationRadians = degToRad(0);
    const zNear = 1;
    const zFar = 2000;
    let aspect: number;

    const translation: number[] = [-100, -100, -100];
    const cameraPosition = [0, 0, 200];
    const up = [0, 1, 0];
    const target = [0, 0, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);
    const viewMatrix = m4.inverse(cameraMatrix);

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

    const texcoord = new Float32Array([
      // left column front
      0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

      // top rung front
      0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

      // middle rung front
      0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,

      // left column back
      0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

      // top rung back
      0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

      // middle rung back
      0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

      // top
      0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

      // top rung right
      0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

      // under top rung
      0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

      // between top rung and middle
      0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

      // top of middle rung
      0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

      // right of middle rung
      0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

      // bottom of middle rung.
      0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

      // right of bottom
      0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

      // bottom
      0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

      // left side
      0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    ]);

    const initWebGL = () => {
      gl = canvas.value?.getContext("webgl2")!;
      gl.viewport(0, 0, canvas.value!.clientWidth, canvas.value!.clientHeight);
      glHandle = new GlHandle(gl);
    };

    const initResource = async () => {
      const vertexShaderScript = await axios
        .get("./shader/textureF.vert.glsl")
        .then((res) => {
          return res.data;
        });
      const fragmentShaderScript = await axios
        .get("./shader/textureF.frag.glsl")
        .then((res) => {
          return res.data;
        });
      glHandle.bindShader(vertexShaderScript, "vertex");
      glHandle.bindShader(fragmentShaderScript, "fragment");
      glHandle.createProgram();
      const matrix = m4.translate(m4.xRotation(Math.PI), -50, -75, -15);
      for (let i = 0; i < positions.length; i += 3) {
        const vector = m4.transformPoint(
          matrix,
          [positions[i + 0], positions[i + 1], positions[i + 2], 1],
          null
        );
        positions[i + 0] = vector[0];
        positions[i + 1] = vector[1];
        positions[i + 2] = vector[2];
      }
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
        texcoord,
        1,
        2,
        gl.FLOAT,
        true,
        0,
        0
      );
      glHandle.setDefaultVAO();
      const image = new Image();
      image.src = "./png/f-texture.png";
      image.onload = () => {
        glHandle.bindTexture(image, 0, "texture0");
      };
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      glHandle.useProgram();
      glHandle.bindVAO();
      glHandle.useTexture("texture0");

      const matrixLocation = glHandle.getUniformLocation("u_matrix");
      const projectionMatrix = m4.perspective(
        fieldOfViewRadians,
        aspect,
        zNear,
        zFar
      );
      const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
      modelXRotationRadians += 0.012;
      modelYRotationRadians += 0.007;
      let matrix = m4.translate(
        viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]
      );
      matrix = m4.xRotate(matrix, modelXRotationRadians);
      matrix = m4.yRotate(matrix, modelYRotationRadians);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
      gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
      requestAnimationFrame(draw);
    };

    onMounted(async () => {
      aspect = canvas.value!.clientWidth / canvas.value!.clientHeight;
      initWebGL();
      await initResource();
      draw();
    });

    return { canvas };
  },
});
</script>

<style lang="scss" scoped>
.canvas {
  width: 400px;
  height: 300px;
}
</style>