import { enemySpawnPoint, gunPointOffset, sensorRayCount, sites } from "configuration";
import NeuralNetwork from "machine-learning/neuralNetwork";
import EnemyControls from "mechanics/enemyControls";
import Sensor from "machine-learning/sensor";
import Vector2D from "utilities/vector2d";
import Fighter from "./fighter";
import Wall from "./wall";
import SensorReading from "models/sensorReading";
import Player from "./player";
import { distanceBetweenPoints } from "utilities/mathExtensions";
import { approachPlayer, explore } from "machine-learning/fitnessFunctions";

class Enemy extends Fighter {
  id: string;
  brain: NeuralNetwork;
  sensor: Sensor;
  controls: EnemyControls;

  color: string;

  isDead: boolean;

  // Fitness components
  ticksAlive: number = 0.0;
  pointsForBeingCloseToPlayer: number = 0.0;
  penaltyForBeingAwayFromPlayer: number = 0.0;

  currentTargetSiteIndex: number;
  distanceFromSite: number = 0.0;
  distanceFromSiteCurrent: number = 0.0;
  pointsForApproachingSite: number = 0.0;

  fitness: number = 0.0;

  private readonly colors = {
    normal: "#A77500",
    danger: "#AF0D0D",
  };

  constructor(pos: Vector2D, brain?: NeuralNetwork) {
    super(pos);
    this.id = crypto.randomUUID();

    if (brain) {
      this.brain = brain;
    } else {
      this.brain = new NeuralNetwork([sensorRayCount * 3, 12, 12, 4]);
    }
    this.sensor = new Sensor(this);
    this.color = this.colors.normal;

    this.controls = new EnemyControls();
    this.currentTargetSiteIndex = 1;
    this.distanceFromSite = distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]);

    this.isDead = false;
  }

  update = (walls: Wall[], player: Player): void => {
    if (this.ticksAlive === 500) {
      this.isDead = true;
      return;
    }

    const distanceFromSiteCurrent: number = distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]);
    if (distanceFromSiteCurrent < this.distanceFromSite) {
      //console.log(this.distanceFromSite - distanceFromSiteCurrent);
      this.pointsForApproachingSite += this.distanceFromSite - distanceFromSiteCurrent;
      this.distanceFromSite = distanceFromSiteCurrent;

      if (this.distanceFromSite < 50) {
        this.pointsForApproachingSite *= 1.3;
        this.currentTargetSiteIndex = (this.currentTargetSiteIndex + 1) % sites.length;
      }
    }

    // const distanceToPlayer = distanceBetweenPoints(this.position, player.position);
    // if (distanceToPlayer < 50) {
    //   this.pointsForBeingCloseToPlayer += 50 / (distanceToPlayer + 0.001);
    // } else {
    //   this.penaltyForBeingAwayFromPlayer += 1;
    // }

    const neuralNetInputs = this.look(walls, player);
    this.think(neuralNetInputs);
    this.move(this.controls, walls);
    this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, player);

    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls));
    this.ticksAlive++;
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean, isBest: boolean = false): void => {
    if (showSensors) {
      this.sensor.draw(ctx);
    }

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

    if (isBest) {
      ctx.beginPath();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.strokeStyle = "white";
      ctx.font = this.radius * 1.5 + "px Arial";
      ctx.fillText("⭐", 0, 0);
    }
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

  drawNeuralNetwork = (ctx: CanvasRenderingContext2D): void => {
    this.brain.draw(ctx);
  };

  // ========= THINKING ==========================
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

  // ========= EVOLUTION ==========================
  calculateFitness = (player: Player) => {
    this.fitness = explore(this);
  };

  clone = (): Enemy => {
    const clonedBrain = this.brain.clone();
    let clone = new Enemy(enemySpawnPoint.copy(), clonedBrain);
    clone.id = this.id;
    return clone;
  };

  crossover = (other: Enemy): Enemy => {
    const childBrain = this.brain.crossover(other.brain);
    const child: Enemy = new Enemy(enemySpawnPoint.copy(), childBrain);
    return child;
  };

  mutate = (): void => {
    this.brain.mutate();
  };
}

export default Enemy;
