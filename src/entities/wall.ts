import Vector2D from "utilities/vector2d";

class Wall {
  private readonly topLeft: Vector2D;
  private readonly topRight: Vector2D;
  private readonly bottomLeft: Vector2D;
  private readonly bottomRight: Vector2D;

  private readonly thickness: number = 10;

  lines: [Vector2D, Vector2D][];

  constructor(startingPoint: Vector2D, direction: "UP" | "RIGHT" | "DOWN" | "LEFT", length: number) {
    switch (direction) {
      case "UP":
        this.bottomLeft = new Vector2D(startingPoint.x - this.thickness / 2, startingPoint.y);
        this.bottomRight = new Vector2D(startingPoint.x + this.thickness / 2, startingPoint.y);
        this.topLeft = new Vector2D(this.bottomLeft.x, this.bottomLeft.y - length);
        this.topRight = new Vector2D(this.bottomRight.x, this.bottomRight.y - length);
        break;
      case "RIGHT":
        this.topLeft = new Vector2D(startingPoint.x, startingPoint.y + this.thickness / 2);
        this.bottomLeft = new Vector2D(startingPoint.x, startingPoint.y - this.thickness / 2);
        this.topRight = new Vector2D(this.topLeft.x + length, this.topLeft.y);
        this.bottomRight = new Vector2D(this.bottomLeft.x + length, this.bottomLeft.y);
        break;
      case "DOWN":
        this.topLeft = new Vector2D(startingPoint.x - this.thickness / 2, startingPoint.y);
        this.topRight = new Vector2D(startingPoint.x + this.thickness / 2, startingPoint.y);
        this.bottomLeft = new Vector2D(this.topLeft.x, this.topLeft.y + length);
        this.bottomRight = new Vector2D(this.topRight.x, this.topRight.y + length);
        break;
      case "LEFT":
        this.topRight = new Vector2D(startingPoint.x, startingPoint.y + this.thickness / 2);
        this.bottomRight = new Vector2D(startingPoint.x, startingPoint.y - this.thickness / 2);
        this.topLeft = new Vector2D(this.topRight.x - length, this.topRight.y);
        this.bottomLeft = new Vector2D(this.bottomRight.x - length, this.bottomRight.y);
        break;
    }

    this.lines = [
      [this.topLeft, this.topRight],
      [this.topRight, this.bottomRight],
      [this.bottomRight, this.bottomLeft],
      [this.bottomLeft, this.topLeft],
    ];
  }

  draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = "#7D5514";
    ctx.rect(this.topLeft.x, this.topLeft.y, this.topRight.x - this.topLeft.x, this.bottomLeft.y - this.topLeft.y);
    ctx.fill();
  };
}

export default Wall;
