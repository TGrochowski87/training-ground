import {
  interspeciesMatingRate,
  massExtinctionThreshold,
  populationPartWithoutCrossover,
  speciesExtinctionThreshold,
} from "configuration";
import { randomBetween } from "utilities/mathExtensions";
import PartialConnectionData from "machine-learning/NEAT/models/PartialConnectionData";
import SplitNumber from "machine-learning/NEAT/models/SplitNumber";
import Species from "machine-learning/NEAT/species";
import Specimen from "machine-learning/NEAT/specimen";
import Population from "machine-learning/population";
import { Mode } from "models/UserSettings";

class PopulationNEAT extends Population {
  population: Species[];
  selectedSpecies: Species;
  lastUsedSpeciesId: number = 0;
  size: number;

  populationFitness: number = 0.0;
  bestPopulationFitness: number = 0.0;
  generationsSinceLastImprovement: number = 0;

  targetSpeciesCount: number = 10;
  compatibilityThreshold: number = 3;
  compatibilityModifier: number = 0.3;

  // The list of new connections (innovations) can be also maintained for every new generation from scratch.
  // This would result in more species as some identical connections would have different historical number.
  // It is not clear which approach is more effective.
  innovations: PartialConnectionData[] = [];

  constructor(size: number, trainingMode: Mode) {
    super();

    this.size = size;
    this.population = [new Species(this.lastUsedSpeciesId++)];
    this.selectedSpecies = this.population[0];

    for (let i = 0; i < size; i++) {
      this.population[0].push(new Specimen());
    }
  }

  think = (inputs: number[], expectedOutput: number) => this.population.forEach(s => s.think(inputs, expectedOutput));

  calculateFitness = () => {
    this.population.forEach(s => s.calculateFitness());
    this.populationFitness = this.population
      .map(s => s.collectiveAdjustedFitness)
      .reduce((prev, current) => prev + current, 0);

    if (this.populationFitness > this.bestPopulationFitness) {
      this.bestPopulationFitness = this.populationFitness;
      this.generationsSinceLastImprovement = 0;
    } else {
      this.generationsSinceLastImprovement++;
    }
  };

  naturalSelection = () => {
    this.sortSpeciesByFitness();

    // Could consider marking species as extinct instead of removing them to make the data available.
    if (this.shouldMassExtinctionHappen()) {
      console.log("Mass extinction event!");
      this.population = this.population.slice(0, 2);
    } else {
      this.filterOutStagnantSpecies();
    }

    const offspring: Specimen[] = [];
    const assignedOffspringCounts: number[] = this.calculateOffspringNumberPerSpecies();
    this.population.forEach(s => s.sortMembersByAdjustedFitness());
    this.population.forEach(s => s.removeLeastPerformingMembers());

    for (let i = 0; i < this.population.length; i++) {
      let offspringLeftToProduce: number = assignedOffspringCounts[i];
      let offspringToProduceWithoutCrossover: number = Math.floor(
        offspringLeftToProduce * populationPartWithoutCrossover
      );

      const champion = this.population[i].cloneChampion();
      if (champion != null) {
        offspringLeftToProduce--;
        offspring.push(champion);
      }

      for (; offspringLeftToProduce > 0; offspringLeftToProduce--) {
        const shouldOmitCrossover: boolean = offspringToProduceWithoutCrossover > 0;
        if (shouldOmitCrossover) {
          offspringToProduceWithoutCrossover--;
        }

        const child = shouldOmitCrossover ? this.reproductionByCloning(i) : this.reproductionByCrossover(i);
        const resultingInnovativeConnections = child.mutate(this.innovations);

        offspring.push(child);
        for (const innovation of resultingInnovativeConnections) {
          if (innovation != null) this.innovations.push(innovation);
        }
      }
    }

    this.adjustCompatibilityThreshold();
    this.distributeOffspringBetweenSpecies(offspring);
    this.filterOutEmptySpecies();
  };

  getMemberWithSolution = (): Specimen | undefined =>
    this.population.map(s => s.getMemberWithSolution()).find(specimen => specimen != undefined);

  getBestMember(): Specimen {
    const bestOnes = this.population.map(s => s.getBestMember());
    // Normal fitness used to find the best specimen regardless of species and species size.
    const highestFitness: number = Math.max(...bestOnes.map(s => s.fitness));
    const bestSpecimen = bestOnes.find(s => s.fitness == highestFitness);

    if (bestSpecimen == undefined) {
      throw Error("Could not determine the best specimen in the population.");
    }

    return bestSpecimen;
  }

  selectSpecies = (id: number) => {
    const selectedSpecies = this.population.find(s => s.id == id);

    // TODO: Might switch from removing species from list to marking as extinct.
    if (selectedSpecies == undefined) {
      throw Error("This species is not a part of current population.");
    }

    // TODO: Must change switch selected species in event of extinction.
    this.selectedSpecies = selectedSpecies;
  };

