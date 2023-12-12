<template>
  <div>
    <canvas ref="container" height="500" width="800"></canvas>
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

    const initResource = async () => {
      const vertexScript = await axios.get("./shader/demo8.vert.glsl").then((res) => res.data);
      const fragmentScript = await axios.get("./shader/demo8.frag.glsl").then((res) => res.data);
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vertexShader!, vertexScript);
      gl.shaderSource(fragmentShader!, fragmentScript);
      gl.compileShader(vertexShader!);
      if (!gl.getShaderParameter(vertexShader!, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader!));
        throw new Error("compile shader error");
      }
      gl.compileShader(fragmentShader!);
      if (!gl.getShaderParameter(vertexShader!, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader!));
        throw new Error("compile shader error");
      }
      const program = gl.createProgram()!;
      gl.attachShader(program!, vertexShader!);
      gl.attachShader(program!, fragmentShader!);

      gl.linkProgram(program!);

      const positionArr = [0, 1, 2, 3, 4, 5];

      const VAO = gl.createVertexArray()!;
      gl.bindVertexArray(VAO);
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Int32Array(positionArr), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribIPointer(0, 1, gl.INT, 0, 0);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);
      return [program, VAO];
    };

    const draw = (program: WebGLProgram, VAO: WebGLVertexArrayObject) => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // turn on depth testing
      gl.enable(gl.DEPTH_TEST);

      // tell webgl to cull faces
      gl.enable(gl.CULL_FACE);

      gl.useProgram(program);
      gl.bindVertexArray(VAO);
      const positionXLoc = gl.getUniformLocation(program, "position_x");
      const positionYLoc = gl.getUniformLocation(program, "position_y");
      gl.uniform1fv(positionXLoc, [0.7, 0.6, 0.5, 0.4, 0.3, 0.2]);
      gl.uniform1fv(positionYLoc, [0.7, 0.6, 0.5, 0.4, 0.3, 0.2]);
      gl.bindVertexArray(VAO);
      gl.drawArrays(gl.POINTS, 0, 1 * 6);
      gl.bindVertexArray(null);
    };

    onMounted(async () => {
      initWebGL();
      const [program, VAO] = await initResource();
      
      draw(program, VAO);
      
    });

    return { container };
  },
});
</script>

<style scoped lang="scss"></style>
