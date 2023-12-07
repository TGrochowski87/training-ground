import Node from "machine-learning/NEAT/node";

export default class Connection {
  guid: string;
  static globalMaxHistoricalMarking: number = 0;
  historicalMarking: number = 0;

  nodeFrom: Node;
  nodeTo: Node;
  weight: number;
  enabled: boolean;

  constructor(historicalMarking: number, nodeFrom: Node, nodeTo: Node, weight: number, enabled: boolean) {
    this.historicalMarking = historicalMarking;

    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.weight = weight;
    this.enabled = enabled;
    this.guid = crypto.randomUUID();
  }

  static getNextHistoricalMarking = (): number => ++Connection.globalMaxHistoricalMarking;

  feedForward = () => {
    const output: number = this.enabled ? this.nodeFrom.produceOutput() : 0;
    const weightedOutput: number = output * this.weight;
    this.nodeTo.receiveInput(weightedOutput);
  };

  clone = (nodeFrom: Node, nodeTo: Node): Connection => {
    // This cannot work like this, because every node is treated like a new one,
    // so the information of multiple connections to the same node get discarded.
    const clone: Connection = new Connection(this.historicalMarking, nodeFrom, nodeTo, this.weight, this.enabled);
    return clone;
  };

  export = (): string => {
    let stringRepresentation = "C\n";
    stringRepresentation += `${this.historicalMarking} ${this.nodeFrom.id} ${this.nodeTo.id} ${this.weight} ${this.enabled}\n`;

    return stringRepresentation;
  };
}
