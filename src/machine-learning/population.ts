import { sites } from "configuration";
import DummyPlayer from "entities/dummyPlayer";
import Wall from "entities/wall";
import TargetSiteDealer from "mechanics/TargetSiteDealer";
import { randomBetween } from "utilities/mathExtensions";
import Vector2D from "utilities/vector2d";

export default abstract class Population {
  generation: number = 1;
  generationLifetime: number = 0;
  maxGenerationLifetime: number = 200;
  generationLifetimeIncrease: number = 200;
  numberOfGenerationsBetweenIncrease: number = 20;

  timeWhenDummiesFirstAppear: number = 2000;
  timeWhenDummiesStartMoving: number = 4000;
  currentDummySpawnSiteSequenceIndex: number = 0;
  dummiesRespawnInterval: number = 500;
  dummiesSpawnSiteSequence: number[] = [2];
  dummiesAreMoving: boolean = false;

  constructor() {
    TargetSiteDealer.initialize(sites);
  }

  protected getNewDummies = (dummyArrayLength: number): DummyPlayer[] => {
    if (this.generationLifetime == this.timeWhenDummiesFirstAppear) {
      return this.createNewDummies(dummyArrayLength);
    }

    if (this.generationLifetime == this.timeWhenDummiesStartMoving) {
      this.dummiesAreMoving = true;
    }

    this.currentDummySpawnSiteSequenceIndex++;

    if (this.currentDummySpawnSiteSequenceIndex == this.dummiesSpawnSiteSequence.length) {
      let newDummySpawnSite: number = Math.floor(randomBetween(0, sites.length));
      if (newDummySpawnSite == this.dummiesSpawnSiteSequence.at(-1)) {
        newDummySpawnSite = (newDummySpawnSite + 1) % sites.length;
      }
      this.dummiesSpawnSiteSequence.push(newDummySpawnSite);
    }

    return this.createNewDummies(dummyArrayLength);
  };

  private createNewDummies = (dummyArrayLength: number): DummyPlayer[] => {
    const newDummies: DummyPlayer[] = [];
    for (let i = 0; i < dummyArrayLength; i++) {
      const dummyPosition = sites[this.dummiesSpawnSiteSequence[this.currentDummySpawnSiteSequenceIndex]].copy();
      const newDummy: DummyPlayer = this.dummiesAreMoving
        ? new DummyPlayer(dummyPosition.add(new Vector2D(60, 0)), true)
        : new DummyPlayer(dummyPosition, false);
      newDummies.push(newDummy);
    }
    return newDummies;
  };

  abstract update(walls: Wall[]): void;
  abstract draw(ctx: CanvasRenderingContext2D, showSensors: boolean, selectedSpeciesId?: number): void;
  abstract calculateFitness(): void;
  abstract naturalSelection(): void;
  abstract drawBestMembersNeuralNetwork(ctx: CanvasRenderingContext2D, selectedSpeciesId: number): void;
  abstract exportBestNeuralNetwork(): void;
  abstract isPopulationExtinct(): boolean;
}
