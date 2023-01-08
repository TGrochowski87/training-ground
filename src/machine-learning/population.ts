import { enemySpawnPoint } from "configuration";
import Enemy from "entities/enemy";
import Player from "entities/player";
import Wall from "entities/wall";

class Population {
  enemies: Enemy[];
  bestEnemyIndex: number;
  generation: number = 1;

  constructor(amount: number) {
    this.enemies = [];
    this.bestEnemyIndex = 0;

    for (let i = 0; i < amount; i++) {
      this.enemies.push(new Enemy(enemySpawnPoint.copy()));
    }
  }

  update = (walls: Wall[], player: Player) => {
    for (const enemy of this.enemies) {
      enemy.update(walls, player);
    }
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean): void => {
    this.enemies[0].draw(ctx, showSensors, true);
    for (let i = 1; i < this.enemies.length; i++) {
      this.enemies[i].draw(ctx, showSensors, false);
    }
  };

  calculateFitness = (player: Player): void => {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].calculateFitness(player);
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

    this.setBestPlayer();
    newPopulation[0] = this.enemies[this.bestEnemyIndex].clone();

    for (let i = 1; i < newPopulation.length; i++) {
      const parents = [this.selectEnemy(), this.selectEnemy()];
      newPopulation[i] = parents[0].crossover(parents[1]);
      newPopulation[i].mutate();
    }

    this.enemies = [...newPopulation];
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

  private setBestPlayer = () => {
    const fitnessList = this.enemies.map(e => e.fitness);
    const maxFitness = Math.max(...fitnessList);
    const indexOfBest = this.enemies.findIndex(e => e.fitness === maxFitness);

    if (indexOfBest === -1) {
      throw Error("Could not find the index of the best Enemy.");
    }

    this.bestEnemyIndex = indexOfBest;
  };
}

export default Population;
