<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import mapBoxGl, { MapboxOptions, CustomLayerInterface, MercatorCoordinate } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { mat4 } from "gl-matrix";
import { encodeFloatToDouble } from "@/utils/common";
export default defineComponent({
  setup() {
    let map: mapBoxGl.Map;
    const container = ref<HTMLDivElement>();

    class SymbolHandle {
      vertexScript: string | null = null;
      fragmentScript: string | null = null;
      position: number[] = [];

      rotationArray: number[] = [];

      symbolImage: HTMLImageElement | null = null;
      symbolTexture: WebGLTexture | null = null;

      symbolPixel: number;
      modelMatrix: mat4 = mat4.create();

      constructor(symbolPixel: number) {
        this.symbolPixel = symbolPixel;
        mat4.identity(this.modelMatrix);
        mat4.scale(this.modelMatrix, this.modelMatrix, [symbolPixel * window.devicePixelRatio, symbolPixel * window.devicePixelRatio, 1.0]);
      }

      async getShader(address: string, type: "vertex" | "fragment") {
        const shaderScript = await axios.get(address).then((res) => res.data);
        if (type === "vertex") this.vertexScript = shaderScript;
        else this.fragmentScript = shaderScript;
      }

      getTexture(address: string) {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.src = address;
          image.onload = () => {
            this.symbolImage = image;
            resolve(null);
          };
        });
      }
      async getData(positionJsonAddress: string) {
        const geojson = await axios.get(positionJsonAddress).then((res) => res.data);
        for (let j = 0; j < geojson.features.length; j++) {
          const item = geojson.features[j];
          const coord = MercatorCoordinate.fromLngLat({
            lng: item.geometry.coordinates[0],
            lat: item.geometry.coordinates[1],
          });
          const positionX = encodeFloatToDouble(coord.x);
          const positionY = encodeFloatToDouble(coord.y);
          this.position.push(positionX[0], positionY[0], positionX[1], positionY[1]);
          this.rotationArray.push((0 / 180) * Math.PI);
        }
      }

      myBindTexture(gl: WebGL2RenderingContext) {
        if (this.symbolImage) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          this.symbolTexture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, this.symbolTexture);

          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.symbolImage);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
      }

      generateCustomLayer(id: string, map: mapBoxGl.Map) {
        let program: WebGLProgram;
        let VAO: WebGLVertexArrayObject;
        const vertexScript = this.vertexScript;
        const fragmentScript = this.fragmentScript;
        const position = this.position;
        const rotationArray = this.rotationArray;
        const that = this;

        const result: CustomLayerInterface = {
          id: id,
          type: "custom",
          onAdd(map: mapBoxGl.Map, gl: WebGL2RenderingContext) {
            if (vertexScript && fragmentScript && position) {
              const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
              gl.shaderSource(vertexShader, vertexScript);
              gl.compileShader(vertexShader);
              if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(vertexShader!));
                throw new Error("compile shader error");
              }
              const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
              gl.shaderSource(fragmentShader, fragmentScript!);
              gl.compileShader(fragmentShader);
              program = gl.createProgram()!;
              gl.attachShader(program, vertexShader);
              gl.attachShader(program, fragmentShader);
              gl.linkProgram(program);

              VAO = gl.createVertexArray()!;
              gl.bindVertexArray(VAO);
              const VBO = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...position, ...rotationArray]), gl.DYNAMIC_DRAW);
              gl.enableVertexAttribArray(0);
              gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 4 * 4, 0);
              gl.vertexAttribDivisor(0, 1);
              gl.enableVertexAttribArray(1);
              gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 4, 4 * 4 * rotationArray.length);
              gl.vertexAttribDivisor(2, 1);
              gl.bindBuffer(gl.ARRAY_BUFFER, null);
              gl.bindVertexArray(null);

              that.myBindTexture.call(that, gl);
            }
          },
          render(gl: WebGL2RenderingContext, matrix: number[]) {
            gl.useProgram(program);
            const uSymbolMatrix = gl.getUniformLocation(program, "u_symbolMatrix");
            gl.uniformMatrix4fv(uSymbolMatrix, false, that.modelMatrix);
            const uBufferSize = gl.getUniformLocation(program, "u_bufferSize");
            gl.uniform2f(uBufferSize, gl.canvas.width, gl.canvas.height);
            const center = map.getCenter();
            const mercatorCenter = mapBoxGl.MercatorCoordinate.fromLngLat({
              lng: center.lng,
              lat: center.lat,
            });
            const mercatorCenterX = encodeFloatToDouble(mercatorCenter.x);
            const mercatorCenterY = encodeFloatToDouble(mercatorCenter.y);
            const uMercatorCenterHigh = gl.getUniformLocation(program, "u_mercatorCenterHigh");
            gl.uniform2f(uMercatorCenterHigh, mercatorCenterX[0], mercatorCenterY[0]);
            const uMercatorCenterLow = gl.getUniformLocation(program, "u_mercatorCenterLow");
            gl.uniform2f(uMercatorCenterLow, mercatorCenterX[1], mercatorCenterY[1]);
            const uMatrix = gl.getUniformLocation(program, "u_matrix");
            const relativeToEyeMatrix = matrix.slice();
            relativeToEyeMatrix[12] += relativeToEyeMatrix[0] * mercatorCenter.x + relativeToEyeMatrix[4] * mercatorCenter.y;
            relativeToEyeMatrix[13] += relativeToEyeMatrix[1] * mercatorCenter.x + relativeToEyeMatrix[5] * mercatorCenter.y;
            relativeToEyeMatrix[14] += relativeToEyeMatrix[2] * mercatorCenter.x + relativeToEyeMatrix[6] * mercatorCenter.y;
            relativeToEyeMatrix[15] += relativeToEyeMatrix[3] * mercatorCenter.x + relativeToEyeMatrix[7] * mercatorCenter.y;
            gl.uniformMatrix4fv(uMatrix, false, relativeToEyeMatrix);

            gl.bindVertexArray(VAO);
            const symbolTextureLoc = gl.getUniformLocation(program, "symbolTexture");
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, that.symbolTexture);
            gl.uniform1i(symbolTextureLoc, 0);

            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, that.rotationArray.length);
            // gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1);
            // gl.drawArraysInstanced(
            //   gl.POINTS,
            //   0,
            //   1,
            //   1
            // );

            gl.bindVertexArray(null);
            gl.bindTexture(gl.TEXTURE_2D, null);
          },
        };
        return result;
      }
    }
    const symbolHandle = new SymbolHandle(24);
    const initResource = async () => {
      await symbolHandle.getShader("/shader/demo11.vert.glsl", "vertex");
      await symbolHandle.getShader("/shader/demo11.frag.glsl", "fragment");
      await symbolHandle.getTexture("/png/output.png");
      await symbolHandle.getData("/json/crossroad_NJ.geojson");
    };

    const initMap = () => {
      const mapOpt: MapboxOptions & { useWebGL2: boolean } = {
        container: container.value!,
        style: "mapbox://styles/johnnyt/clblx2t3v000a14proaq4e9qv",
        center: [118.785067, 32.059148],
        zoom: 8.8,
        useWebGL2: true,
        antialias: true,
        accessToken: "pk.eyJ1Ijoiam9obm55dCIsImEiOiJja2xxNXplNjYwNnhzMm5uYTJtdHVlbTByIn0.f1GfZbFLWjiEayI6hb_Qvg",
      };
      map = new mapBoxGl.Map(mapOpt);
      map.on("load", () => {
        map.addLayer(symbolHandle.generateCustomLayer("symbol", map));
      });
    };
    onMounted(async () => {
      await initResource();
      initMap();
    });

    return { container };
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: 800px;
}
</style>
