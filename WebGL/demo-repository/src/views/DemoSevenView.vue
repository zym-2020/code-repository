<template>
  <div>
    <canvas class="container" ref="container" height="500" width="800"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import m4 from "@/utils/m4z";
import axios from "axios";
export default defineComponent({
  setup() {
    const container = ref<HTMLCanvasElement>();

    let gl: WebGL2RenderingContext;

    const positionArr = [-0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5];
    const texcoordArr = [0, 0, 1, 0, 0, 50, 0, 50, 1, 0, 1, 50];

    const degToRad = (d: number) => {
      return (d * Math.PI) / 180;
    };

    const fieldOfViewRadians = degToRad(60);

    const initWebGL = () => {
      gl = container.value?.getContext("webgl2")!;
      gl.viewport(0, 0, container.value!.clientWidth, container.value!.clientHeight);
    };

    const initResource = async () => {
      const vertexScript = await axios.get("./shader/demo7.vert.glsl").then((res) => res.data);
      const fragmentScript = await axios.get("./shader/demo7.frag.glsl").then((res) => res.data);
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
      const program = gl.createProgram();
      gl.attachShader(program!, vertexShader!);
      gl.attachShader(program!, fragmentShader!);

      gl.linkProgram(program!);

      const VAO = gl.createVertexArray();
      gl.bindVertexArray(VAO);
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionArr), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 3, 0);
      const texcoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoordArr), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 2, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);

      const image = new Image();
      image.src = "./png/mip-low-res-example.png";
      return new Promise((resolve, reject) => {
        image.onload = () => {
          const texture = gl.createTexture();
        //   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.generateMipmap(gl.TEXTURE_2D);
          resolve([program, VAO, texture]);
        };
      }).then((res) => {
        return res as any[];
      });
    };

    const draw = (program: WebGLProgram, VAO: WebGLVertexArrayObject, texture: WebGLTexture) => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // turn on depth testing
      gl.enable(gl.DEPTH_TEST);

      // tell webgl to cull faces
      gl.enable(gl.CULL_FACE);

      gl.useProgram(program);
      gl.bindVertexArray(VAO);
      //   gl.bindTexture(gl.TEXTURE_2D, texture);
      //   gl.activeTexture(gl.TEXTURE0);
      const aspect = container.value!.clientWidth / container.value!.clientHeight;
      const zNear = 1;
      const zFar = 2000;
      const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
      const cameraPosition = [0, 0, 2];
      const up = [0, 1, 0];
      const target = [0, 0, 0];
      const cameraMatrix = m4.lookAt(cameraPosition, target, up);
      const viewMatrix = m4.inverse(cameraMatrix);
      const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
      const settings = [
        { x: -2, y: 1, zRot: 0, magFilter: gl.NEAREST, minFilter: gl.NEAREST },
        { x: -1, y: 1, zRot: 0, magFilter: gl.LINEAR, minFilter: gl.LINEAR },
        { x: 0, y: 1, zRot: 0, magFilter: gl.LINEAR, minFilter: gl.NEAREST_MIPMAP_NEAREST },
        { x: -2, y: -1, zRot: 1, magFilter: gl.LINEAR, minFilter: gl.LINEAR_MIPMAP_NEAREST },
        { x: -1, y: -1, zRot: 1, magFilter: gl.LINEAR, minFilter: gl.NEAREST_MIPMAP_LINEAR },
        { x: 0, y: -1, zRot: 1, magFilter: gl.LINEAR, minFilter: gl.LINEAR_MIPMAP_LINEAR },
      ];
      const xSpacing = 1.0;
      const ySpacing = 0.7;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const textureLoc = gl.getUniformLocation(program, "u_texture");
      gl.uniform1i(textureLoc, 0);
      settings.forEach((item) => {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, item.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, item.magFilter);
        let matrix = m4.translate(viewProjectionMatrix, item.x * xSpacing, item.y * ySpacing, -50 * 0.5);
        matrix = m4.zRotate(matrix, item.zRot * Math.PI);
        matrix = m4.scale(matrix, 1, 1, 50);
        const matrixLocation = gl.getUniformLocation(program, "u_matrix");
        gl.uniformMatrix4fv(matrixLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
      });

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
