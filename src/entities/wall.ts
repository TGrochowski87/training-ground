import Vector2D from "utilities/vector2d";

class Wall {
  private readonly topLeft: Vector2D;
  private readonly topRight: Vector2D;
  private readonly bottomLeft: Vector2D;
  private readonly bottomRight: Vector2D;

  lines: [Vector2D, Vector2D][];

  constructor(
    topLeft: Vector2D,
    topRight: Vector2D,
    bottomLeft: Vector2D,
    bottomRight: Vector2D
  ) {
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomLeft = bottomLeft;
    this.bottomRight = bottomRight;

    this.lines = [
      [this.topLeft, this.topRight],
      [this.topRight, this.bottomRight],
      [this.bottomRight, this.bottomLeft],
      [this.bottomLeft, this.topLeft],
    ];
  }

  draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = "#7D5514";
    ctx.rect(
      this.topLeft.x,
      this.topLeft.y,
      this.topRight.x - this.topLeft.x,
      this.bottomLeft.y - this.topLeft.y
    );
    ctx.fill();
  };
}

export default Wall;
