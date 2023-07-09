import { CustomLayerInterface, MercatorCoordinate } from "mapbox-gl";
import { mat4 } from "gl-matrix";

export class CustomLayer {
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
  symbolTexture: WebGLTexture = 0;
  paletteTexture: WebGLTexture = 0;
  VAO: WebGLVertexArrayObject | null = null;
  VBO: WebGLBuffer | null = null;
  modelMatrix: mat4 = mat4.create();
  frameBuffer: number[] = [];

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

    this.symbolTexture = loadTexture(this.symbolImage, 0, gl)!;
    this.paletteTexture = loadTexture(this.paletteImage, 1, gl)!;

    this.VAO = gl.createVertexArray();
    gl.bindVertexArray(this.VAO);
    this.VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      7 * 4 * this.rotationArray.length,
      gl.STATIC_DRAW
    );
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      new Float32Array(this.sampleInfoArray)
    );
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      4 * 4 * this.rotationArray.length,
      new Float32Array(this.positionArray)
    );
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      6 * 4 * this.rotationArray.length,
      new Float32Array(this.rotationArray)
    );

    const symbolPixel = 25.0;
    mat4.identity(this.modelMatrix);
    mat4.scale(this.modelMatrix, this.modelMatrix, [
      symbolPixel * window.devicePixelRatio,
      symbolPixel * window.devicePixelRatio,
      1.0,
    ]);
    this.frameBuffer.push(gl.canvas.width, gl.canvas.height);

    if (this.customProgram) {
      gl.useProgram(this.customProgram);

      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 4 * 4, 0);
      gl.vertexAttribDivisor(0, 1);

      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(
        1,
        2,
        gl.FLOAT,
        false,
        4 * 2,
        4 * 4 * this.rotationArray.length
      );
      gl.vertexAttribDivisor(1, 1);

      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(
        2,
        1,
        gl.FLOAT,
        false,
        4,
        4 * 6 * this.rotationArray.length
      );
      gl.vertexAttribDivisor(2, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  prerender(gl: WebGL2RenderingContext, matrix: number[]) {}
  render(gl: WebGL2RenderingContext, matrix: number[]) {
    if (this.customProgram) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.symbolTexture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
      gl.bindVertexArray(this.VAO);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
      gl.useProgram(this.customProgram);
      const uMatrix = gl.getUniformLocation(this.customProgram, "u_matrix");
      gl.uniformMatrix4fv(uMatrix, false, matrix);

      const uSymbolMatrix = gl.getUniformLocation(
        this.customProgram,
        "u_symbolMatrix"
      );
      gl.uniformMatrix4fv(uSymbolMatrix, false, this.modelMatrix);

      const uBufferSize = gl.getUniformLocation(
        this.customProgram,
        "u_bufferSize"
      );
      gl.uniform2f(uBufferSize, this.frameBuffer[0], this.frameBuffer[1]);

      const uniformSymbolTexture = gl.getUniformLocation(
        this.customProgram,
        "symbolTexture"
      );
      const uniformPaletteTexture = gl.getUniformLocation(
        this.customProgram,
        "paletteTexture"
      );
      gl.uniform1i(uniformSymbolTexture, 0);
      gl.uniform1i(uniformPaletteTexture, 1);

      gl.drawArraysInstanced(
        gl.TRIANGLE_STRIP,
        0,
        64,
        this.rotationArray.length
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);
      gl.bindTexture(gl.TEXTURE_2D, null);
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};
