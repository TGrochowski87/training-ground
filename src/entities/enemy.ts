import {
  gunPointOffset,
  maxLifetimeWhenDummiesAppear,
  sensorRayCount,
  siteIndexAfterWhichDummiesStartMoving,
  siteRadius,
} from "configuration";
import EnemyControls from "mechanics/enemyControls";
import Sensor from "machine-learning/sensor";
import Vector2D from "utilities/vector2d";
import Fighter from "./fighter";
import Wall from "./wall";
import SensorReading from "models/SensorReading";
import Player from "./player";
import { distanceBetweenPoints } from "utilities/mathExtensions";
import NeuralNetwork from "machine-learning/neuralNetwork";
import TargetSiteDealer from "mechanics/targetSiteDealer";
import DummyPlayer from "./dummyPlayer";
import DummyControls from "mechanics/dummyControls";

abstract class Enemy<NN extends NeuralNetwork> extends Fighter {
  brain: NN;
  sensor: Sensor;
  controls: EnemyControls;
  isChampion: boolean;

  playerSpottedOnSensors: number[];

  distanceToTargetSite: number;
  previousDistanceToTargetSite: number;
  currentSitePosition: Vector2D;
  lastSitePosition: Vector2D; // Initially set to spawn position.
  currentTargetSiteSequenceIndex: number;

  // Fitness components
  sitesVisited: number = 0;
  needlessShots: number = 0;
  justifiedShots: number = 0;
  playerWasSpottedAtAll: boolean = false;
  shotsAtPlayer: number = 0;
  shotsWithoutReachingNextSite: number = 0;
  backwardCounter: number = 0;
  forwardCounter: number = 0;
  playerShotCounter: number = 0;
  playerIgnoredCounter: number = 0;
  playerWasSpotted: boolean = false;
  playerAliveAfterSpotted: number = 0;
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

    this.currentSitePosition = TargetSiteDealer.getNextTargetSite(0);
    this.currentTargetSiteSequenceIndex = 1;
    this.lastSitePosition = pos;

