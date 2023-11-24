import { Ref } from "vue";
class Ball {
  r: number;
  positionX: number;
  positionY: number;
  u: number;
  v: number;
  speed: number;
  constructor(r: number, positionX: number, positionY: number, u: number, v: number, speed: number) {
    this.r = r;
    this.positionX = positionX;
    this.positionY = positionY;
    this.u = u;
    this.v = v;
    this.speed = speed;
  }

  move(maxHeight: number, maxWidth: number, board: Board, brickArray: Brick[], aliveArray: number[]) {
    if (Math.abs(this.positionY - maxHeight) < this.r) console.log("game over!");
    if (isCircleRectIntersect(this.positionX, this.positionY, this.r, board.positionX, board.positionY, board.width, board.height)) this.v = this.v * -1;

    if (this.positionX < this.r || Math.abs(this.positionX - maxWidth) < this.r) this.u = this.u * -1;
    if (this.positionY < this.r) this.v = this.v * -1;
    let score = 0;
    for (let i = 0; i < brickArray.length; i++) {
      if (brickArray[i].alive === 1 && isCircleRectIntersect(this.positionX, this.positionY, this.r, brickArray[i].positionX, brickArray[i].positionY, brickArray[i].width, brickArray[i].height)) {
        score++;
        const minVertical = Math.min(Math.abs(this.positionX - brickArray[i].positionX), Math.abs(this.positionX - brickArray[i].positionX - brickArray[i].width));
        const minAcross = Math.min(Math.abs(this.positionY - brickArray[i].positionY), Math.abs(this.positionY - brickArray[i].positionY - brickArray[i].height));
        if (minVertical < minAcross) this.u = this.u * -1;
        else if (minVertical > minAcross) this.v = this.v * -1;
        else {
          this.u = this.u * -1;
          this.v = this.v * -1;
        }
        aliveArray[brickArray[i].index] = -1;
        brickArray[i].setState(-1);
      }
    }
    const right = maxWidth - this.r;
    const left = this.r;
    const top = this.r;
    if (this.positionX + this.speed * this.u < left) {
      this.positionX = left;
      this.u = this.u * -1;
    } else if (this.positionX + this.speed * this.u > right) {
      this.positionX = right;
      this.u = this.u * -1;
    } else this.positionX = this.positionX + this.speed * this.u;
    if (this.positionY + this.speed * this.v < top) {
      this.positionY = top;
      this.v = this.v * -1;
    } else this.positionY = this.positionY + this.speed * this.v;
    return score;
  }
}

class Board {
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  speed: number;
  flag: number = 0;
  constructor(positionX: number, positionY: number, width: number, height: number, speed: number) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  setFlag(flag: number) {
    this.flag = flag;
  }

  move(maxWidth: number) {
    const right = maxWidth - this.width;
    const left = 0;
    const direction = this.flag;
    if (this.positionX + direction * this.speed < left) this.positionX = left;
    else if (this.positionX + direction * this.speed > right) this.positionX = right;
    else this.positionX = this.positionX + direction * this.speed;
  }
}

class Brick {
  index: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  alive: number;
  constructor(index: number, positionX: number, positionY: number, width: number, height: number, alive: number) {
    this.index = index;
    this.positionX = positionX;
    this.positionY = positionY;
    this.width = width;
    this.height = height;
    this.alive = alive;
  }

  setState(state: 1 | -1) {
    this.alive = state;
  }
}

const vertexScript = `#version 300 es

layout(location = 0) in vec3 position;
layout(location = 1) in float alive;

uniform float height;
uniform float width;
uniform float max_height;
uniform float max_width;
uniform float r;
uniform vec2 board_center;
uniform vec2 ball_center;
uniform vec4 color;

out vec4 a_color;

void main()
{
    if (alive == -1.0)
    {
        // gl_Position = vec4((position.x * 2.0 / max_width) - 1.0, 1.0 - (position.y * 2.0 / max_height), 0.0, 1.0);
        return;
    }
    vec2 temp_position;
    if (position.z == 0.0)
    {
        if (gl_VertexID == 0)
        {
            temp_position = position.xy;
        } 
        else if (gl_VertexID == 1)
        {
            temp_position = vec2(position.x, position.y + height);
        }
        else if (gl_VertexID == 2)
        {
            temp_position = vec2(position.x + width, position.y + height);
        }
        else
        {
            temp_position = vec2(position.x + width, position.y);
        }
    }
    else if (position.z == 1.0)
    {
        if (gl_VertexID == 0)
        {
            temp_position = board_center;
        } 
        else if (gl_VertexID == 1)
        {
            temp_position = vec2(board_center.x, board_center.y + position.y);
        }
        else if (gl_VertexID == 2)
        {
            temp_position = vec2(board_center.x + position.x, board_center.y + position.y);
        }
        else
        {
            temp_position = vec2(board_center.x + position.x, board_center.y);
        }
    }
    else
    {
        if (gl_VertexID == 0)
        {
            temp_position = ball_center;
        } 
        else if (gl_VertexID == 1)
        {
            temp_position = vec2(cos(position.x) * r + ball_center.x, sin(position.x) * r + ball_center.y);
        }
        else if (gl_VertexID == 2)
        {
            temp_position = vec2(cos(position.x + position.y) * r + ball_center.x, sin(position.x + position.y) * r + ball_center.y);
        }
        else
        {
            temp_position = vec2(cos(position.x + position.y * 2.0) * r + ball_center.x, sin(position.x + position.y * 2.0) * r + ball_center.y);
        }
    }
    
    gl_Position = vec4((temp_position.x * 2.0 / max_width) - 1.0, 1.0 - (temp_position.y * 2.0 / max_height), 0.0, 1.0);
    // gl_PointSize = 10.0;
    a_color = color;
}`;

