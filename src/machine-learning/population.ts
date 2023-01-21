import { dummySpawnPoint, enemySpawnPoint } from "configuration";
import DummyPlayer from "entities/dummyPlayer";
import Enemy from "entities/enemy";
import Wall from "entities/wall";
import NeuralNetwork from "./neuralNetwork";

class Population {
  enemies: Enemy[];
  dummies: DummyPlayer[];
  generation: number = 1;

  constructor(amount: number, baseBrain?: NeuralNetwork) {
    this.enemies = [];
    this.dummies = [];

    for (let i = 0; i < amount; i++) {
      this.enemies.push(new Enemy(enemySpawnPoint.copy(), baseBrain?.clone()));
      this.dummies.push(new DummyPlayer(dummySpawnPoint));
    }
  }

  update = (walls: Wall[]) => {
    console.log(this.enemies[0].points);

    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].update(walls, this.dummies[i]);
      this.dummies[i].update(walls);
    }
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean): void => {
    this.enemies[0].draw(ctx, showSensors, true);
    this.dummies[0].draw(ctx);

    for (let i = 1; i < this.enemies.length; i++) {
      this.enemies[i].draw(ctx, showSensors, false);
      this.dummies[i].draw(ctx);
    }
  };

  calculateFitness = (): void => {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].calculateFitness();
    }
    const fitnessRanking = this.enemies
      .map(e => e.fitness)
      .sort((a, b) => b - a)
      .slice(0, 5);

    console.log("====================");
    console.log(`Generation ${this.generation}`);
    console.log("Fitness ranking:");
    console.log(fitnessRanking[0]);
    console.log(fitnessRanking[1]);
    console.log(fitnessRanking[2]);
  };

  neuralSelection = (): void => {
    let newPopulation: Enemy[] = new Array<Enemy>(this.enemies.length);
    let newDummies: DummyPlayer[] = new Array<DummyPlayer>(this.enemies.length);

    const bestEnemyIndex = this.findBestPlayerIndex();
    newPopulation[0] = this.enemies[bestEnemyIndex].clone();
    newDummies[0] = new DummyPlayer(dummySpawnPoint);

    for (let i = 1; i < newPopulation.length; i++) {
      const parents = [this.selectEnemy(), this.selectEnemy()];
      newPopulation[i] = parents[0].crossover(parents[1]);
      newPopulation[i].mutate();

      newDummies[i] = new DummyPlayer(dummySpawnPoint);
    }

    this.enemies = [...newPopulation];
    this.dummies = [...newDummies];
    this.generation++;
  };

  private selectEnemy = (): Enemy => {
    let fitnessSum = this.enemies.map(e => e.fitness).reduce((prev, current) => prev + current, 0);
    const rand: number = Math.floor(Math.random() * fitnessSum);

    let runningSum: number = 0.0;
    for (let i = 0; i < this.enemies.length; i++) {
      runningSum += this.enemies[i].fitness;

      if (runningSum > rand) {
        return this.enemies[i];
      }
    }

    throw new Error("This should be unreachable.");
  };

  private findBestPlayerIndex = (): number => {
    const fitnessList = this.enemies.map(e => e.fitness);
    const maxFitness = Math.max(...fitnessList);
    const indexOfBest = this.enemies.findIndex(e => e.fitness === maxFitness);

    if (indexOfBest === -1) {
      throw Error("Could not find the index of the best Enemy.");
    }

    return indexOfBest;
  };
}

export default Population;
