<template>
  <canvas ref="container" width="400" height="300"></canvas>
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

    const sampleArray = [914, 618, 0, 1, 914, 618, 1, 1, 914, 618, 2, 1, 914, 618, 3, 1, 914, 618, 4, 1, 914, 618, 5, 1, 914, 618, 6, 1, 914, 618, 7, 1, 914, 618, 8, 1, 914, 618, 9, 1];

    const initWebGL = () => {
      gl = container.value?.getContext("webgl2")!;
      gl.viewport(0, 0, container.value!.clientWidth, container.value!.clientHeight);
      glHandle = new GlHandle(gl);
    };

    const initResource = async () => {
      const vertexShaderScript = await axios.get("./shader/symbol.vert.glsl").then((res) => {
        return res.data;
      });
      const fragmentShaderScript = await axios.get("./shader/symbol.frag.glsl").then((res) => {
        return res.data;
      });
      glHandle.bindShader(vertexShaderScript, "vertex");
      glHandle.bindShader(fragmentShaderScript, "fragment");
      glHandle.createProgram();

      glHandle.bindVBO(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(sampleArray), 0, 4, gl.FLOAT, false, 4 * 4, 0);
      gl.vertexAttribDivisor(0, 1);
      glHandle.setDefaultVAO();

      const symbolImage = new Image();
      symbolImage.src = "./png/strip.png";
      await new Promise((resolve, reject) => {
        symbolImage.onload = () => {
          glHandle.bindTexture(symbolImage, "texture0");
          console.log(1);
          resolve(null);
        };
      });

      const paletteImage = new Image();
      paletteImage.src = "./png/palette.png";
      await new Promise((resolve, reject) => {
        paletteImage.onload = () => {
          glHandle.bindTexture(paletteImage, "texture1");
          console.log(2);
          resolve(null);
        };
      });
    };

    const draw = () => {
      console.log(3);
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // gl.enable(gl.DEPTH_TEST);
      // gl.enable(gl.CULL_FACE);
      glHandle.useProgram();
      glHandle.bindVAO();
      const symbolTextureLoc = glHandle.getUniformLocation("symbolTexture");
      gl.activeTexture(gl.TEXTURE0)
      glHandle.useTexture("texture0");
      gl.uniform1i(symbolTextureLoc, 0);
      const paletteTextureLoc = glHandle.getUniformLocation("paletteTexture");
      gl.activeTexture(gl.TEXTURE1)
      glHandle.useTexture("texture1");
      gl.uniform1i(paletteTextureLoc, 1);

      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 64, 10);

      // requestAnimationFrame(draw);
    };

    onMounted(async () => {
      initWebGL();
      await initResource();
      draw();
    });

    return { container };
  },
});
</script>

<style></style>
