<template>
  <div><canvas ref="webglCanvas" width="500" height="500"></canvas></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
export default defineComponent({
  setup() {
    const webglCanvas = ref<HTMLCanvasElement>();
    let webgl: WebGL2RenderingContext;
    let program: WebGLProgram;
    let count: number = 0.0;

    const initWebGL = () => {
      if (webglCanvas.value) {
        webgl = webglCanvas.value.getContext("webgl2")!;
        webgl.viewport(
          0,
          0,
          webglCanvas.value.clientWidth,
          webglCanvas.value.clientHeight
        );
      }
    };

    const initShader = () => {
      const vertexScript: string = `
        attribute vec4 a_position;
        attribute vec2 uvCoord;
        varying vec2 textureCoord;
        void main() {
            gl_Position = a_position;
            textureCoord = uvCoord;
        }
        `;
      const fragmentScript: string = `
        precision mediump float;
        varying vec2 textureCoord;
        uniform sampler2D texture0;
        uniform sampler2D texture1;
        uniform float animation;
        void main() {
            vec4 color0 = texture2D(texture0, textureCoord);
            vec4 color1 = texture2D(texture1, vec2(textureCoord.x + animation, textureCoord.y));
            gl_FragColor = color0 + color1;
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

    const initData = async () => {
      const points = [
        -0.5, 0.5, 0, 1, 0, 0, 0.5, 0.5, 0, 1, 1, 0, 0.5, -0.5, 0, 1, 1, 1,
        -0.5, -0.5, 0, 1, 0, 1,
      ];
      const position = new Float32Array(points);
      const positionBuffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
      webgl.bufferData(webgl.ARRAY_BUFFER, position, webgl.STATIC_DRAW);
      const aPosition = webgl.getAttribLocation(program, "a_position");
      webgl.enableVertexAttribArray(aPosition);
      webgl.vertexAttribPointer(aPosition, 4, webgl.FLOAT, false, 6 * 4, 0);

      const uvCoord = webgl.getAttribLocation(program, "uvCoord");
      webgl.enableVertexAttribArray(uvCoord);
      webgl.vertexAttribPointer(uvCoord, 2, webgl.FLOAT, false, 6 * 4, 4 * 4);

      const texture0 = webgl.createTexture();
      await initTexture("/1.png", texture0!);
      const texture1 = webgl.createTexture();
      await initTexture("/fog.png", texture1!);

      const uniformTexture0 = webgl.getUniformLocation(program, "texture0");
      webgl.activeTexture(webgl.TEXTURE0);
      webgl.bindTexture(webgl.TEXTURE_2D, texture0);
      webgl.uniform1i(uniformTexture0, 0);
      const uniformTexture1 = webgl.getUniformLocation(program, "texture1");
      webgl.activeTexture(webgl.TEXTURE1);
      webgl.bindTexture(webgl.TEXTURE_2D, texture1);
      webgl.uniform1i(uniformTexture1, 1);

      const animation = webgl.getUniformLocation(program, "animation");
      webgl.uniform1f(animation, count);

      const index = new Uint16Array([0, 1, 3, 1, 2, 3]);
      const indexBuffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, index, webgl.STATIC_DRAW);
    };

    const initTexture = async (pictureStr: string, texture: WebGLTexture) => {
      const image = new Image();
      image.src = pictureStr;
      await new Promise((res, rej) => {
        image.onload = () => {
          res(null);
        };
        image.onerror = () => {
          rej(null);
        };
      });
      //   webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
      webgl.bindTexture(webgl.TEXTURE_2D, texture);
      webgl.texImage2D(
        webgl.TEXTURE_2D,
        0,
        webgl.RGBA,
        webgl.RGBA,
        webgl.UNSIGNED_BYTE,
        image
      );
      webgl.texParameteri(
        webgl.TEXTURE_2D,
        webgl.TEXTURE_MAG_FILTER,
        webgl.LINEAR
      );
      webgl.texParameteri(
        webgl.TEXTURE_2D,
        webgl.TEXTURE_MIN_FILTER,
        webgl.LINEAR
      );
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.REPEAT);
      webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.REPEAT);
    };

    const draw = () => {
      webgl.clearColor(0.0, 0.0, 0.0, 1.0);
      webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
      webgl.drawElements(webgl.TRIANGLES, 6, webgl.UNSIGNED_SHORT, 0);
      count = count + 0.01;
      window.requestAnimationFrame(() => {
        const animation = webgl.getUniformLocation(program, "animation");
        webgl.uniform1f(animation, count);
        draw();
      });
    };

    onMounted(async () => {
      initWebGL();
      initShader();
      await initData();
      draw();
    });

    return { webglCanvas };
  },
});
</script>

<style lang="scss" scoped>
</style>