<template>
  <div class="game-view">
    <div class="title">Breakout!</div>
    <canvas ref="container" class="container" height="600" width="1000"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import axios from "axios";
export default defineComponent({
  setup() {
    const container = ref<HTMLCanvasElement>();
    const vertexScript = `#version 300 es
        layout(location = 0) in vec3 position;

        uniform float height;
        uniform float width;
        uniform float max_height;
        uniform float max_width;
        uniform vec4 color;

        out vec4 a_position;
        out vec4 a_color;

        void main()
        {
            vec2 temp_position;
            if (gl_VertexID == 0)
            {
                temp_position = position;
            } 
            else if (gl_VertexID == 1)
            {
                temp_position = vec2(position.x, position.y + height);
            }
            else if (gl_VertexID == 2)
            {
                temp_position = vec2(position.x + width, position.y + height);
            }
            else
            {
                temp_position = vec2(position.x + width, position.y);
            }
            a_position = vec4((temp_position.x * 2.0 / max_width) - 1.0, 1.0 - (temp_position.y * 2.0 / max_height), 0.0, 1.0);
            a_color = color;
        }`;
    const fragmentScript = `#version 300 es
        precision highp float;

        in vec4 a_color;

        out vec4 outColor;

        void main()
        {
            outColor = a_color;
        }`;
    let gl: WebGL2RenderingContext | null | undefined = null;
    let program: WebGLProgram | null = null;
    let VAO: WebGLVertexArrayObject | null;
    const width = 80;
    const height = 25;
    const initWebGL = () => {
      gl = container.value?.getContext("webgl2");
      gl?.viewport(0, 0, container.value!.width, container.value!.height);
    };
    const initResource = async () => {
      const vertexStr = await axios.get("/breakout.vert.glsl").then((res) => res.data);
      const fragmentStr = await axios.get("/breakout.frag.glsl").then((res) => res.data);
      if (gl) {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(vertexShader, vertexStr);
        gl.shaderSource(fragmentShader, fragmentStr);
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          const err = gl.getShaderInfoLog(vertexShader);
          console.log(err);
          return;
        }
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          const err = gl.getShaderInfoLog(fragmentShader);
          console.log(err);
          return;
        }
        program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        VAO = gl.createVertexArray();
        gl.bindVertexArray(VAO);
        const position = [];
        const intervalWidth = (1000 - 40 - width * 9) / 8;
        const intervalHeight = 15;
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 9; j++) {
            position.push(j * (width + intervalWidth) + 20, i * (height + intervalHeight) + 20);
          }
        }
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 2, 0);
        gl.vertexAttribDivisor(0, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
      }
    };
    const draw = () => {
      if (gl) {
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindVertexArray(VAO);
        const aliveBuffer = gl.createBuffer();
        const alive = new Array(54).fill(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, aliveBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(alive), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 1, gl.INT, false, 4 * 1, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        gl.useProgram(program);
        const heightLoc = gl.getUniformLocation(program!, "height");
        gl.uniform1f(heightLoc, height);
        const widthLoc = gl.getUniformLocation(program!, "width");
        gl.uniform1f(widthLoc, width);
        const maxHeightLoc = gl.getUniformLocation(program!, "max_height");
        gl.uniform1f(maxHeightLoc, 600);
        const maxWidthLoc = gl.getUniformLocation(program!, "max_width");
        gl.uniform1f(maxWidthLoc, 1000);
        const colorLoc = gl.getUniformLocation(program!, "color");
        gl.uniform4fv(colorLoc, [0.0, 0.5843, 0.82745, 1.0]);
        gl.bindVertexArray(VAO)
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 54);
        gl.bindVertexArray(null);
      }
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

<style lang="scss" scoped>
.game-view {
  height: 100%;
  background: #0095dd;
  position: relative;
  .title {
    position: absolute;
    text-align: center;
    width: 100%;
    top: calc((100% - 600px) / 2 - 80px);
    height: 80px;
    line-height: 80px;
    color: white;
    font-size: 45px;
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;
  }
  .container {
    height: 600px;
    width: 1000px;
    background: white;
    position: absolute;
    left: calc((100% - 1000px) / 2);
    top: calc((100% - 600px) / 2);
  }
}
</style>
