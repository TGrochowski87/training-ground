import { sites } from "configuration";
import Wall from "entities/wall";
import TargetSiteDealer from "mechanics/targetSiteDealer";

export default abstract class Population {
  generation: number = 1;
  generationLifetime: number = 0;
  maxGenerationLifetime: number = 200;
  peakGenerationLifetime: number = 7000;
  generationLifetimeIncrease: number = 200;
  numberOfGenerationsBetweenIncrease: number = 20;

  constructor() {
    TargetSiteDealer.initialize(sites);
  }

  abstract update(walls: Wall[]): void;
  abstract draw(ctx: CanvasRenderingContext2D, showSensors: boolean, selectedSpeciesId?: number): void;
  abstract calculateFitness(): void;
  abstract naturalSelection(): void;
  abstract drawBestMembersNeuralNetwork(ctx: CanvasRenderingContext2D, selectedSpeciesId: number): void;
  abstract exportBestNeuralNetwork(): void;
  abstract isPopulationExtinct(): boolean;
}
