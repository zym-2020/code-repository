<template>
  <div><canvas ref="canvasDiv" width="500" height="500"></canvas></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import { mat4, vec3 } from "gl-matrix";
export default defineComponent({
  setup() {
    const canvasDiv = ref<HTMLCanvasElement>();
    let webgl: WebGL2RenderingContext;
    let program: WebGLProgram;
    let modelMatrix: mat4 = mat4.create();
    let viewMatrix: mat4 = mat4.create();
    let mvMatrix: mat4 = mat4.create();

    const initWebGL = () => {
      if (canvasDiv.value) {
        webgl = canvasDiv.value.getContext("webgl2")!;
        webgl.viewport(
          0,
          0,
          canvasDiv.value.clientWidth,
          canvasDiv.value.clientHeight
        );
      }
    };

    const initShader = () => {
      const vertexScript = `
        attribute vec4 a_position;
        attribute vec4 a_color;
        uniform mat4 mv_formMatrix;
        varying vec4 color;
        void main() {
            gl_Position = mv_formMatrix * a_position;
            color = a_color;
        }
        `;
      const fragmentScript = `
        precision mediump float;
        varying vec4 color;
        void main() {
            gl_FragColor = color;
        }
        `;
      const vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
      const fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
      webgl.shaderSource(vertexShader!, vertexScript);
      webgl.shaderSource(fragmentShader!, fragmentScript);
      webgl.compileShader(vertexShader!);
      webgl.compileShader(fragmentShader!);
      if (!webgl.getShaderParameter(vertexShader!, webgl.COMPILE_STATUS)) {
        console.log(webgl.getShaderInfoLog(vertexShader!));
      }
      if (!webgl.getShaderParameter(fragmentShader!, webgl.COMPILE_STATUS)) {
        console.log(webgl.getShaderInfoLog(fragmentShader!));
      }

      program = webgl.createProgram()!;
      webgl.attachShader(program, vertexShader!);
      webgl.attachShader(program, fragmentShader!);
      webgl.linkProgram(program);
      webgl.useProgram(program);
    };

    const initData = () => {
      const arr = [
        0.5, 0.0, -0.1, 1, 1.0, 0.0, 0.0, 1, 0.0, 0.0, -0.1, 1, 1.0, 0.0, 0.0,
        1, 0.0, 0.5, -0.1, 1, 1.0, 0.0, 0.0, 1,

        0.5, 0.0, 0.0, 1, 0.0, 1.0, 0.0, 1, 0.0, 0.0, 0.0, 1, 0.0, 1.0, 0.0, 1,
        0.0, 0.5, 0.0, 1, 0.0, 1.0, 0.0, 1,

        0.5, 0.0, 0.1, 1, 0.0, 0.0, 1.0, 1, 0.0, 0.0, 0.1, 1, 0.0, 0.0, 1.0, 1,
        0.0, 0.5, 0.1, 1, 0.0, 0.0, 1.0, 1,
      ];
      const position = new Float32Array(arr);
      const positionBuffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
      webgl.bufferData(webgl.ARRAY_BUFFER, position, webgl.STATIC_DRAW);

      const aPosition = webgl.getAttribLocation(program, "a_position");
      webgl.enableVertexAttribArray(aPosition);
      webgl.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 8 * 4, 0);

      const aColor = webgl.getAttribLocation(program, "a_color");
      webgl.enableVertexAttribArray(aColor);
      webgl.vertexAttribPointer(aColor, 4, webgl.FLOAT, false, 8 * 4, 4 * 4);

      let anglez = 0;
      let anglex = 90;
      mat4.lookAt(viewMatrix, [0.5, 0.0, 0.8], [0, 0, 0], [0, 1, 0]);
      mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
      const mvUniformMatrix = webgl.getUniformLocation(
        program,
        "mv_formMatrix"
      );
      webgl.uniformMatrix4fv(mvUniformMatrix, false, mvMatrix);

      window.addEventListener("keydown", (e) => {
        let flag = false;
        if (e.key === "ArrowUp") {
          anglez += 0.01;
          flag = true;
        } else if (e.key === "ArrowDown") {
          anglez -= 0.01;
          flag = true;
        } else if (e.key === "ArrowLeft") {
          anglex += 0.01;
          flag = true;
        } else if (e.key === "ArrowRight") {
          anglex -= 0.01;
          flag = true;
        }
        if (flag) {
          let y =
            Math.sin((anglez / 180) * Math.PI) *
            0.8 *
            Math.sin((anglex / 180) * Math.PI);
          let z = Math.cos((anglez / 180) * Math.PI) * 0.8;
          let x =
            Math.sin((anglez / 180) * Math.PI) *
            0.8 *
            Math.cos((anglex / 180) * Math.PI);
          console.log(x, y, z);
          mat4.lookAt(viewMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
          mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
          webgl.uniformMatrix4fv(mvUniformMatrix, false, mvMatrix);
        }
      });
    };

    const draw = () => {
      webgl.clearColor(0.0, 0.0, 0.0, 1.0);
      webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
      webgl.drawArrays(webgl.TRIANGLES, 0, 9);
      mat4.rotate(modelMatrix, modelMatrix, (Math.PI / 180) * 0.3, [0, 0, 1]);
      mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
      const mvUniformMatrix = webgl.getUniformLocation(
        program,
        "mv_formMatrix"
      );
      webgl.uniformMatrix4fv(mvUniformMatrix, false, mvMatrix);
      window.requestAnimationFrame(() => {
        draw();
      });
    };

    onMounted(() => {
      initWebGL();
      initShader();
      initData();
      draw();
    });

    return { canvasDiv };
  },
});
</script>

<style lang="scss" scoped>
</style>