//import { rotate } from "mathjs";

class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromAngle = (angle: number): Vector2D => {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  };

  normalize = () => {
    const length: number = this.getLength();
    this.x = this.x / length;
    this.y = this.y / length;
  };

  add = (secondVector: Vector2D) => {
    this.x += secondVector.x;
    this.y += secondVector.y;
  };

  multiply = (num: number) => {
    this.x *= num;
    this.y *= num;
  };

  rotate = (angle: number) => {
    //const [newX, newY] = rotate([this.x, this.y], angle);
    const newX = Math.cos(angle * this.x) - Math.sin(angle * this.y);
    const newY = Math.sin(angle * this.x) + Math.cos(angle * this.y);

    this.x = newX;
    this.y = newY;
  };

  setMagnitude = (mag: number) => {
    if (mag === 0) {
      this.x = 0;
      this.y = 0;
    } else {
      const length: number = this.getLength();
      this.x = this.x * (mag / length);
      this.y = this.y * (mag / length);
    }
  };

  distanceFrom = (point: Vector2D): number => {
    return Math.sqrt(
      Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2)
    );
  };

  getLength = (): number =>
    Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
}

export default Vector2D;
