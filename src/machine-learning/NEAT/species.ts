import { partOfSpeciesMembersAllowedToReproduce } from "configuration";
import Specimen from "machine-learning/NEAT/specimen";

class Species {
  // Used for distinguishing a species after sorting population.
  id: number;
  members: Specimen[] = [];

  collectiveAdjustedFitness: number = 0.0;
  bestCollectiveAdjustedFitness: number = 0.0;
  generationsSinceLastImprovement: number = 0;

  constructor(id: number) {
    this.id = id;
  }

  draw = (ctx: CanvasRenderingContext2D) => {
    // TODO: Champions are just a part of a new population and are distributed between species without any indicator.
    // They should be marked, so that the can be displayed.
    this.members[0].draw(ctx);
  };

  think = (inputs: number[], expectedOutput: number) => {
    for (const member of this.members) {
      member.think(inputs, expectedOutput);
    }
  };
  calculateFitness = () => {
    this.members.forEach(m => m.calculateIndependentFitness());

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

  getMemberWithSolution = (): Specimen | undefined => this.members.find(m => m.solutionFound);

  getBestMember(): Specimen {
    const highestAdjustedFitness: number = Math.max(...this.members.map(s => s.adjustedFitness));
    const bestSpecimen = this.members.find(s => s.adjustedFitness == highestAdjustedFitness);

    if (bestSpecimen == undefined) {
      throw Error("Could not determine the best specimen in the species.");
    }

    return bestSpecimen;
  }

  sortMembersByAdjustedFitness = () => {
    this.members.sort((a, b) => b.adjustedFitness - a.adjustedFitness);
  };

  /**
   * Should be done after sorting.
   * @returns
   */
  removeLeastPerformingMembers = () => {
    const startingIndex = Math.ceil(this.members.length * partOfSpeciesMembersAllowedToReproduce);
    this.members.splice(startingIndex);
  };

  /**
   * Should be done after sorting.
   * @returns
   */
  cloneChampion = (): Specimen | null => {
    if (this.members.length <= 5) {
      return null;
    }

    const champion = this.members[0];
    return champion.clone(true);
  };

  getRandomRepresentative = (): Specimen => {
    return this.members[Math.floor(Math.random() * this.members.length)];
  };

  setNewGeneration = (newGeneration: Specimen[]) => {
    this.collectiveAdjustedFitness = 0;
    this.members = [...newGeneration];
  };

  push = (newMember: Specimen) => this.members.push(newMember);
}

export default Species;
