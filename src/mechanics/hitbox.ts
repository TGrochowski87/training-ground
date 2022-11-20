import Fighter from "fighter";
import Vector2D from "utilities/vector2d";

class Hitbox {
  object: Fighter;
  size: Vector2D;

  constructor(object: Fighter, size: Vector2D) {
    this.object = object;
    this.size = size.copy();
  }

  show = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = "lightgreen";
    ctx.beginPath();
    ctx.fill();
  };
}

export default Hitbox;
