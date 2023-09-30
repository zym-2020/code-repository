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
      if (
        !this.#gl.getShaderParameter(vertexShader!, this.#gl.COMPILE_STATUS)
      ) {
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

export const m4 = {
  perspective: function (
    fieldOfViewInRadians: number,
    aspect: number,
    near: number,
    far: number
  ) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ];
  },

  projection: function (width: number, height: number, depth: number) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      2 / depth,
      0,
      -1,
      1,
      0,
      1,
    ];
  },

  multiply: function (a: number[], b: number[]) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function (tx: number, ty: number, tz: number) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  },

  xRotation: function (angleInRadians: number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },

  yRotation: function (angleInRadians: number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },

  zRotation: function (angleInRadians: number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  scaling: function (sx: number, sy: number, sz: number) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  },

  translate: function (m: number[], tx: number, ty: number, tz: number) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function (m: number[], angleInRadians: number) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function (m: number[], angleInRadians: number) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function (m: number[], angleInRadians: number) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function (m: number[], sx: number, sy: number, sz: number) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },
};
