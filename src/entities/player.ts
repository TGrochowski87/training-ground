import { gunPointOffset } from "configuration";
import Wall from "entities/wall";
import Vector2D from "utilities/vector2d";
import Fighter from "./fighter";
import PlayerControls from "mechanics/playerControls";

class Player extends Fighter {
  controls: PlayerControls;

  constructor(pos: Vector2D) {
    super(pos);

    this.controls = new PlayerControls();
  }

  update = (walls: Wall[]): void => {
    this.move(this.controls, walls);
    this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, this);

    //this.sensor.update(walls);
    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls));
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = "#566040";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(8, -13);
    ctx.stroke();

    ctx.restore();

    this.aimRay.draw(ctx);
    this.bullets.forEach(bullet => bullet.draw(ctx));
  };
}

export default Player;