  private distributeOffspringBetweenSpecies = (offspring: ReadonlyArray<Specimen>) => {
    const speciesAssignments: Specimen[][] = Array.from({ length: this.population.length }, (v, k) => []);
    let representatives: Specimen[] = this.population.map(s => s.getRandomRepresentative());

    for (const descendant of offspring) {
      const compatibleSpeciesIndex: number | null = this.findCompatibleSpeciesIndex(representatives, descendant);

      if (compatibleSpeciesIndex != null) {
        speciesAssignments[compatibleSpeciesIndex].push(descendant);
      } else {
        const newSpeciesId: number = speciesAssignments.length;
        const newSpecies = new Species(newSpeciesId);
        this.population.push(newSpecies);

        representatives.push(descendant);
        speciesAssignments.push([]);
        speciesAssignments[newSpeciesId].push(descendant);
      }
    }

    this.replacementOfGenerations(speciesAssignments);
  };

  // TODO: Might want to start adjusting after some generations.
  private adjustCompatibilityThreshold = () => {
    if (this.population.length > this.targetSpeciesCount) {
      this.compatibilityThreshold += this.compatibilityModifier;
    } else if (this.population.length > this.targetSpeciesCount) {
      this.compatibilityThreshold -= this.compatibilityModifier;
    }
  };

  private replacementOfGenerations = (assignments: Specimen[][]) => {
    for (let i = 0; i < assignments.length; i++) {
      this.population[i].setNewGeneration(assignments[i]);
    }
  };

  private findCompatibleSpeciesIndex = (representatives: Specimen[], descendant: Specimen): number | null => {
    for (let i = 0; i < representatives.length; i++) {
      if (representatives[i].isCompatible(descendant, this.compatibilityThreshold)) {
        return i;
      }
    }

    return null;
  };

  private reproductionByCrossover = (speciesIndex: number): Specimen => {
    const parents: [Specimen, Specimen] = this.selectParents(speciesIndex);
    return parents[0].crossover(parents[1]);
  };

  private reproductionByCloning = (speciesIndex: number): Specimen => {
    return this.selectParent(this.population[speciesIndex]).clone();
  };

  private selectParents = (speciesIndex: number): [Specimen, Specimen] => {
    const isInterspecies = Math.random() < interspeciesMatingRate;

    let speciesOfParent2 = this.population[speciesIndex];
    if (isInterspecies) {
      let randomSpeciesIndex = Math.floor(Math.random() * this.population.length);
      if (randomSpeciesIndex == speciesIndex) {
        randomSpeciesIndex = (randomSpeciesIndex + 1) % this.population.length;
      }

      speciesOfParent2 = this.population[randomSpeciesIndex];
    }

    return [this.selectParent(this.population[speciesIndex]), this.selectParent(speciesOfParent2)];
  };

  /**
   * It is possible for one specimen to be selected twice.
   */
  private selectParent = (species: Species): Specimen => {
    const fitnessSum = species.members.map(s => s.adjustedFitness).reduce((prev, current) => prev + current, 0);
    const rand: number = randomBetween(0, fitnessSum);

    let runningSum: number = 0.0;
    for (let i = 0; i < species.members.length; i++) {
      runningSum += species.members[i].adjustedFitness;

      if (runningSum > rand) {
        return species.members[i];
      }
    }

    throw new Error("This should be unreachable.");
  };

  private sortSpeciesByFitness = () => {
    this.population.sort((a, b) => b.collectiveAdjustedFitness - a.collectiveAdjustedFitness);
  };

  private shouldMassExtinctionHappen = (): boolean => this.generationsSinceLastImprovement == massExtinctionThreshold;

  private filterOutStagnantSpecies = () => {
    if (this.population.length < 5) return;

    const speciesLeft: Species[] = [];
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].generationsSinceLastImprovement >= speciesExtinctionThreshold) {
        console.log(`Species ${this.population[i].id} went extinct.`);
      } else {
        speciesLeft.push(this.population[i]);
      }
    }

    this.population = [...speciesLeft];
  };

  private filterOutEmptySpecies = () => {
    const speciesLeft: Species[] = [];
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].members.length == 0) {
        console.log(`Species ${this.population[i].id} went extinct.`);
      } else {
        speciesLeft.push(this.population[i]);
      }
    }

    this.population = [...speciesLeft];
  };

  /**
   * This method calculates the offspring counts for every species in the population.
   * There is no manual rounding performed. After the raw distribution is finished, the decimal
   * factors of the values are cut off. All places that were not assigned because of rounding issues
   * are given to every consecutive number which had the highest decimal value.
   * @returns
   */
  private calculateOffspringNumberPerSpecies = (): number[] => {
    const fitnesses = this.population.map(s => s.collectiveAdjustedFitness);
    const contributions = fitnesses.map(f => (f / this.populationFitness) * 100);
    const rawMemberCounts = contributions.map(c => (c * this.size) / 100);
    let countValuesSplitByComma: SplitNumber[] = rawMemberCounts.map(c => {
      return { integer: Math.floor(c), decimal: c % 1 };
    });
    const placesLeft =
      this.size - countValuesSplitByComma.map(v => v.integer).reduce((prev, current) => prev + current, 0);
    for (let i = 0; i < placesLeft; i++) {
      const maxDecimalFactor = Math.max(...countValuesSplitByComma.map(v => v.decimal));
      countValuesSplitByComma = countValuesSplitByComma.map(v =>
        v.decimal == maxDecimalFactor ? { integer: v.integer + 1, decimal: 0 } : v
      );
    }

    return countValuesSplitByComma.map(v => v.integer);
  };
}

export default PopulationNEAT;
