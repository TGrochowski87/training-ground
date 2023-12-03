import NeuralNetwork from "machine-learning/NEAT/neuralNetwork";
import PartialConnectionData from "machine-learning/NEAT/models/PartialConnectionData";

class Specimen {
  brain: NeuralNetwork;
  fitness: number = 0.0;
  adjustedFitness: number = 0.0;
  isChampion: boolean;

  // XOR problem
  totalMistakeDistance: number = 0;
  solutionFound: boolean = true;

  constructor(brain?: NeuralNetwork, isChampion: boolean = false) {
    this.brain = brain ?? new NeuralNetwork({ type: "Creation", inputs: 2, outputs: 1 });
    this.isChampion = isChampion;
  }

  draw = (ctx: CanvasRenderingContext2D) => {
    this.brain.draw(ctx);
  };

  think = (inputs: number[], expectedOutput: number): number => {
    const output: number = this.brain.process(inputs)[0];

    if (Math.round(output) != expectedOutput) {
      this.solutionFound = false;
    }

    this.totalMistakeDistance += Math.abs(expectedOutput - output);
    return output;
  };

  calculateIndependentFitness = () => {
    // Could be mean/sum squared error
    this.fitness = Math.pow(4 - this.totalMistakeDistance, 2);
  };

  isCompatible = (other: Specimen, compatibilityThreshold: number): boolean => {
    const compatibilityDistance = this.brain.calculateCompatibilityDistance(other.brain);
    return compatibilityDistance < compatibilityThreshold;
  };

  setAdjustedFitness = (value: number) => (this.adjustedFitness = value);

  mutate = (innovations: ReadonlyArray<PartialConnectionData>): (PartialConnectionData | null)[] => {
    this.brain.mutateWeights();
    const newConnectionsFromAddNode = this.brain.mutateAddNode(innovations);
    const newConnectionFromAddConnection = this.brain.mutateAddConnection(innovations);

    return [...newConnectionsFromAddNode, newConnectionFromAddConnection];
  };

  crossover = (other: Specimen): Specimen => {
    if (this.adjustedFitness == other.adjustedFitness) {
      return new Specimen(this.brain.crossover(other.brain, true));
    }

    if (this.adjustedFitness > other.adjustedFitness) {
      return new Specimen(this.brain.crossover(other.brain, false));
    } else {
      return new Specimen(other.brain.crossover(this.brain, false));
    }
  };

  clone = (isChampion?: boolean): Specimen => {
    return new Specimen(this.brain.clone(), isChampion);
  };
}

export default Specimen;
