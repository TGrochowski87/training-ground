import Matrix from "utilities/matrix";

class Layer {
  inputs: number[];
  outputs: number[];
  weights: Matrix;

  receivedInputCount: number;
  receivedOutputCount: number;

  /*
     I N P U T
  O [ | | | | ]
  U [ | | | | ]
  T [ | | | | ]
  P [ | | | | ]
  U [ | | | | ]
  T [ | | | | ]
  */

  constructor(inputCount: number, outputCount: number, weights?: Matrix) {
    this.receivedInputCount = inputCount;
    this.receivedOutputCount = outputCount;

    // +1 is for bias which is basically an additional input.
    this.inputs = new Array<number>(inputCount + 1);
    this.outputs = new Array<number>(outputCount);

    if (weights) {
      this.weights = weights;
    } else {
      this.weights = new Matrix(outputCount, inputCount + 1);
      this.weights.randomize();
    }
  }

  feedForward = (inputs: number[]): number[] => {
    this.inputs = [...inputs, 1];
    const inputColumn = Matrix.singleColumnMatrixFromArray(this.inputs);
    const outputs = this.weights.dot(inputColumn).toArray();
    return outputs;
  };

  clone = (): Layer => {
    const clone = new Layer(this.receivedInputCount, this.receivedOutputCount, this.weights.clone());
    return clone;
  };

  crossover = (other: Layer): Layer => {
    const childWeights = this.weights.crossover(other.weights);
    const newLayer = new Layer(this.receivedInputCount, this.receivedOutputCount, childWeights);
    return newLayer;
  };

  mutate = (): void => {
    this.weights.mutate();
  };

  export = (): string => {
    const matrix = this.weights.export();
    let stringRepresentation = `${this.receivedInputCount} ${this.receivedOutputCount}\n${matrix}`;
    return stringRepresentation;
  };

  static import = (text: string): Layer => {
    let copy = text.split("\n");
    const countsText = copy.splice(0, 1);
    const counts = countsText[0].split(" ").map(s => +s);

    let weights = new Matrix(counts[1], counts[0] + 1);

    for (let i = 0; i < counts[1]; i++) {
      const row = copy[i].split(" ");

      for (let j = 0; j < counts[0] + 1; j++) {
        weights.matrix[i][j] = +row[j];
      }
    }

    const reconstructedLayer = new Layer(counts[0], counts[1], weights);
    return reconstructedLayer;
  };
}

export default Layer;