    this.distanceToTargetSite = this.calculateDistanceToTargetSite();
    this.previousDistanceToTargetSite = this.distanceToTargetSite;
  }

  update = (walls: Wall[], player: Player, maxLifetime?: number): void => {
    // TODO: Clean this method up...

    if (this.isDead === false) {
      this.updatePlayerPositionInfo();

      if (this.isSiteReached()) {
        this.sitesVisited++;
        this.lastSitePosition = this.currentSitePosition;
        this.currentSitePosition = TargetSiteDealer.getNextTargetSite(this.currentTargetSiteSequenceIndex);
        this.currentTargetSiteSequenceIndex++;
        this.updateDistanceToTargetSite(0.0);
        this.shotsWithoutReachingNextSite = 0;

        if (
          maxLifetime &&
          maxLifetime >= maxLifetimeWhenDummiesAppear &&
          player instanceof DummyPlayer &&
          player.isDead &&
          this.currentTargetSiteSequenceIndex % 2 == 0
        ) {
          if (this.currentTargetSiteSequenceIndex > siteIndexAfterWhichDummiesStartMoving) {
            player.position = this.currentSitePosition.add(new Vector2D(60, 0));
            (player.controls as DummyControls).go();
          } else {
            player.position = this.currentSitePosition;
          }
          player.angle = 0;
          player.isDead = false;
        }
      } else {
        this.updateDistanceToTargetSite(this.calculateDistanceToTargetSite());
      }

      if (this.currentWeaponCooldown <= 0 && this.controls.shoot) {
        if (this.playerSpottedOnSensors.every(x => x == 0.0)) {
          this.needlessShots++;
        } else if (this.shotsWithoutReachingNextSite <= 30) {
          this.shotsWithoutReachingNextSite++;

          // Move the player by the rotation of this enemy and check if it is in front by comparing coordinates.
          const playerRelativePos = player.position.add(new Vector2D(-this.position.x, -this.position.y));
          const x = playerRelativePos.x * Math.cos(this.angle) + playerRelativePos.y * Math.sin(this.angle);
          const y = playerRelativePos.y * Math.cos(this.angle) - playerRelativePos.x * Math.sin(this.angle);

          const playerResultPos = new Vector2D(x, y).add(this.position);

          if (playerResultPos.y < this.position.y && Math.abs(playerResultPos.x - this.position.x) <= 30) {
            this.shotsAtPlayer++;
          } else {
            this.justifiedShots++;
          }
        }
      }

      if (this.controls.backward && this.controls.forward == false) {
        this.backwardCounter++;
      } else if (this.controls.backward == false && this.controls.forward) {
        this.forwardCounter++;
      }

      const neuralNetInputs = this.look(walls, player);
      this.think([...neuralNetInputs, +(this.distanceToTargetSite < this.previousDistanceToTargetSite)]);
      this.move(this.controls, walls);
      this.aimRay.update(this.position.add(gunPointOffset.rotate(this.angle)), this.angle, walls, player);
    }

    this.bullets = this.bullets.filter(bullet => bullet.toBeDeleted === false);
    this.bullets.forEach(bullet => bullet.update(walls, [player]));
    if (this.bullets.some(b => b.enemyHit)) {
      this.playerAliveAfterSpotted = 0;
      this.playerWasSpotted = false;
      this.playerShotCounter++;
      for (let i = 0; i < this.playerSpottedOnSensors.length; i++) {
        this.playerSpottedOnSensors[i] = 0.0;
      }
    }

    if (this.playerWasSpotted) {
      if (this.playerAliveAfterSpotted == 100) {
        this.playerIgnoredCounter++;

        this.playerAliveAfterSpotted = 0;
        this.playerWasSpotted = false;
      } else {
        this.playerAliveAfterSpotted++;
      }
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

  calculateFitness = () => {
    const pointsForReachingSite: number = 10;
    const pointsForJustifiedShots: number = 0.02;
    const negativePointsForNeedlessShots: number = 0.02;
    const pointsForShotsAtPlayer: number = 0.6;
    let points: number = 0;

    // Points for every reached site
    points += this.sitesVisited * pointsForReachingSite;

    // Points for approaching the last site
    points += pointsForReachingSite * (1 - this.distanceToTargetSite);

    // Penalty for needless shooting
    points -= Math.pow(this.needlessShots, 2) * negativePointsForNeedlessShots;

    // High penalty for running backwards
    const runningBackwardsPenalty = this.backwardCounter > this.forwardCounter ? 0.2 : 0;
    points *= 1 - runningBackwardsPenalty;

    // Slight boost for shooting when the player is spotted
    points += pointsForJustifiedShots * this.justifiedShots;

    // Bigger boost for shooting at player
    points += pointsForShotsAtPlayer * this.shotsAtPlayer;

    // Big boost for shooting the player
    points *= 1 + 0.2 * this.playerShotCounter;

    // Penalty for ignoring the player
    points *= Math.max(0, 1 - 0.05 * this.playerIgnoredCounter);

    // Big penalty for not shooting at all
    if (this.playerWasSpottedAtAll && this.justifiedShots == 0 && this.needlessShots == 0) {
      points *= 0.7;
    }

    this.fitness = points > 0 ? points : 0;
  };

  abstract exportBrain(generation: number): void;

  private updateDistanceToTargetSite = (value: number) => {
    this.previousDistanceToTargetSite = this.distanceToTargetSite;
    this.distanceToTargetSite = value;
  };

  private calculateDistanceToTargetSite = (): number => {
    const distanceLeft = distanceBetweenPoints(this.position, this.currentSitePosition);
    const initialDistance = distanceBetweenPoints(this.lastSitePosition, this.currentSitePosition);
    return distanceLeft > initialDistance ? 1 : distanceLeft / initialDistance;
  };

  private look = (walls: Wall[], player: Player): number[] => {
    this.sensor.update(walls, player);
    const sensorReadings: (SensorReading | null)[] = this.sensor.getReadings();

    let neuralNetInputs: number[][] = [];
    for (let i = 0; i < sensorRayCount; i++) {
      if (sensorReadings[i]?.detectedEntity === "PLAYER") {
        this.playerSpottedOnSensors[i] = 1.0;
        this.playerWasSpottedAtAll = true;
        this.playerWasSpotted = true;
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

  private updatePlayerPositionInfo = () => {
    for (let i = 0; i < sensorRayCount; i++) {
      this.playerSpottedOnSensors[i] = Math.max(0.0, this.playerSpottedOnSensors[i] - 0.02);
    }
  };

  private isSiteReached = (): boolean => {
    return distanceBetweenPoints(this.position, this.currentSitePosition) < siteRadius;
  };
}

export default Enemy;
