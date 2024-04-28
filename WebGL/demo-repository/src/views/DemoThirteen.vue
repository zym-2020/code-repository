<template>
  <div>
    <canvas ref="container" width="729" height="727"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
export default defineComponent({
  setup() {
    const container = ref<HTMLCanvasElement>();

    let gl: WebGL2RenderingContext;

    const initWebGL = () => {
      gl = container.value?.getContext("webgl2")!;
      gl.viewport(0, 0, container.value!.clientWidth, container.value!.clientHeight);
    };

    const initResource: () => Promise<any[]> = async () => {
      const position = [];
      for (let i = 0; i < 180; i++) {
        for (let j = 0; j < 360; j++) {
          position.push(j, i);
        }
      }
      const vertexScript = await axios.get("./shader/demo13.vert.glsl").then((res) => res.data);
      const fragmentScript = await axios.get("./shader/demo13.frag.glsl").then((res) => res.data);
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vertexShader!, vertexScript);
      gl.shaderSource(fragmentShader!, fragmentScript);
      gl.compileShader(vertexShader!);
      gl.compileShader(fragmentShader!);
      if (!gl.getShaderParameter(vertexShader!, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader!));
        throw new Error("compile shader error");
      }
      const program = gl.createProgram();
      gl.attachShader(program!, vertexShader!);
      gl.attachShader(program!, fragmentShader!);

      gl.linkProgram(program!);

      const VAO = gl.createVertexArray();
      gl.bindVertexArray(VAO);
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);

      const image = new Image();
      image.src = "./png/custom_image.png";
      return new Promise((resolve, reject) => {
        image.decode().then(() => {
          const texture = gl.createTexture();
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          resolve([program, VAO, texture]);
        });
        // image.onload = () => {
        //   const texture = gl.createTexture();
        //   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        //   gl.activeTexture(gl.TEXTURE0);
        //   gl.bindTexture(gl.TEXTURE_2D, texture);
        //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //   resolve([program, VAO, texture]);
        // };
      }).then((res) => {
        return res as any[];
      });
    };

    const draw = (program: WebGLProgram, VAO: WebGLVertexArrayObject, texture: WebGLTexture) => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(VAO);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.activeTexture(gl.TEXTURE0);
      const textureLoc = gl.getUniformLocation(program, "tex");
      gl.uniform1i(textureLoc, 0);
      gl.drawArrays(gl.POINTS, 0, 360 * 180);
      gl.bindVertexArray(null);
      gl.bindTexture(gl.TEXTURE_2D, null);
    };

    onMounted(async () => {
      initWebGL();
      const [program, VAO, texture] = await initResource();
      draw(program, VAO, texture);
    });

    return { container };
  },
});
</script>

<style></style>