const fragmentScript = `#version 300 es
precision highp float;

in vec4 a_color;

out vec4 outColor;

void main()
{
    outColor = a_color;
}`;

export class GameMain {
  height: number;
  width: number;
  gl: WebGL2RenderingContext;
  brickArray: Brick[] = [];
  board: Board;
  ball: Ball;
  score: Ref<number>;

  program: WebGLProgram | null = null;
  VAO: WebGLVertexArrayObject | null = null;
  aliveArr: number[] = [];
  constructor(height: number, width: number, gl: WebGL2RenderingContext, score: Ref<number>) {
    this.height = height;
    this.width = width;
    this.gl = gl;
    this.score = score;
    this.board = new Board(width / 2 - 40, height - 10 - 10, 80, 10, 8);
    this.ball = new Ball(12, Math.random() * width, (height * 2) / 3, Math.pow(-1, Math.floor(Math.random() * 10) % 2), 1, 3);
    const brickWidth = 90;
    const brickHeight = 25;
    const intervalWidth = (width - 40 - brickWidth * 9) / 8;
    const intervalHeight = 15;
    let index = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 9; j++) {
        this.brickArray.push(new Brick(index++, j * (brickWidth + intervalWidth) + 20, i * (brickHeight + intervalHeight) + 20, brickWidth, brickHeight, 1));
      }
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(vertexShader, vertexScript);
    gl.shaderSource(fragmentShader, fragmentScript);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(vertexShader);
      console.log(err);
      return;
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(fragmentShader);
      console.log(err);
      return;
    }
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    this.VAO = gl.createVertexArray();
    gl.bindVertexArray(this.VAO);
    const position = [];
    this.brickArray.forEach((item) => {
      position.push(item.positionX, item.positionY, 0);
    });
    position.push(this.board.width, this.board.height, 1);
    for (let i = 0; i < 50; i++) {
      position.push((i * Math.PI * 2) / 50, (Math.PI * 2) / 100, 2);
    }
    for (let i = 0; i < position.length; i = i + 3) {
      this.aliveArr.push(1);
    }
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 3, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  bindBoardMoveEvent(flag: number) {
    this.board.setFlag(flag);
  }

  simulation() {
    this.board.move(this.width);
    this.score.value += this.ball.move(this.height, this.width, this.board, this.brickArray, this.aliveArr);
  }

  render() {
    this.simulation();
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.bindVertexArray(this.VAO);
    const aliveBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, aliveBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.aliveArr), this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 1, this.gl.FLOAT, false, 4 * 1, 0);
    this.gl.vertexAttribDivisor(1, 1);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindVertexArray(null);
    this.gl.useProgram(this.program);
    const heightLoc = this.gl.getUniformLocation(this.program!, "height");
    this.gl.uniform1f(heightLoc, this.brickArray[0].height);
    const widthLoc = this.gl.getUniformLocation(this.program!, "width");
    this.gl.uniform1f(widthLoc, this.brickArray[0].width);
    const maxHeightLoc = this.gl.getUniformLocation(this.program!, "max_height");
    this.gl.uniform1f(maxHeightLoc, 600);
    const maxWidthLoc = this.gl.getUniformLocation(this.program!, "max_width");
    this.gl.uniform1f(maxWidthLoc, 1000);
    const rLoc = this.gl.getUniformLocation(this.program!, "r");
    this.gl.uniform1f(rLoc, this.ball.r);
    const boardCenterLoc = this.gl.getUniformLocation(this.program!, "board_center");
    this.gl.uniform2fv(boardCenterLoc, [this.board.positionX, this.board.positionY]);
    const centerLoc = this.gl.getUniformLocation(this.program!, "ball_center");
    this.gl.uniform2fv(centerLoc, [this.ball.positionX, this.ball.positionY]);
    const colorLoc = this.gl.getUniformLocation(this.program!, "color");
    this.gl.uniform4fv(colorLoc, [0.0, 0.5843, 0.82745, 1.0]);
    this.gl.bindVertexArray(this.VAO);
    this.gl.drawArraysInstanced(this.gl.TRIANGLE_FAN, 0, 4, this.aliveArr.length);
    this.gl.bindVertexArray(null);
    const that = this;
    requestAnimationFrame(() => {
      that.render.call(that);
    });
  }
}

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.pow((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2), 1 / 2);
};

const isCircleRectIntersect = (circleX: number, circleY: number, r: number, rectX: number, rectY: number, width: number, height: number) => {
  const dx = Math.abs(circleX - rectX - width / 2);
  const dy = Math.abs(circleY - rectY - height / 2);
  if (dx > width / 2 + r) return false;
  if (dy > height / 2 + r) return false;
  if (dx <= width / 2) return true;
  if (dy <= height / 2) return true;
  const distance = (dx - width / 2) * (dx - width / 2) + (dy - height / 2) * (dy - height / 2);
  return distance <= r * r;
};
