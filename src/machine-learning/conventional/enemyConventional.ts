import { sensorRayCount, sites, gunPointOffset, enemySpawnPoint, siteRadius } from "configuration";
import Enemy from "entities/enemy";
import Player from "entities/player";
import Wall from "entities/wall";
import Sensor from "machine-learning/sensor";
import EnemyControls from "mechanics/enemyControls";
import SensorReading from "models/SensorReading";
import { distanceBetweenPoints } from "utilities/mathExtensions";
import { lerp } from "utilities/mechanicsFunctions";
import Vector2D from "utilities/vector2d";
import NeuralNetworkConventional from "./neuralNetworkConventional";

class EnemyConventional extends Enemy<NeuralNetworkConventional> {
  constructor(pos: Vector2D, brain?: NeuralNetworkConventional, isChampion: boolean = false) {
    super(pos, brain ?? new NeuralNetworkConventional([sensorRayCount * 3, 12, 12, 5]), isChampion);

    this.sensor = new Sensor(this);

    this.controls = new EnemyControls();

    this.lastSitePosition = pos;
  }

  clone = (isChampion?: boolean): EnemyConventional => {
    const clonedBrain = this.brain.clone();
    let clone = new EnemyConventional(enemySpawnPoint.copy(), clonedBrain, isChampion);

    if (isChampion) {
      clone.savedChampionsFitness = this.fitness;
    }

    return clone;
  };

  crossover = (other: EnemyConventional): EnemyConventional => {
    const childBrain = this.brain.crossover(other.brain);
    const child: EnemyConventional = new EnemyConventional(enemySpawnPoint.copy(), childBrain);
    return child;
  };

  mutate = (): void => {
    this.brain.mutate();
  };

  exportBrain = (): void => {
    this.brain.export(this.savedChampionsFitness);
  };
}

export default EnemyConventional;
