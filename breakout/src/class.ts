export class Ball {
  private _x: number;
  private _y: number;
  private _r: number;
  private _fillColor: string;
  private _strokeColor: string;
  constructor(
    x: number,
    y: number,
    r: number,
    fillColor: string,
    strokeColor: string
  ) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._strokeColor = strokeColor;
    this._fillColor = fillColor;
  }

  get x() {
    return this._x;
  }
  set x(x: number) {
    this._x = x;
  }

  get y() {
    return this._y;
  }
  set y(y: number) {
    this._y = y;
  }

  get r() {
    return this._r;
  }
  set r(r: number) {
    this._r = r;
  }

  get fillColor() {
    return this._fillColor;
  }
  set fillColor(fillColor: string) {
    this._fillColor = fillColor;
  }

  get strokeColor() {
    return this._strokeColor;
  }
  set strokeColor(strokeColor: string) {
    this._strokeColor = strokeColor;
  }
}

export class Paddle {
  private _x: number;
  private _y: number;
  private _dx: number;
  private _width: number;
  private _height: number;
  private _fillColor: string;
  private _strokeColor: string;
  constructor(
    x: number,
    y: number,
    dx: number,
    width: number,
    height: number,
    fillColor: string,
    strokeColor: string
  ) {
    this._x = x;
    this._y = y;
    this._dx = dx;
    this._width = width;
    this._height = height;
    this._fillColor = fillColor;
    this._strokeColor = strokeColor;
  }

  set x(x: number) {
    this._x = x;
  }
  get x() {
    return this._x;
  }

  set y(y: number) {
    this._y = y;
  }
  get y() {
    return this._y;
  }

  set dx(dx: number) {
    this._dx = dx;
  }
  get dx() {
    return this._dx;
  }

  set width(width: number) {
    this._width = width;
  }
  get width() {
    return this._width;
  }

  set height(height: number) {
    this._height = height;
  }
  get height() {
    return this._height;
  }

  get fillColor() {
    return this._fillColor;
  }
  set fillColor(fillColor: string) {
    this._fillColor = fillColor;
  }

  get strokeColor() {
    return this._strokeColor;
  }
  set strokeColor(strokeColor: string) {
    this._strokeColor = strokeColor;
  }
}

export class Brick extends Paddle {
  private _visual: boolean;
  constructor(
    visual: boolean,
    x: number,
    y: number,
    dx: number,
    width: number,
    height: number,
    fillColor: string,
    strokeColor: string
  ) {
    super(x, y, dx, width, height, fillColor, strokeColor);
    this._visual = visual;
  }

  get visual() {
    return this._visual;
  }
  set visual(visual: boolean) {
    this._visual = visual;
  }
}

export class Score {
  private _font: string;
  private _fillColor: string;
  private _strokeColor: string;
  private _lineWidth: number;
  private _x: number;
  private _y: number;
  private _score: number;

  constructor(
    font: string,
    x: number,
    y: number,
    lineWidth: number,
    fillColor: string,
    strokeColor: string,
    score: number
  ) {
    this._x = x;
    this._y = y;
    this._font = font;
    this._fillColor = fillColor;
    this._strokeColor = strokeColor;
    this._lineWidth = lineWidth;
    this._score = score;
  }

  set x(x: number) {
    this._x = x;
  }
  get x() {
    return this._x;
  }

  set y(y: number) {
    this._y = y;
  }
  get y() {
    return this._y;
  }

  get fillColor() {
    return this._fillColor;
  }
  set fillColor(fillColor: string) {
    this._fillColor = fillColor;
  }

  get strokeColor() {
    return this._strokeColor;
  }
  set strokeColor(strokeColor: string) {
    this._strokeColor = strokeColor;
  }

  get font() {
    return this._font;
  }
  set font(font: string) {
    this._font = font;
  }

  set lineWidth(lineWidth: number) {
    this._lineWidth = lineWidth;
  }
  get lineWidth() {
    return this._lineWidth;
  }

  set score(score: number) {
    this._score = score;
  }
  get score() {
    return this._score;
  }
}
