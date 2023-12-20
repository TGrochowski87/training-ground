import { partOfSpeciesMembersAllowedToReproduce } from "configuration";
import DummyPlayer from "entities/dummyPlayer";
import Wall from "entities/wall";
import { getRandomColor } from "utilities/mechanicsFunctions";
import Vector2D from "utilities/vector2d";
import EnemyNEAT from "./enemyNEAT";

class Species {
  // Used for distinguishing a species after sorting population.
  id: number;

  members: EnemyNEAT[] = [];
  dummies: DummyPlayer[] = [];

  collectiveAdjustedFitness: number = 0.0;
  bestCollectiveAdjustedFitness: number = 0.0;
  generationsSinceLastImprovement: number = 0;

  memberColor: string;

  constructor(id: number) {
    this.id = id;
    this.memberColor = getRandomColor();
  }

  update = (walls: Wall[], lifetime: number): void => {
    for (let i = 0; i < this.members.length; i++) {
      this.members[i].update(walls, this.dummies[i], lifetime);
      this.dummies[i].update(walls);
    }
  };

  draw = (ctx: CanvasRenderingContext2D, showSensors: boolean) => {
    for (let i = 1; i < this.members.length; i++) {
      this.members[i].draw(ctx, showSensors, this.memberColor);
      this.dummies[i].draw(ctx);
    }

    // The champion is always at index 0, so draw him last, so it would be always visible.
    this.members[0].draw(ctx, showSensors, this.memberColor);
    this.dummies[0].draw(ctx);
  };

  drawBestNeuralNetwork = (ctx: CanvasRenderingContext2D) => {
    const member = this.members.find(m => m.isChampion) ?? this.members[0];
    member.drawBrain(ctx);
  };

  exportBestNeuralNetwork(generation: number): void {
    const champions = this.members.filter(m => m.isChampion);
    for (const champion of champions) {
      champion.exportBrain(generation);
    }
  }

  killAllMembers = () => {
    this.members.forEach(m => (m.isDead = true));
  };

  calculateFitness = () => {
    this.members.forEach(m => m.calculateFitness());

    for (const member of this.members) {
      const adjustedFitness = member.fitness / this.members.length;
      member.setAdjustedFitness(adjustedFitness);
      this.collectiveAdjustedFitness += adjustedFitness;
    }

    if (this.collectiveAdjustedFitness > this.bestCollectiveAdjustedFitness) {
      this.bestCollectiveAdjustedFitness = this.collectiveAdjustedFitness;
      this.generationsSinceLastImprovement = 0;
    } else {
      this.generationsSinceLastImprovement++;
    }
  };

  sortMembersByAdjustedFitness = () => {
    this.members.sort((a, b) => b.adjustedFitness - a.adjustedFitness);
  };

  /**
   * Should be done after sorting.
   */
  removeLeastPerformingMembers = () => {
    const startingIndex = Math.ceil(this.members.length * partOfSpeciesMembersAllowedToReproduce);
    this.members.splice(startingIndex);
  };

  /**
   * Should be done after sorting.
   */
  cloneChampion = (evenIfSmallPopulation: boolean): EnemyNEAT | null => {
    if (evenIfSmallPopulation == false && this.members.length <= 5) {
      return null;
    }

    // This is done after sorting and before the replacement of generations, so the champion is at index 0.
    const champion = this.members[0];
    return champion.clone(true, this.id);
  };

  getRandomRepresentative = (): EnemyNEAT => {
    return this.members[Math.floor(Math.random() * this.members.length)];
  };

  setNewGeneration = (newGeneration: EnemyNEAT[]) => {
    this.collectiveAdjustedFitness = 0;
    // At this point the champions are distributed randomly and there can even be more than one in one species.
    this.members = [...newGeneration];

    this.dummies = [];
    for (let i = 0; i < newGeneration.length; i++) {
      this.dummies.push(new DummyPlayer(new Vector2D(-1000, -1000), false, true));
    }
  };
}

export default Species;
