import { mat4 } from "gl-matrix";
import { CustomLayerInterface, MercatorCoordinate } from "mapbox-gl";

export class TempCustomLayer {
  id: string;
  type: "custom";
  vertexScript: string;
  fragmentScript: string;
  customProgram: WebGLProgram | null;
  sampleInfoArray: number[];
  positionArray: number[];
  rotationArray: number[];
  symbolImage: HTMLImageElement;
  paletteImage: HTMLImageElement;

  constructor(
    id: string,
    vertexScript: string,
    fragmentScript: string,
    sampleInfoArray: number[],
    positionArray: number[],
    rotationArray: number[],
    symbolImage: HTMLImageElement,
    paletteImage: HTMLImageElement
  ) {
    this.id = id;
    this.vertexScript = vertexScript;
    this.fragmentScript = fragmentScript;
    this.customProgram = null;
    this.type = "custom";
    this.sampleInfoArray = sampleInfoArray;
    this.positionArray = positionArray;
    this.rotationArray = rotationArray;
    this.symbolImage = symbolImage;
    this.paletteImage = paletteImage;
  }

  onRemove(map: mapboxgl.Map, gl: WebGL2RenderingContext) {}

  async onAdd(map: mapboxgl.Map, gl: WebGL2RenderingContext) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader!, this.vertexScript);
    gl.shaderSource(fragmentShader!, this.fragmentScript);
    gl.compileShader(vertexShader!);
    gl.compileShader(fragmentShader!);
    if (!gl.getShaderParameter(vertexShader!, gl.COMPILE_STATUS))
      console.log(gl.getShaderInfoLog(vertexShader!));
    if (!gl.getShaderParameter(fragmentShader!, gl.COMPILE_STATUS))
      console.log(gl.getShaderInfoLog(fragmentShader!));
    this.customProgram = gl.createProgram();
    gl.attachShader(this.customProgram!, vertexShader!);
    gl.attachShader(this.customProgram!, fragmentShader!);
    gl.linkProgram(this.customProgram!);
  }

  prerender(gl: WebGL2RenderingContext, matrix: number[]) {
    const helsinki = MercatorCoordinate.fromLngLat({
      lng: 121.194953,
      lat: 31.786604,
    });

    // const VAO = gl.createVertexArray();
    // gl.bindVertexArray(VAO);
    const VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([helsinki.x, helsinki.y]),
      gl.STATIC_DRAW
    );

    if (this.customProgram) {
      gl.useProgram(this.customProgram);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 2, 0);

      const uMatrix = gl.getUniformLocation(this.customProgram, "u_matrix");
      gl.uniformMatrix4fv(uMatrix, false, matrix);
    }

    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // gl.bindVertexArray(null);
  }
  render(gl: WebGL2RenderingContext, matrix: number[]) {
    console.log(gl);
    if (this.customProgram) {
      gl.useProgram(this.customProgram);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
}

const loadTexture = (
  image: HTMLImageElement,
  index: number,
  gl: WebGL2RenderingContext
) => {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};
