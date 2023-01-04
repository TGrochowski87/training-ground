import Matrix from "utilities/matrix";

class Layer {
  inputs: number[];
  outputs: number[];
  weights: Matrix;

  /*
     I N P U T
  O [ | | | | ]
  U [ | | | | ]
  T [ | | | | ]
  P [ | | | | ]
  U [ | | | | ]
  T [ | | | | ]
  */

  constructor(inputCount: number, outputCount: number) {
    // +1 is for bias which is basically an additional input.
    this.inputs = new Array<number>(inputCount + 1);
    this.outputs = new Array<number>(outputCount);
    this.weights = new Matrix(outputCount, inputCount + 1);
    this.weights.randomize();
  }

  feedForward = (inputs: number[]): number[] => {
    this.inputs = [...inputs, 1];
    //this.setBias();
    const inputColumn = Matrix.singleColumnMatrixFromArray(this.inputs);
    const outputs = this.weights.dot(inputColumn).toArray();
    return outputs;
  };

  private setBias = () => {
    const biasValue = 1;
    this.inputs[this.inputs.length - 1] = biasValue;
  };
}

export default Layer;
