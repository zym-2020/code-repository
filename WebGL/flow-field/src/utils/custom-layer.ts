import { CustomLayerInterface, Map, MercatorCoordinate } from "mapbox-gl";

class FlowFieldLayer implements CustomLayerInterface {
  id: string;
  type: "custom" = "custom";
  vertexScript: string;
  fragmentScript: string;
  positionImage: HTMLImageElement;
  projectionImage: HTMLImageElement;

  positionTexture: WebGLTexture = 0
  projectionTexture: WebGLTexture = 0
  customProgram: WebGLProgram | null = null;
  VAO: WebGLVertexArrayObject | null = null;
  VBO: WebGLBuffer | null = null;

  constructor(
    id: string,
    vertexScript: string,
    fragmentScript: string,
    positionImage: HTMLImageElement,
    projectionImage: HTMLImageElement
  ) {
    this.id = id;
    this.vertexScript = vertexScript;
    this.fragmentScript = fragmentScript;
    this.positionImage = positionImage;
    this.projectionImage = projectionImage;
  }

  onAdd(map: Map, gl: WebGL2RenderingContext): void {
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

    this.positionTexture = loadTexture(this.positionImage, 0, gl)!
    this.projectionTexture = loadTexture(this.projectionImage, 1, gl)!


  }

  render(gl: WebGL2RenderingContext, matrix: number[]): void {
    
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
