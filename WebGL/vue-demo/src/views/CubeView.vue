<template>
  <div><canvas ref="canvasDiv" width="500" height="500"></canvas></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { mat4 } from "gl-matrix";
export default defineComponent({
  setup() {
    const canvasDiv = ref<HTMLCanvasElement>();
    let webgl: WebGL2RenderingContext;
    let program: WebGLProgram;
    let modelMatrix: mat4 = mat4.create();
    let viewMatrix: mat4 = mat4.create();
    let projectMatrix: mat4 = mat4.create();

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
        uniform mat4 m_v_p_matrix;
        attribute vec4 a_color;
        varying vec4 color;
        void main() {
            gl_Position = m_v_p_matrix * a_position;
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
      if (!webgl.getShaderParameter(vertexShader!, webgl.COMPILE_STATUS))
        console.log(webgl.getShaderInfoLog(vertexShader!));
      if (!webgl.getShaderParameter(fragmentShader!, webgl.COMPILE_STATUS))
        console.log(webgl.getShaderInfoLog(fragmentShader!));

      program = webgl.createProgram()!;
      webgl.attachShader(program, vertexShader!);
      webgl.attachShader(program, fragmentShader!);
      webgl.linkProgram(program);
      webgl.useProgram(program);
    };

    const initData = () => {
      const arr = [
        0.5, 0.5, 0.5, 1, -0.5, 0.5, 0.5, 1, -0.5, -0.5, 0.5, 1, 0.5, -0.5, 0.5,
        1, 0.5, -0.5, -0.5, 1, 0.5, 0.5, -0.5, 1, -0.5, 0.5, -0.5, 1, -0.5,
        -0.5, -0.5, 1,
      ];
      const position = new Float32Array(arr);
      const positionBuffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
      webgl.bufferData(webgl.ARRAY_BUFFER, position, webgl.STATIC_DRAW);

      const aPosition = webgl.getAttribLocation(program, "a_position");
      webgl.enableVertexAttribArray(aPosition);
      webgl.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 4 * 4, 0);

      mat4.lookAt(viewMatrix, [5, 5, 5], [0, 0, 0], [0, 1, 0]);
      mat4.perspective(projectMatrix, Math.PI / 4, 1, 1, 1000);
      const mvpMatrix = mat4.create();
      mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
      mat4.multiply(mvpMatrix, projectMatrix, mvpMatrix);
      const uniformMVPMatrix = webgl.getUniformLocation(
        program,
        "m_v_p_matrix"
      );
      webgl.uniformMatrix4fv(uniformMVPMatrix, false, mvpMatrix);

      const indexArr = [
        0, 1, 2, 0, 2, 3, 6, 5, 4, 6, 4, 7, 1, 6, 7, 1, 7, 2, 0, 3, 4, 0, 4, 5,
        5, 6, 1, 5, 1, 0, 4, 7, 2, 4, 2, 3,
      ];
      const indexArray = new Uint16Array(indexArr);
      const indexBuffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      webgl.bufferData(
        webgl.ELEMENT_ARRAY_BUFFER,
        indexArray,
        webgl.STATIC_DRAW
      );

      const colorArr = [
        1.0, 0.0, 0.0, 1, 1.0, 0.0, 0.0, 1, 0.5, 0.0, 0.0, 1, 0.5, 0.0, 0.0, 1,
        0.0, 1.0, 0.0, 1, 0.0, 1.0, 0.0, 1, 0.0, 0.5, 0.0, 1, 0.0, 0.5, 0.0, 1,
        0.0, 0.0, 1.0, 1, 0.0, 0.0, 1.0, 1, 0.0, 0.0, 0.5, 1, 0.0, 0.0, 0.5, 1,
      ];
      const color = new Float32Array(colorArr);
      const colorBuffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ARRAY_BUFFER, colorBuffer);
      webgl.bufferData(webgl.ARRAY_BUFFER, color, webgl.STATIC_DRAW);
      const aColor = webgl.getAttribLocation(program, "a_color");
      webgl.enableVertexAttribArray(aColor);
      webgl.vertexAttribPointer(aColor, 4, webgl.FLOAT, false, 4 * 4, 0);
    };

    const draw = () => {
      webgl.clearColor(0, 0, 0, 1);
      webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
      webgl.enable(webgl.DEPTH_TEST);

      webgl.frontFace(webgl.CCW);
      webgl.enable(webgl.CULL_FACE);
      webgl.cullFace(webgl.BACK);
      webgl.drawElements(webgl.TRIANGLES, 36, webgl.UNSIGNED_SHORT, 0);

      mat4.rotate(modelMatrix, modelMatrix, Math.PI / 64, [1, 0, -1]);
      const mvpMatrix = mat4.create();
      mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
      mat4.multiply(mvpMatrix, projectMatrix, mvpMatrix);
      const uniformMVPMatrix = webgl.getUniformLocation(
        program,
        "m_v_p_matrix"
      );
      webgl.uniformMatrix4fv(uniformMVPMatrix, false, mvpMatrix);
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