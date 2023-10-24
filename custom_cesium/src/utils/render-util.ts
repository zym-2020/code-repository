export class RenderObj {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    const vertexScript = `#version 300 es

    uniform vec4 position;
    
    void main() {
        gl_Position = position;
        gl_PointSize = 10.0;
    }`;
    const fragmentScript = `#version 300 es
    precision highp float;

    out vec4 color;
    void main() {
        color = vec4(1.0, 0.0, 0.0, 1.0);
    }`;
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vShader!, vertexScript);
    gl.shaderSource(fShader!, fragmentScript);
    gl.compileShader(vShader!);
    gl.compileShader(fShader!);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vShader!);
    gl.attachShader(this.program, fShader!);
    gl.linkProgram(this.program);
  }

  initData() {
    const positionLoc = this.gl.getUniformLocation(this.program, "position");
    this.gl.uniform4fv(positionLoc, [0.5, 0.5, 0.0, 1.0]);
  }

  draw() {
    this.gl.useProgram(this.program);
    this.initData();
    this.gl.drawArrays(this.gl.POINTS, 0, 1);
  }
}
