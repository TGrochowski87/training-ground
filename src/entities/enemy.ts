import { enemySpawnPoint, gunPointOffset, sensorRayCount, siteRadius, sites } from "configuration";
import NeuralNetworkConventional from "machine-learning/conventional/neuralNetworkConventional";
import EnemyControls from "mechanics/enemyControls";
import Sensor from "machine-learning/sensor";
import Vector2D from "utilities/vector2d";
import Fighter from "./fighter";
import Wall from "./wall";
import SensorReading from "models/SensorReading";
import Player from "./player";
import { distanceBetweenPoints } from "utilities/mathExtensions";
import { lerp } from "utilities/mechanicsFunctions";
import NeuralNetwork from "machine-learning/neuralNetwork";

abstract class Enemy<NN extends NeuralNetwork> extends Fighter {
  brain: NN;
  sensor: Sensor;
  controls: EnemyControls;
  isChampion: boolean;

  playerSpottedOnSensors: number[] = [];

  // Fitness components
  sitesVisited: number = 0;
  lastSitePosition: Vector2D; // Initially set to spawn position.
  currentTargetSiteIndex: number;
  needlessShots: number = 0;
  backwardsCounter: number = 0;
  runningBackwardsPenalties = 0;
  playerShot: boolean = false;
  fitness: number = 0.0;

  // Used only for when exporting.
  // Stores the last champion's fitness while the new one is mid calculation.
  savedChampionsFitness: number = 0.0;

  constructor(pos: Vector2D, brain: NN, isChampion: boolean) {
    super(pos);

    this.brain = brain;

    this.sensor = new Sensor(this);
    this.playerSpottedOnSensors = Array.from({ length: sensorRayCount }, () => 0.0);
    this.controls = new EnemyControls();
    this.isChampion = isChampion;

    this.currentTargetSiteIndex = 1;
    this.lastSitePosition = pos;
  }

  update = (walls: Wall[], player: Player): void => {
    if (this.isDead === false) {
      this.updatePlayerPositionInfo();

      if (this.isSiteReached()) {
        this.sitesVisited++;
        this.lastSitePosition = sites[this.currentTargetSiteIndex];
        this.currentTargetSiteIndex = (this.currentTargetSiteIndex + 1) % sites.length;
      }

      if (this.canShoot && this.controls.shoot && this.playerSpottedOnSensors.every(x => x == 0.0)) {
        this.needlessShots++;
      }

      if (this.controls.backward) {
        this.backwardsCounter++;

        if (this.backwardsCounter == 100) {
          this.runningBackwardsPenalties++;
          this.backwardsCounter = 0;
        }
      }

      const neuralNetInputs = this.look(walls, player);
      this.think([...neuralNetInputs]);
      //this.move(this.controls, walls);
      this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, player);
    }

    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls, [player]));
    if (this.bullets.some(b => b.enemyHit)) {
      this.playerShot = true;
    }
  };

  private updatePlayerPositionInfo = () => {
    for (let i = 0; i < sensorRayCount; i++) {
      this.playerSpottedOnSensors[i] = Math.max(0.0, this.playerSpottedOnSensors[i] - 0.02);
    }
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean, color: string): void => {
    if (showSensors) {
      this.sensor.draw(ctx);
    }

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = this.playerSpottedOnSensors.some(x => x > 0.0) ? "#AF0D0D" : color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(8, -13);
    ctx.stroke();

    if (this.isChampion) {
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

  drawBrain = (ctx: CanvasRenderingContext2D): void => {
    this.brain.draw(ctx);
  };

  private look = (walls: Wall[], player: Player): number[] => {
    this.sensor.update(walls, player);
    const sensorReadings: (SensorReading | null)[] = this.sensor.getReadings();

    let neuralNetInputs: number[][] = [];
    for (let i = 0; i < sensorRayCount; i++) {
      if (sensorReadings[i]?.detectedEntity === "PLAYER") {
        this.playerSpottedOnSensors[i] = 1.0;
      }

      const inputsFromReading = [
        sensorReadings[i] == null ? 0 : 1 - sensorReadings[i]!.offset,
        this.playerSpottedOnSensors[i],
      ];

      neuralNetInputs.push(inputsFromReading);
    }

    return neuralNetInputs.flat();
  };

  private think = (inputs: number[]): void => {
    const outputs = this.brain.process(inputs);
    this.controls.decideOnMove(outputs);
  };

  // ========= FITNESS ===========================

  calculateFitness = () => {
    const pointsForReachingSite: number = 5;
    let points: number = 0;

    // Points for every reached site
    points += this.sitesVisited * pointsForReachingSite;

    // Points for approaching the last site
    const distanceLeft = distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]);
    const initialDistance = distanceBetweenPoints(this.lastSitePosition, sites[this.currentTargetSiteIndex]);
    points += distanceLeft > initialDistance ? 0 : lerp(0, pointsForReachingSite, 1 - distanceLeft / initialDistance);

    // Penalty for needless shooting
    points *= Math.pow(0.99, this.needlessShots);

    // Penalty for running backwards
    points *= Math.pow(0.97, this.runningBackwardsPenalties);

    // Big boost for shooting the player
    // TODO: Consider slight boost for shooting when player spotted
    if (this.playerShot) {
      points *= 1.5;
    }

    this.fitness = points;
  };

  abstract exportBrain(): void;

  private isSiteReached = (): boolean => {
    return distanceBetweenPoints(this.position, sites[this.currentTargetSiteIndex]) < siteRadius;
  };
}

export default Enemy;
