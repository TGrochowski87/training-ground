import { sensorRayCount, enemySpawnPoint } from "configuration";
import Enemy from "entities/enemy";
import Sensor from "machine-learning/sensor";
import EnemyControls from "mechanics/enemyControls";
import Vector2D from "utilities/vector2d";
import NeuralNetworkConventional from "./neuralNetworkConventional";

class EnemyConventional extends Enemy<NeuralNetworkConventional> {
  constructor(pos: Vector2D, brain?: NeuralNetworkConventional, isChampion: boolean = false) {
    super(pos, brain ?? new NeuralNetworkConventional([sensorRayCount * 2 + 1, 12, 12, 5]), isChampion);

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

  exportBrain = (generation: number): void => {
    this.brain.export(this.savedChampionsFitness, generation);
  };
}

export default EnemyConventional;
