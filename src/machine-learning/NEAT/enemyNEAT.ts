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
import PartialConnectionData from "./models/PartialConnectionData";
import NeuralNetworkNEAT from "./neuralNetworkNEAT";

class EnemyNEAT extends Enemy<NeuralNetworkNEAT> {
  adjustedFitness: number = 0.0;

  wasChampionOfSpecies?: number;

  constructor(pos: Vector2D, brain?: NeuralNetworkNEAT, isChampion: boolean = false) {
    super(pos, brain ?? new NeuralNetworkNEAT({ type: "Creation", inputs: 16, outputs: 5 }), isChampion);

    this.sensor = new Sensor(this);

    this.controls = new EnemyControls();

    this.currentTargetSiteIndex = 1;
    this.lastSitePosition = pos;
  }

  clone = (isChampion?: boolean, speciesId?: number): EnemyNEAT => {
    const clonedBrain = this.brain.clone();
    let clone = new EnemyNEAT(enemySpawnPoint.copy(), clonedBrain, isChampion);

    if (isChampion) {
      clone.savedChampionsFitness = this.fitness;
      clone.wasChampionOfSpecies = speciesId;
    }

    return clone;
  };

  crossover = (other: EnemyNEAT): EnemyNEAT => {
    if (this.adjustedFitness == other.adjustedFitness) {
      return new EnemyNEAT(enemySpawnPoint.copy(), this.brain.crossover(other.brain, true));
    }

    if (this.adjustedFitness > other.adjustedFitness) {
      return new EnemyNEAT(enemySpawnPoint.copy(), this.brain.crossover(other.brain, false));
    } else {
      return new EnemyNEAT(enemySpawnPoint.copy(), other.brain.crossover(this.brain, false));
    }
  };

  mutate = (innovations: ReadonlyArray<PartialConnectionData>): (PartialConnectionData | null)[] => {
    this.brain.mutateWeights();
    const newConnectionsFromAddNode = this.brain.mutateAddNode(innovations);
    const newConnectionFromAddConnection = this.brain.mutateAddConnection(innovations);

    return [...newConnectionsFromAddNode, newConnectionFromAddConnection];
  };

  isCompatible = (other: EnemyNEAT, compatibilityThreshold: number): boolean => {
    const compatibilityDistance = this.brain.calculateCompatibilityDistance(other.brain);
    return compatibilityDistance < compatibilityThreshold;
  };

  setAdjustedFitness = (value: number) => (this.adjustedFitness = value);

  exportBrain = (): void => {
    this.brain.export(this.savedChampionsFitness, this.wasChampionOfSpecies!);
  };
}

export default EnemyNEAT;
