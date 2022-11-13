import { gunPointOffset, playerSpeed } from "./constants";
import Wall from "./entities/wall";
import FighterType from "./enums/fighterType";
import RayType from "./enums/RayType";
import Controls from "./mechanics/controls";
import Ray from "./mechanics/ray";
import Vector2D from "./utilities/vector2d";

class Fighter {
  position: Vector2D;
  type: FighterType;

  controls: Controls;
  angle: number;
  aimRay: Ray;

  constructor(pos: Vector2D, fighterType: FighterType) {
    this.position = pos.copy();
    this.type = fighterType;

    this.angle = 0.0;
    this.controls = new Controls();

    this.aimRay = new Ray(gunPointOffset, RayType.Aim);
  }
  // fix rootDir
  update = (walls: Wall[]): void => {
    this.move();
    this.aimRay.update(this.position, this.angle, walls);
  };

  show = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = "#566040";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(8, -13);
    ctx.stroke();

    ctx.restore();

    this.aimRay.draw(ctx);
  };

  private move = (): void => {
    if (this.controls.forward) {
      let displacementVector = new Vector2D(0, -playerSpeed).rotate(this.angle);
      this.position = this.position.add(displacementVector);
    }
    if (this.controls.backward) {
      let displacementVector = new Vector2D(0, playerSpeed).rotate(this.angle);
      this.position = this.position.add(displacementVector);
    }

    const flip: number = this.controls.backward ? -1 : 1;
    if (this.controls.right) {
      this.angle += 0.08 * flip;
    }
    if (this.controls.left) {
      this.angle -= 0.08 * flip;
    }
  };
}

export default Fighter;
