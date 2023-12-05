<template>
  <div>
    <canvas class="container" ref="container" width="600" height="500"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
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
      const position = [-1, -1, 0.4, 0.3, -1, 1, 0.4, 0.6, 1, -1, 0.7, 0.3, 1, 1, 0.7, 0.6];
      const vertexScript = await axios.get("./shader/demo6.vert.glsl").then((res) => res.data);
      const fragmentScript = await axios.get("./shader/demo6.frag.glsl").then((res) => res.data);
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vertexShader!, vertexScript);
      gl.shaderSource(fragmentShader!, fragmentScript);
      gl.compileShader(vertexShader!);
      gl.compileShader(fragmentShader!);
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
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 4 * 4, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);

      const image = new Image();
      image.src = "./png/修勾.jpg";
      return new Promise((resolve, reject) => {
        image.decode().then(() => {
          const texture = gl.createTexture();
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
          
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
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(VAO);
      //   gl.bindTexture(gl.TEXTURE_2D, texture);
      //   gl.activeTexture(gl.TEXTURE0);
      const textureLoc = gl.getUniformLocation(program, "u_texture");
      gl.uniform1i(textureLoc, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(VAO);
      //   gl.bindTexture(gl.TEXTURE_2D, null);
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
