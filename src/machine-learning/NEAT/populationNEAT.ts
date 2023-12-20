import {
  enemySpawnPoint,
  interspeciesMatingRate,
  massExtinctionThreshold,
  populationPartWithoutCrossover,
  speciesExtinctionThreshold,
} from "configuration";
import { randomBetween } from "utilities/mathExtensions";
import PartialConnectionData from "machine-learning/NEAT/models/PartialConnectionData";
import SplitNumber from "machine-learning/NEAT/models/SplitNumber";
import Species from "machine-learning/NEAT/species";
import Population from "machine-learning/population";
import Wall from "entities/wall";
import EnemyNEAT from "./enemyNEAT";
import NeuralNetworkNEAT from "./neuralNetworkNEAT";
import Connection from "./connection";

class PopulationNEAT extends Population {
  population: Species[];
  generation: number = 1;
  selectedSpecies: Species;
  lastUsedSpeciesId: number = 0;
  size: number;

  bestPopulationFitness: number = 0.0;
  generationsSinceLastImprovement: number = 0;
  speciesOfTopMember: number | undefined;

  targetSpeciesCount: number = 8;
  compatibilityThreshold: number = 8;
  compatibilityModifier: number = 0.2;

  // The list of new connections (innovations) can be also maintained for every new generation from scratch.
  // This would result in more species as some identical connections would have different historical number.
  // It is not clear which approach is more effective.
  innovations: PartialConnectionData[] = [];

  constructor(size: number, baseBrain?: NeuralNetworkNEAT) {
    super();

    this.size = size;
    this.population = [new Species(this.lastUsedSpeciesId++)];
    this.selectedSpecies = this.population[0];

    const initialPopulation: EnemyNEAT[] = [];
    for (let i = 0; i < size; i++) {
      initialPopulation.push(new EnemyNEAT(enemySpawnPoint.copy(), baseBrain?.clone(), false));
    }
    this.population[0].setNewGeneration(initialPopulation);

    // Prevent historical marking duplication when imported.
    if (baseBrain) {
      const importedInnovations: PartialConnectionData[] = baseBrain.connections
        .filter(c => c.nodeFrom.type == "Hidden" || c.nodeTo.type == "Hidden")
        .map(c => ({ historicalMarking: c.historicalMarking, nodeFrom: c.nodeFrom.id, nodeTo: c.nodeTo.id }));
      this.innovations = [...importedInnovations];
      Connection.globalMaxHistoricalMarking = Math.max(...importedInnovations.map(i => i.historicalMarking));
    }
  }

  update = (walls: Wall[]): void => {
    if (this.generationLifetime === this.maxGenerationLifetime) {
      for (const species of this.population) {
        species.killAllMembers();
      }
      this.generationLifetime = 0;
      return;
    }

    for (const species of this.population) {
      species.update(walls, this.generation, this.generationLifetime);
    }

    this.generationLifetime++;
  };

  draw(ctx: CanvasRenderingContext2D, showSensors: boolean, selectedSpeciesId?: number): void {
    if (selectedSpeciesId != undefined) {
      this.population.find(s => s.id == selectedSpeciesId)!.draw(ctx, showSensors);
    } else {
      for (const species of this.population) {
        species.draw(ctx, showSensors);
      }
    }
  }

  drawBestMembersNeuralNetwork(ctx: CanvasRenderingContext2D, selectedSpeciesId: number): void {
    this.population.find(s => s.id == selectedSpeciesId)!.drawBestNeuralNetwork(ctx);
  }

  exportBestNeuralNetwork(): void {
    this.population.forEach(s => s.exportBestNeuralNetwork(this.generation));
  }

  isPopulationExtinct = (): boolean => this.population.flatMap(s => s.members).every(m => m.isDead);

