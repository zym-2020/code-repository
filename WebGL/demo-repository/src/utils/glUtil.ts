export class GlHandle {
  #gl: WebGL2RenderingContext;
  #vertextShader: WebGLShader | null = null;
  #fragmentShader: WebGLShader | null = null;
  #program: WebGLProgram | null = null;
  #VAO: WebGLVertexArrayObject | null = null;
  #map: Map<any, any> = new Map();
  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;
    this.#VAO = this.#gl.createVertexArray();
  }

  bindShader(shader: string, type: "vertex" | "fragment") {
    if (type === "vertex") {
      const vertexShader = this.#gl.createShader(this.#gl.VERTEX_SHADER);
      this.#gl.shaderSource(vertexShader!, shader);
      this.#gl.compileShader(vertexShader!);
      if (!this.#gl.getShaderParameter(vertexShader!, this.#gl.COMPILE_STATUS)) {
        console.log(this.#gl.getShaderInfoLog(vertexShader!));
        throw new Error("compile shader error");
      }

      this.#vertextShader = vertexShader;
    }
    if (type === "fragment") {
      const fragmentShader = this.#gl.createShader(this.#gl.FRAGMENT_SHADER);
      this.#gl.shaderSource(fragmentShader!, shader);
      this.#gl.compileShader(fragmentShader!);
      if (
        !this.#gl.getShaderParameter(fragmentShader!, this.#gl.COMPILE_STATUS)
      )
        throw new Error("compile shader error");
      this.#fragmentShader = fragmentShader;
    }
  }

  createProgram() {
    this.#program = this.#gl.createProgram();
    if (this.#vertextShader && this.#fragmentShader && this.#program) {
      this.#gl.attachShader(this.#program, this.#vertextShader);
      this.#gl.attachShader(this.#program, this.#fragmentShader);
      this.#gl.linkProgram(this.#program);
    } else throw new Error("create program error");
  }

  useProgram() {
    this.#gl.useProgram(this.#program);
  }

  bindVAO() {
    this.#gl.bindVertexArray(this.#VAO);
  }

  setDefaultVAO() {
    this.#gl.bindVertexArray(null);
  }

  bindVBO(
    bufferType: number,
    usage: number,
    value: ArrayBuffer,
    index: number,
    size: number,
    type: number,
    normalize: boolean,
    stride: number,
    offset: number
  ) {
    const VBO = this.#gl.createBuffer();
    this.bindVAO();
    this.#gl.bindBuffer(bufferType, VBO);
    this.#gl.bufferData(bufferType, value, usage);
    this.#gl.enableVertexAttribArray(index);
    this.#gl.vertexAttribPointer(index, size, type, normalize, stride, offset);
  }

  bindTexture(image: HTMLImageElement, index: number, id: string) {
    const texture = this.#gl.createTexture();
    this.#gl.activeTexture(this.#gl.TEXTURE0 + index);
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);
    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,
      0,
      this.#gl.RGBA,
      this.#gl.RGBA,
      this.#gl.UNSIGNED_BYTE,
      image
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_WRAP_S,
      this.#gl.CLAMP_TO_EDGE
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_WRAP_T,
      this.#gl.CLAMP_TO_EDGE
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MIN_FILTER,
      this.#gl.LINEAR
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MAG_FILTER,
      this.#gl.LINEAR
    );
    this.#map.set(id, texture);
  }

  getUniformLocation = (name: string) => {
    return this.#gl.getUniformLocation(this.#program!, name);
  };
}
