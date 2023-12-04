import Wall from "entities/wall";

export default abstract class Population {
  abstract update(walls: Wall[]): void;
  abstract draw(ctx: CanvasRenderingContext2D, showSensors: boolean): void;
  abstract calculateFitness(): void;
  abstract naturalSelection(): void;
  abstract drawBestMembersNeuralNetwork(ctx: CanvasRenderingContext2D): void;
  abstract exportBestNeuralNetwork(): void;
  abstract isPopulationExtinct(): boolean;
}
