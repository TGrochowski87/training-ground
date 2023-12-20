import { enemySpawnPoint, sites } from "configuration";
import DummyPlayer from "entities/dummyPlayer";
import Wall from "entities/wall";
import Population from "machine-learning/population";
import { randomBetween } from "utilities/mathExtensions";
import Vector2D from "utilities/vector2d";
import EnemyConventional from "./enemyConventional";
import NeuralNetworkConventional from "./neuralNetworkConventional";

class PopulationConventional extends Population {
  members: EnemyConventional[];
  dummies: DummyPlayer[];

  memberColor: string = "#A77500";

  constructor(size: number, baseBrain?: NeuralNetworkConventional) {
    super();

    this.members = [];
    this.dummies = [];

    for (let i = 0; i < size; i++) {
      this.members.push(new EnemyConventional(enemySpawnPoint.copy(), baseBrain?.clone(), false));
      this.dummies.push(new DummyPlayer(new Vector2D(-1000, -1000), false, true));
    }
  }

  update = (walls: Wall[]) => {
    if (this.generationLifetime === this.maxGenerationLifetime) {
      for (const member of this.members) {
        member.isDead = true;
      }
      this.generationLifetime = 0;
      return;
    }

    for (let i = 0; i < this.members.length; i++) {
      this.members[i].update(walls, this.dummies[i], this.maxGenerationLifetime);
      this.dummies[i].update(walls);
    }

    this.generationLifetime++;
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean, selectedSpeciesId?: number): void => {
    for (let i = 1; i < this.members.length; i++) {
      this.members[i].draw(ctx, showSensors, this.memberColor);
      this.dummies[i].draw(ctx);
    }

    // The champion is always at index 0, so draw him last, so it would be always visible.
    this.members[0].draw(ctx, showSensors, this.memberColor);
    this.dummies[0].draw(ctx);
  };

  drawBestMembersNeuralNetwork = (ctx: CanvasRenderingContext2D, selectedSpeciesId: number): void => {
    this.members[0].drawBrain(ctx);
  };

  exportBestNeuralNetwork(): void {
    const champion = this.members.find(m => m.isChampion);
    if (champion == undefined) {
      console.log("No champion to export.");
      return;
    }

    champion.exportBrain(this.generation);
  }

  isPopulationExtinct = (): boolean => this.members.every(e => e.isDead);

  calculateFitness = (): void => {
    for (const member of this.members) {
      member.calculateFitness();
    }
    const fitnessRanking = this.members
      .map(e => e.fitness)
      .sort((a, b) => b - a)
      .slice(0, 3);

    console.log("====================");
    console.log(`Generation ${this.generation}`);
    console.log("Fitness ranking:");
    console.log(fitnessRanking[0]);
    console.log(fitnessRanking[1]);
    console.log(fitnessRanking[2]);
  };

  naturalSelection = (): void => {
    let newPopulation: EnemyConventional[] = new Array<EnemyConventional>(this.members.length);
    let newDummies: DummyPlayer[] = new Array<DummyPlayer>(this.members.length);

    const bestEnemyIndex = this.findBestPlayerIndex();
    newPopulation[0] = this.members[bestEnemyIndex].clone(true);
    newDummies[0] = new DummyPlayer(new Vector2D(-1000, -1000), false, true);

    for (let i = 1; i < newPopulation.length; i++) {
      const parents = [this.selectEnemy(), this.selectEnemy()];
      // TODO: Consider cloning instead of crossover at some rate.
      newPopulation[i] = parents[0].crossover(parents[1]);
      newPopulation[i].mutate();

      newDummies[i] = new DummyPlayer(new Vector2D(-1000, -1000), false, true);
    }

    this.members = [...newPopulation];
    this.dummies = [...newDummies];

    if (this.generation % this.numberOfGenerationsBetweenIncrease == 0) {
      this.maxGenerationLifetime += this.generationLifetimeIncrease;
      console.log(`Generation lifetime increased to ${this.maxGenerationLifetime}`);
    }
    this.generation++;
  };

  private selectEnemy = (): EnemyConventional => {
    const fitnessSum = this.members.map(e => Math.pow(e.fitness, 2)).reduce((prev, current) => prev + current, 0);
    const rand: number = randomBetween(0, fitnessSum);

    let runningSum: number = 0.0;
    for (let i = 0; i < this.members.length; i++) {
      runningSum += Math.pow(this.members[i].fitness, 2);

      if (runningSum > rand) {
        return this.members[i];
      }
    }

    throw new Error("This should be unreachable.");
  };

  private findBestPlayerIndex = (): number => {
    const fitnessList = this.members.map(e => e.fitness);
    const maxFitness = Math.max(...fitnessList);
    const indexOfBest = this.members.findIndex(e => e.fitness === maxFitness);

    if (indexOfBest === -1) {
      throw Error("Could not find the index of the best member.");
    }

    return indexOfBest;
  };
}

export default PopulationConventional;
