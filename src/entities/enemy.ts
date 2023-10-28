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

class Enemy extends Fighter {
  id: string;
  brain: NeuralNetwork;
  sensor: Sensor;
  controls: EnemyControls;

  playerSpotted: boolean = false;
  triggerCounter: number = 0;

  // Fitness components
  pointsForBeingCloseToPlayer: number = 0.0;
  penaltyForBeingAwayFromPlayer: number = 0.0;

  currentTargetSiteIndex: number;
  distanceFromSite: number;
  distanceFromSiteCurrent: number = 0.0;
  playerShot: boolean = false;
  points: number = 0.0;

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
      this.brain = new NeuralNetwork([sensorRayCount * 2 + 1, 12, 12, 5]);
    }
    this.sensor = new Sensor(this);

    this.controls = new EnemyControls();
    this.currentTargetSiteIndex = 1;
    this.distanceFromSite = distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]);
  }

  update = (walls: Wall[], player: Player): void => {
    if (this.isDead === false) {
      if (this.playerSpotted) {
        this.triggerCounter++;

        if (this.triggerCounter === 30) {
          this.playerSpotted = false;
        }
      }

      this.calculatePoints();

      const neuralNetInputs = this.look(walls, player);
      // Additional input indicating if player has been spotted to allow making different decisions based on that.
      this.think([...neuralNetInputs, Number(this.playerSpotted)]);
      this.move(this.controls, walls);
      this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, player);
    }
    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls, [player]));
    if (this.bullets.some(b => b.enemyHit)) {
      this.playerShot = true;
    }
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean, isBest: boolean = false): void => {
    if (showSensors) {
      this.sensor.draw(ctx);
    }

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = this.playerSpotted ? this.colors.danger : this.colors.normal;
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

  // ========= EVOLUTION ==========================
  calculateFitness = () => {
    if (this.playerShot) {
      this.points *= 1.5;
    }

    this.fitness = this.points;
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

  // ========= THINKING ==========================
  private look = (walls: Wall[], player: Player): number[] => {
    this.sensor.update(walls, player);
    const sensorReadings: (SensorReading | null)[] = this.sensor.getReadings();

    if (sensorReadings.some(r => r?.detectedEntity === "PLAYER")) {
      this.playerSpotted = true;
      this.triggerCounter = 0;
    }

    let neuralNetInputs: number[][] = [];

    for (const reading of sensorReadings) {
      const inputsFromReading = [
        reading === null ? 0 : 1 - reading.offset,
        reading?.detectedEntity === "PLAYER" ? 1 : 0,
      ];

      neuralNetInputs.push(inputsFromReading);
    }

    return neuralNetInputs.flat();
  };

  private think = (inputs: number[]): void => {
    const outputs = this.brain.feedForward(inputs);
    this.controls.decideOnMove(outputs);
  };

  // =============================================

  private calculatePoints = () => {
    const distanceFromSiteCurrent: number = distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]);
    if (distanceFromSiteCurrent < this.distanceFromSite) {
      this.points += (this.distanceFromSite - distanceFromSiteCurrent) / 10;
      this.distanceFromSite = distanceFromSiteCurrent;

      if (this.distanceFromSite < 80) {
        this.points += 70;
        this.currentTargetSiteIndex = (this.currentTargetSiteIndex + 1) % sites.length;
        this.distanceFromSite = distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]);
      }
    }

    if (this.controls.shoot && this.playerSpotted === false) {
      this.points *= 0.9;
    }
  };
}

export default Enemy;
