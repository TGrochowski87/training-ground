import Matrix from "utilities/matrix";

class Layer {
  inputs: number[];
  outputs: number[];
  weights: Matrix;

  /*
      OUTPUT
  I [ | | | | ]
  N [ | | | | ]
  P [ | | | | ]
  U [ | | | | ]
  T [ | | | | ]
  */

  constructor(inputCount: number, outputCount: number) {
    // +1 is for bias which is basically an additional input.
    this.inputs = new Array<number>(inputCount + 1);
    this.outputs = new Array<number>(outputCount);
    this.weights = new Matrix(inputCount + 1, outputCount);
    this.weights.randomize();
  }
}

export default Layer;
