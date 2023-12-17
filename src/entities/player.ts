import { gunPointOffset } from "configuration";
import Wall from "entities/wall";
import Vector2D from "utilities/vector2d";
import Fighter from "./fighter";
import PlayerControls from "mechanics/playerControls";
import Enemy from "./enemy";
import Controls from "mechanics/controls";
import DummyControls from "mechanics/dummyControls";
import NeuralNetwork from "machine-learning/neuralNetwork";

class Player extends Fighter {
  controls: Controls;

  constructor(pos: Vector2D, isDummy: boolean = false, shouldDummyMove: boolean = true) {
    super(pos);

    this.controls = isDummy ? new DummyControls(shouldDummyMove) : new PlayerControls();
  }

  update = (walls: Wall[], enemies: Enemy<NeuralNetwork>[]): void => {
    if (this.isDead === false) {
      this.move(this.controls, walls);
      this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, this);
    }

    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls, enemies));
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

    if (this.isDead) {
      ctx.beginPath();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.strokeStyle = "white";
      ctx.font = this.radius * 1.5 + "px Arial";
      ctx.fillText("☠️", 0, 0);
    }

    ctx.restore();

    this.aimRay.draw(ctx);
    this.bullets.forEach(bullet => bullet.draw(ctx));
  };
}

export default Player;
