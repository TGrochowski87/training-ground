import { dummySpawnPoint } from "configuration";
import Wall from "entities/wall";
import { Mode } from "models/UserSettings";
import Vector2D from "utilities/vector2d";

export default abstract class Population {
  trainingMode: Mode;
  dummySpawnPoint: Vector2D;

  generation: number = 1;
  generationLifetime: number = 0;

  constructor(trainingMode: Mode) {
    this.trainingMode = trainingMode;

    this.dummySpawnPoint = this.trainingMode == "full" ? dummySpawnPoint : new Vector2D(-1000, -1000);
  }

  abstract update(walls: Wall[]): void;
  abstract draw(ctx: CanvasRenderingContext2D, showSensors: boolean, selectedSpeciesId?: number): void;
  abstract calculateFitness(): void;
  abstract naturalSelection(): void;
  abstract drawBestMembersNeuralNetwork(ctx: CanvasRenderingContext2D, selectedSpeciesId: number): void;
  abstract exportBestNeuralNetwork(): void;
  abstract isPopulationExtinct(): boolean;
}
