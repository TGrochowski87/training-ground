class Vector2D {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromAngle = (angle: number): Vector2D => {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  };

  visualize = (ctx: CanvasRenderingContext2D, startingPos: Vector2D, visualMultiplier: number = 1): void => {
    const displayVector = this.multiply(visualMultiplier);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startingPos.x, startingPos.y);
    ctx.lineTo(startingPos.x + displayVector.x, startingPos.y + displayVector.y);
    ctx.stroke();
  };

  copy = (): Vector2D => new Vector2D(this.x, this.y);

  normalize = (): Vector2D => {
    const length: number = this.getLength();
    return new Vector2D(this.x / length, this.y / length);
  };

  add = (other: Vector2D): Vector2D => {
    return new Vector2D(this.x + other.x, this.y + other.y);
  };

  multiply = (num: number): Vector2D => {
    return new Vector2D(this.x * num, this.y * num);
  };

  scalarProduct = (other: Vector2D): number => {
    return this.x * other.x + this.y * other.y;
  };

  angleBetween = (other: Vector2D): number => {
    const cos: number = this.scalarProduct(other) / (this.getLength() * other.getLength())
    const angle: number = Math.acos(cos);
    return angle;
  }

  rotate = (angle: number): Vector2D => {
    const newX = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const newY = this.x * Math.sin(angle) + this.y * Math.cos(angle);

    return new Vector2D(newX, newY);
  };

  setMagnitude = (mag: number): Vector2D => {
    let newX: number;
    let newY: number;

    if (mag === 0) {
      newX = 0;
      newY = 0;
    } else {
      const length: number = this.getLength();
      newX = this.x * (mag / length);
      newY = this.y * (mag / length);
    }

    return new Vector2D(newX, newY);
  };

  distanceFromPoint = (point: Vector2D): number => {
    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
  };

  getLength = (): number => Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
}

export default Vector2D;
