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

  controls: EnemyControls;

  private readonly colors = {
    normal: "#A77500",
    danger: "#AF0D0D",
  };

  constructor(pos: Vector2D) {
    super(pos);

    this.brain = new NeuralNetwork([24, 24, 24, 5]);
    this.sensor = new Sensor(this);
    this.color = this.colors.normal;

    this.controls = new EnemyControls();
  }

  update = (walls: Wall[], player: Player): void => {
    const neuralNetInputs = this.look(walls, player);
    this.think(neuralNetInputs);
    this.move(this.controls, walls);
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

  look = (walls: Wall[], player: Player): number[] => {
    this.sensor.update(walls, player);
    const sensorReadings: (SensorReading | null)[] = this.sensor.getReadings();

    if (sensorReadings.some(r => r?.detectedEntity === "PLAYER")) {
      this.color = this.colors.danger;
    } else {
      this.color = this.colors.normal;
    }

    let neuralNetInputs: number[][] = [];

    for (const reading of sensorReadings) {
      const inputsFromReading = [
        reading === null ? 0 : 1 - reading.offset,
        reading?.detectedEntity === "PLAYER" ? 1 : 0,
        reading?.detectedEntity === "WALL" ? 1 : 0,
      ];

      neuralNetInputs.push(inputsFromReading);
    }

    return neuralNetInputs.flat();
  };

  think = (inputs: number[]): void => {
    const outputs = this.brain.feedForward(inputs);
    this.controls.decideOnMove(outputs);
  };
}

export default Enemy;
