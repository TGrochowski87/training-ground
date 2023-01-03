import { gunPointOffset } from "configuration";
import NeuralNetwork from "machine-learning/neuralNetwork";
import EnemyControls from "mechanics/enemyControls";
import Sensor from "machine-learning/sensor";
import Vector2D from "utilities/vector2d";
import Fighter from "./fighter";
import Wall from "./wall";
import SensorReading from "models/sensorReading";
import Player from "./player";

class Enemy extends Fighter {
  brain: NeuralNetwork;
  sensor: Sensor;
  color: string;

  private readonly colors = {
    normal: "#A77500",
    danger: "#AF0D0D",
  };

  constructor(pos: Vector2D) {
    super(pos, new EnemyControls());

    this.brain = new NeuralNetwork([3, 4, 4, 5]);
    this.sensor = new Sensor(this);
    this.color = this.colors.normal;
  }

  update = (walls: Wall[], player: Player): void => {
    this.look(walls, player);
    this.move(walls);
    this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, player);

    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls));
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    this.sensor.draw(ctx);

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = this.color;
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

  drawNeuralNetwork = (ctx: CanvasRenderingContext2D): void => {
    this.brain.draw(ctx);
  };

  look = (walls: Wall[], player: Player) => {
    this.sensor.update(walls, player);
    const sensorReadings: (SensorReading | null)[] = this.sensor.getReadings();

    if (sensorReadings.some(r => r?.detectedEntity === "PLAYER")) {
      this.color = this.colors.danger;
    } else {
      this.color = this.colors.normal;
    }
  };
}

export default Enemy;