  calculateFitness = () => {
    this.population.forEach(s => s.calculateFitness());
    const populationFitness = this.population
      .map(s => s.collectiveAdjustedFitness)
      .reduce((prev, current) => prev + current, 0);

    if (populationFitness > this.bestPopulationFitness) {
      this.bestPopulationFitness = populationFitness;
      this.generationsSinceLastImprovement = 0;
    } else {
      this.generationsSinceLastImprovement++;
    }

    const fitnessRanking = this.population
      .flatMap(s => s.members.map(m => ({ speciesId: s.id, fitness: m.fitness })))
      .sort((a, b) => b.fitness - a.fitness);

    console.log("====================");
    console.log(`Generation ${this.generation}`);
    console.log("Fitness ranking:");
    console.log(`Species: ${fitnessRanking[0].speciesId}, fitness: ${fitnessRanking[0].fitness}`);
    console.log(`Species: ${fitnessRanking[1].speciesId}, fitness: ${fitnessRanking[1].fitness}`);
    console.log(`Species: ${fitnessRanking[2].speciesId}, fitness: ${fitnessRanking[2].fitness}`);

    this.speciesOfTopMember = fitnessRanking[0].speciesId;
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

    const offspring: EnemyNEAT[] = [];
    const assignedOffspringCounts: number[] = this.calculateOffspringNumberPerSpecies();
    this.population.forEach(s => s.sortMembersByAdjustedFitness());
    this.population.forEach(s => s.removeLeastPerformingMembers());

    for (let i = 0; i < this.population.length; i++) {
      let offspringLeftToProduce: number = assignedOffspringCounts[i];
      let offspringToProduceWithoutCrossover: number = Math.floor(
        offspringLeftToProduce * populationPartWithoutCrossover
      );

      const speciesId = this.population[i].id;
      const champion = this.population[i].cloneChampion(speciesId == this.speciesOfTopMember);
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

    if (this.generation % this.numberOfGenerationsBetweenIncrease == 0) {
      this.maxGenerationLifetime += this.generationLifetimeIncrease;
      console.log(`Generation lifetime increased to ${this.maxGenerationLifetime}`);
    }
    this.generation++;
  };

  selectSpeciesForNeuralNetworkDrawing = (id: number) => {
    const selectedSpecies = this.population.find(s => s.id == id);

    // TODO: Might switch from removing species from list to marking as extinct.
    if (selectedSpecies == undefined) {
      throw Error("This species is not a part of current population.");
    }

    // TODO: Must change switch selected species in event of extinction.
    this.selectedSpecies = selectedSpecies;
  };

  private distributeOffspringBetweenSpecies = (offspring: ReadonlyArray<EnemyNEAT>) => {
    const speciesAssignments: EnemyNEAT[][] = Array.from({ length: this.population.length }, (v, k) => []);
    let representatives: EnemyNEAT[] = this.population.map(s => s.getRandomRepresentative());

    for (const descendant of offspring) {
      const compatibleSpeciesIndex: number | null = this.findCompatibleSpeciesIndex(representatives, descendant);

      if (compatibleSpeciesIndex != null) {
        speciesAssignments[compatibleSpeciesIndex].push(descendant);
      } else {
        const newSpeciesId: number = this.lastUsedSpeciesId++;
        const newSpecies = new Species(newSpeciesId);
        this.population.push(newSpecies);

        representatives.push(descendant);
        speciesAssignments.push([]);
        speciesAssignments.at(-1)!.push(descendant);
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

  private replacementOfGenerations = (assignments: EnemyNEAT[][]) => {
    for (let i = 0; i < assignments.length; i++) {
      this.population[i].setNewGeneration(assignments[i]);
    }
  };

  private findCompatibleSpeciesIndex = (representatives: EnemyNEAT[], descendant: EnemyNEAT): number | null => {
    for (let i = 0; i < representatives.length; i++) {
      if (representatives[i].isCompatible(descendant, this.compatibilityThreshold)) {
        return i;
      }
    }

    return null;
  };

  private reproductionByCrossover = (speciesIndex: number): EnemyNEAT => {
    const parents: [EnemyNEAT, EnemyNEAT] = this.selectParents(speciesIndex);
    return parents[0].crossover(parents[1]);
  };

  private reproductionByCloning = (speciesIndex: number): EnemyNEAT => {
    return this.selectParent(this.population[speciesIndex]).clone();
  };

  private selectParents = (speciesIndex: number): [EnemyNEAT, EnemyNEAT] => {
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
  private selectParent = (species: Species): EnemyNEAT => {
    const fitnessSum = species.members.map(s => Math.pow(s.fitness, 2)).reduce((prev, current) => prev + current, 0);
    const rand: number = randomBetween(0, fitnessSum);

    let runningSum: number = 0.0;
    for (let i = 0; i < species.members.length; i++) {
      runningSum += Math.pow(species.members[i].fitness, 2);

      if (runningSum >= rand) {
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
      const species = this.population[i];

      if (
        species.generationsSinceLastImprovement >= speciesExtinctionThreshold &&
        species.id != this.speciesOfTopMember // Save the species of the best member of the whole generation.
      ) {
        console.log(`Species ${species.id} went extinct.`);
      } else {
        speciesLeft.push(species);
      }
    }

    this.population = [...speciesLeft];
  };

  private filterOutEmptySpecies = () => {
    const speciesLeft: Species[] = [];
    for (let i = 0; i < this.population.length; i++) {
      const species = this.population[i];

      if (species.members.length == 0) {
        console.log(`Species ${species.id} went extinct.`);
      } else {
        speciesLeft.push(species);
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
    const populationFitness = this.population
      .map(s => s.collectiveAdjustedFitness)
      .reduce((prev, current) => prev + current, 0);

    const fitnesses = this.population.map(s => s.collectiveAdjustedFitness);
    const contributions = fitnesses.map(f => (f / populationFitness) * 100);
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
