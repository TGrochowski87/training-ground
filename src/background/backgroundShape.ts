import Vector2D from "../utilities/vector2d";

class BackgroundShape {
  position: Vector2D;
  image: HTMLImageElement;
  private scale: number;

  constructor(y: number, scale: number) {
    if (scale > 1 || scale <= 0) {
      throw new Error(
        "Scale should be within 0 to 1 boundaries (excluding 0)."
      );
    }

    this.position = new Vector2D(window.innerWidth, y);
    this.scale = scale;

    this.image = document.createElement("img");
    this.image.src = "shape.svg";
  }

  update = (): void => {
    this.position.x -= 1 + (1 - this.scale);
  };

  show = (ctx: CanvasRenderingContext2D): void => {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.image.width * this.scale,
      this.image.height * this.scale
    );
  };
}

export default BackgroundShape;
