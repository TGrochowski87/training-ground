import Enemy from "entities/enemy";
import Vector2D from "utilities/vector2d";

class Population {
  enemies: Enemy[];
  bestEnemyIndex: number;

  fitnessSum: number;

  constructor(amount: number) {
    this.enemies = [];
    this.bestEnemyIndex = 0;
    this.fitnessSum = 0;

    for (let i = 0; i < amount; i++) {
      this.enemies.push(new Enemy(new Vector2D(100, 100)));
    }
  }

  update = () => {};
}

export default Population;
