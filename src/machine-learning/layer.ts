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
}

export default Layer;
