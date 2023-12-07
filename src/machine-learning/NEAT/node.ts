import { steepSigmoid } from "machine-learning/activationFunctions";

export type NodeType = "Input" | "Hidden" | "Output";

class Node {
  guid: string;
  id: number;
  type: NodeType;

  inputCount: number;
  inputs: number[] = [];

  // Used for drawing
  layer: number;

  constructor(id: number, type: NodeType, layer: number, inputCount: number) {
    this.id = id;
    this.type = type;
    this.layer = layer;
    this.inputCount = inputCount;
    this.guid = crypto.randomUUID();
  }

  allInputsReceived = (): boolean => {
    return this.inputs.length == this.inputCount;
  };

  receiveInput = (input: number) => {
    this.inputs.push(input);
  };

  produceOutput = (): number => {
    const inputSum = this.inputs.reduce((prev, current) => prev + current, 0);
    return steepSigmoid(inputSum);
  };

  clearInput = () => {
    this.inputs = [];
  };

  incrementInputCount = () => {
    this.inputCount++;
  };

  incrementLayer = () => {
    this.layer++;
  };

  clone = (): Node => {
    return new Node(this.id, this.type, this.layer, this.inputCount);
  };

  export = (): string => {
    let stringRepresentation = "N\n";
    stringRepresentation += `${this.id} ${this.type} ${this.layer} ${this.inputCount}\n`;

    return stringRepresentation;
  };
}

export default Node;
