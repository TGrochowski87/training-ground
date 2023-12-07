import {
  addConnectionMutationChance,
  addNodeMutationChance,
  compatibilityCoefficients,
  inheritedConnectionStaysDisabledChance,
  weightMutationRate,
  weightPerturbationChance,
} from "configuration";
import PartialConnectionData from "machine-learning/NEAT/models/PartialConnectionData";
import Connection from "machine-learning/NEAT/connection";
import Node, { NodeType } from "machine-learning/NEAT/node";
import { gaussianRandom, randomBetween } from "utilities/mathExtensions";
import NeuralNetwork from "machine-learning/neuralNetwork";

type CloneProps = {
  type: "Clone";
  nodes: Node[];
  connections: Connection[];
  layers: number;
};

type CreationProps = {
  type: "Creation";
  inputs: number;
  outputs: number;
};

type NeuralNetworkProps = CloneProps | CreationProps;

class NeuralNetworkNEAT extends NeuralNetwork {
  // These lists are both expected to be sorted (by id/marker value).
  nodes: Node[];
  connections: Connection[];

  // Used for drawing
  layers: number;

  constructor(props: NeuralNetworkProps) {
    super();

    switch (props.type) {
      case "Clone":
        this.connections = [...props.connections];
        this.nodes = [...props.nodes];
        this.layers = props.layers;
        break;
      case "Creation":
        this.connections = [];
        this.nodes = [];
        const numberOfInputsWithBias: number = props.inputs + 1;

        this.nodes.push(...Array.from({ length: numberOfInputsWithBias }, (_v, i) => new Node(i, "Input", 0, 1)));
        this.nodes.push(
          ...Array.from(
            { length: props.outputs },
            (_v, i) => new Node(numberOfInputsWithBias + i, "Output", 1, numberOfInputsWithBias)
          )
        );
        this.layers = 2;

        // For problems where there are many inputs and it is not obvious which ones are more important
        // than others, it is acceptable to start with some inputs disconnected and let NEAT decide.
        // If this is to be implemented, the crossover must be changed to not drop disconnected input nodes.
        for (let i = 0; i < numberOfInputsWithBias; i++) {
          for (let j = 0; j < props.outputs; j++) {
            this.connections.push(
              new Connection(
                i * props.outputs + j,
                this.nodes[i],
                this.nodes[numberOfInputsWithBias + j],
                randomBetween(-1, 1),
                true
              )
            );
          }
        }
        break;

      default:
        throw Error("This option of NeuralNetwork instantiation is not implemented.");
    }

    if (Connection.globalMaxHistoricalMarking == 0) {
      Connection.globalMaxHistoricalMarking = this.connections.length - 1;
    }
  }

  draw = (ctx: CanvasRenderingContext2D) => {
    // const layers: Node[][] = new Array<Node[]>();
    // const nodeCoordinates: { x: number; y: number }[] = [];
    // for (const node of this.nodes) {
    //   const layer = node.layer;
    //   layers[layer] = layers[layer] ?? [];
    //   layers[layer].push(node);
    // }
    // for (let i = 0; i < layers.length; i++) {
    //   const layerX: number = lerp(
    //     canvasWidthMargin,
    //     canvasWidth - 2 * canvasWidthMargin,
    //     layers.length == 1 ? 0.5 : i / (layers.length - 1)
    //   );
    //   for (let j = 0; j < layers[i].length; j++) {
    //     const heightPart: number = i % 2 == 0 ? j / (layers[i].length - 1) : (j + 1) / (layers[i].length + 1);
    //     const marginShift: number = i % 2 == 0 ? 0 : -80;
    //     const nodeY: number = lerp(
    //       canvasHeightMargin + marginShift,
    //       canvasHeight - 2 * canvasHeightMargin,
    //       layers[i].length == 1 ? 0.5 : heightPart
    //     );
    //     nodeCoordinates[layers[i][j].id] = { x: layerX, y: nodeY };
    //   }
    // }
    // for (const connection of this.connections) {
    //   const { nodeFrom, nodeTo, weight } = connection;
    //   const nodeFromCoordinates = nodeCoordinates[nodeFrom.id];
    //   const nodeToCoordinates = nodeCoordinates[nodeTo.id];
    //   if (connection.enabled) {
    //     ctx.beginPath();
    //     ctx.strokeStyle = "black";
    //     ctx.moveTo(nodeFromCoordinates.x, nodeFromCoordinates.y);
    //     ctx.lineTo(nodeToCoordinates.x, nodeToCoordinates.y);
    //     ctx.lineWidth = 2;
    //     ctx.strokeStyle = connection.enabled ? getRGBAFromWeight(weight) : "rgba(255, 0, 50, 1)";
    //     ctx.stroke();
    //   } else {
    //     const distance: number = distanceBetweenPoints(
    //       { x: nodeFromCoordinates.x, y: nodeFromCoordinates.y },
    //       { x: nodeToCoordinates.x, y: nodeToCoordinates.y }
    //     );
    //     const [cpy1, cpx1] = [
    //       nodeFromCoordinates.y + (nodeToCoordinates.y - nodeFromCoordinates.y) / 3 + distance / 3,
    //       nodeFromCoordinates.x + (nodeToCoordinates.x - nodeFromCoordinates.x) / 3 + distance / 3,
    //     ];
    //     const [cpy2, cpx2] = [
    //       nodeFromCoordinates.y + ((nodeToCoordinates.y - nodeFromCoordinates.y) * 2) / 3 - distance / 3,
    //       nodeFromCoordinates.x + ((nodeToCoordinates.x - nodeFromCoordinates.x) * 2) / 3 - distance / 3,
    //     ];
    //     ctx.beginPath();
    //     ctx.strokeStyle = "red";
    //     ctx.moveTo(nodeFromCoordinates.x, nodeFromCoordinates.y);
    //     ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, nodeToCoordinates.x, nodeToCoordinates.y);
    //     ctx.stroke();
    //   }
    // }
    // for (const node of this.nodes) {
    //   const { id } = node;
    //   const { x, y } = nodeCoordinates[node.id];
    //   ctx.beginPath();
    //   ctx.arc(x, y, 20, 0, 2 * Math.PI);
    //   ctx.fillStyle = "white";
    //   ctx.fill();
    //   ctx.beginPath();
    //   ctx.strokeStyle = "black";
    //   ctx.lineWidth = 3;
    //   ctx.arc(x, y, 20, 0, 2 * Math.PI);
    //   ctx.stroke();
    //   ctx.beginPath();
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "middle";
    //   ctx.fillStyle = "black";
    //   ctx.strokeStyle = "black";
    //   ctx.font = "16px Arial";
    //   ctx.fillText(`${id == 0 ? "B" : id}`, x, y);
    // }
  };

  process = (inputs: number[]): number[] => {
    const inputNodes = this.nodes.filter(n => n.type == "Input");
    if (inputs.length != inputNodes.length - 1) {
      throw Error("Input array length mismatch.");
    }

    // The first input node is bias.
    inputNodes[0].receiveInput(1);
    for (let i = 0; i < inputs.length; i++) {
      inputNodes[i + 1].receiveInput(inputs[i]);
    }

    const waitingList: Connection[] = [];

    for (const connection of this.connections) {
      if (connection.nodeFrom.allInputsReceived() == false) {
        waitingList.push(connection);
        continue;
      }

      // To avoid more calculations of the same output allInputsReceived() could be changes to smth like tryProcudeOutput().
      // It would return false if not all inputs received or true otherwise and if true, would set its output,
      // which could then be just read in connection's feedForward().
      connection.feedForward();

      this.processWaitingList(waitingList);
    }

    // Make sure that waiting list is empty
    while (waitingList.length != 0) {
      this.processWaitingList(waitingList);
    }

    const outputNodes = this.nodes.filter(n => n.type == "Output");
    if (outputNodes.some(n => n.allInputsReceived() == false)) {
      throw Error("Some outputs did not receive data from all its inputs.");
    }

    const output = outputNodes.map(n => n.produceOutput());
    this.nodes.forEach(n => n.clearInput());
    return output;
  };

  mutateWeights = (): void => {
    for (const connection of this.connections) {
      if (Math.random() > weightMutationRate) continue;

      if (Math.random() < weightPerturbationChance) {
        connection.weight += gaussianRandom() / 5;
      } else {
        connection.weight = randomBetween(-1, 1);
      }

      if (connection.weight > 1) {
        connection.weight = 1;
      }
      if (connection.weight < -1) {
        connection.weight = -1;
      }
    }
  };

  /**
   * Adds a new connection, if there is any possible, that would not cause feedback loop.
   * Returns connections that are completely new to this generation.
   */
  mutateAddConnection = (innovations: ReadonlyArray<PartialConnectionData>): PartialConnectionData | null => {
    if (Math.random() > addConnectionMutationChance) {
      return null;
    }

    const nodesCopy = [...this.nodes.filter(n => n.type != "Output")];
    while (nodesCopy.length > 0) {
      const randomizedIndex: number = Math.floor(Math.random() * nodesCopy.length);
      const randomNode: Node = nodesCopy[randomizedIndex];
      const missingConnections: Node[] = this.findMissingConnectionsFromNode(randomNode);
      const chosenConnectionTarget: Node | null = this.tryChooseConnectionTarget(randomNode, missingConnections);

      if (chosenConnectionTarget != null) {
        // The new connection would connect two nodes from the same layer,
        // the target node and all next nodes in the chain must shift.
        if (randomNode.layer == chosenConnectionTarget.layer) {
          this.shiftChainRight(chosenConnectionTarget, this.connections, this.nodes, this.layers);
        }

        return this.addConnection(innovations, randomNode, chosenConnectionTarget, randomBetween(-1, 1));
      }

      nodesCopy.splice(randomizedIndex, 1);
    }

    return null;
  };

  /**
   * Returns connections that are completely new to this generation.
   */
  mutateAddNode = (innovations: ReadonlyArray<PartialConnectionData>): (PartialConnectionData | null)[] => {
    if (Math.random() > addNodeMutationChance) {
      return [null];
    }

    const randomConnection: Connection = this.connections[Math.floor(Math.random() * this.connections.length)];
    randomConnection.enabled = false;

    const randomConnectionFrom: Node = randomConnection.nodeFrom;
    const randomConnectionTo: Node = randomConnection.nodeTo;

    const newNodeLayer = randomConnectionFrom.layer + 1;
    const newNode: Node = new Node(this.nodes.length, "Hidden", newNodeLayer, 0);

    // The new node would be put in the same layer as its target node, so new layer must be created.
    if (newNodeLayer == randomConnectionTo.layer) {
      this.shiftChainRight(randomConnectionTo, this.connections, this.nodes, this.layers);
    }

    this.nodes.push(newNode);

    return [
      this.addConnection(innovations, randomConnectionFrom, newNode, 1),
      this.addConnection(innovations, newNode, randomConnectionTo, randomConnection.weight),
    ];
  };

  /**
   *
   * @param other The other parent.
   * @param areEqual If false, this method is assumed to be invoked on the better parent.
   */
  crossover = (other: NeuralNetworkNEAT, areEqual: boolean): NeuralNetworkNEAT => {
    let childConnections: Connection[] = [];
    let childNodes: Node[] = [];

    const currentNodes: readonly Node[] = this.nodes.length > other.nodes.length ? this.nodes : other.nodes;
    for (const node of currentNodes) {
      childNodes[node.id] = node.clone();
    }

    for (let i = 0; i <= Connection.globalMaxHistoricalMarking; i++) {
      const connectionInThis = this.connections.find(c => c.historicalMarking == i);
      const connectionInOther = other.connections.find(c => c.historicalMarking == i);

      let chosenConnection: Connection | undefined;

      // For matching connections the parent is chosen randomly
      if ((connectionInThis && connectionInOther) || areEqual) {
        chosenConnection = Math.random() >= 0.5 ? connectionInThis : connectionInOther;
      }
      // Disjoint and excess genes
      else {
        chosenConnection = connectionInThis;
      }

      if (chosenConnection) {
        const nodeFrom: Node = childNodes[chosenConnection.nodeFrom.id];
        const nodeTo: Node = childNodes[chosenConnection.nodeTo.id];
        let connection: Connection = chosenConnection.clone(nodeFrom, nodeTo);

        // 75% chance to reenable disabled connection.
        if (connection.enabled == false && Math.random() > inheritedConnectionStaysDisabledChance) {
          connection.enabled = true;
        }

        childConnections.push(connection);
      }
    }

    childNodes = this.inferNodesFromConnections(childConnections);

    const layerCount: number = Math.max(...childNodes.map(n => n.layer)) + 1;
    return new NeuralNetworkNEAT({
      type: "Clone",
      connections: childConnections,
      nodes: childNodes,
      layers: layerCount,
    });
  };

  clone = (): NeuralNetworkNEAT => {
    const clonedNodes: Node[] = this.nodes.map(n => n.clone());
    const clonedConnections: Connection[] = this.connections.map(c => {
      const nodeFrom = clonedNodes.find(n => n.id == c.nodeFrom.id);
      const nodeTo = clonedNodes.find(n => n.id == c.nodeTo.id);
      if (nodeFrom == undefined || nodeTo == undefined) {
        throw Error("IDs mismatch in cloned nodes.");
      }

      return c.clone(nodeFrom, nodeTo);
    });

    return new NeuralNetworkNEAT({
      type: "Clone",
      connections: clonedConnections,
      nodes: clonedNodes,
      layers: this.layers,
    });
  };

  calculateCompatibilityDistance = (other: NeuralNetworkNEAT): number => {
    const compatibilityData = this.compare(other);

    // Though it is stated in the original paper to normalize by gene number,
    // they did ot do it for their tests.
    // const numberOfGenes =
    //   compatibilityData.numberOfGenesInBiggerGenome < genomeLengthNormalizationThreshold
    //     ? 1
    //     : compatibilityData.numberOfGenesInBiggerGenome;

    const compatibilityDistance =
      compatibilityCoefficients[0] * compatibilityData.numberOfExcessGenes +
      compatibilityCoefficients[1] * compatibilityData.numberOfDisjointGenes +
      compatibilityCoefficients[2] * compatibilityData.avgDifferenceOnMatchingGenes;

    return compatibilityDistance;
  };

  export = (fitness: number, speciesId: number): void => {
    let stringRepresentation = "";
    stringRepresentation += `${this.layers}\n\n`;

    for (const node of this.nodes) {
      stringRepresentation += `${node.export()}`;
    }
    stringRepresentation += "\n";

    for (const connection of this.connections) {
      stringRepresentation += `${connection.export()}`;
    }

    let a = document.createElement("a") as HTMLAnchorElement;
    a.href = window.URL.createObjectURL(new Blob([stringRepresentation], { type: "text/plain" }));
    a.download = `brain-NEAT-s${speciesId}-f${fitness}.txt`;
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
  };

  static import = (text: string): NeuralNetworkNEAT => {
    const listRepresentation = text.split("\n\n");
    const layerCount: number = +listRepresentation[0];

    const nodeListRepresentation = listRepresentation[1].split("N\n");
    nodeListRepresentation.splice(0, 1);
    const nodes: Node[] = [];
    for (const nodeString of nodeListRepresentation) {
      const propsStringList = nodeString.split(" ");
      const node = new Node(
        +propsStringList[0],
        propsStringList[1] as NodeType,
        +propsStringList[2],
        +propsStringList[3]
      );
      nodes.push(node);
    }

    const connectionListRepresentation = listRepresentation[2].split("C\n");
    connectionListRepresentation.splice(0, 1);
    const connections: Connection[] = [];
    for (const connectionString of connectionListRepresentation) {
      const propsStringList = connectionString.split(" ");
      const nodeFrom = nodes.find(n => n.id == +propsStringList[0]);
      const nodeTo = nodes.find(n => n.id == +propsStringList[1]);

      if (nodeFrom == undefined || nodeTo == undefined) {
        throw Error("A node of required ID was not imported.");
      }

      const connection = new Connection(
        +propsStringList[0],
        nodeFrom,
        nodeTo,
        +propsStringList[3],
        !!propsStringList[4]
      );
      connections.push(connection);
    }

    const reconstructedNetwork = new NeuralNetworkNEAT({
      type: "Clone",
      nodes: nodes,
      connections: connections,
      layers: layerCount,
    });
    return reconstructedNetwork;
  };

  private processWaitingList = (waitingList: Connection[]) => {
    // So I can edit waitingList mid-iteration
    const waitingListCopy = [...waitingList];

    for (const waitingConnection of waitingListCopy) {
      if (waitingConnection.nodeFrom.allInputsReceived()) {
        waitingConnection.feedForward();

        const indexInOriginalList: number = waitingList.findIndex(
          c => c.historicalMarking == waitingConnection.historicalMarking
        );
        waitingList.splice(indexInOriginalList, 1);
      }
    }
  };

  private shiftChainRight = (startingNode: Node, connections: Connection[], nodes: Node[], layerCount?: number) => {
    const chainNodeIds = [...this.getAllNodesFromChain(startingNode, connections, new Set())];

    const chainNodes = nodes.filter(n => chainNodeIds.includes(n.id)).sort((a, b) => a.layer - b.layer);

    for (let i = 0; i < chainNodes.length; i++) {
      if (i > 0 && chainNodes[i].layer != chainNodes[i - 1].layer + 1) {
        chainNodes.splice(i);
        break;
      }
    }

    for (const node of chainNodes) {
      switch (node.type) {
        case "Output":
          // For mutation purposes.
          if (layerCount) {
            layerCount++;
          }

          nodes.filter(n => n.type == "Output").forEach(n => n.incrementLayer());
          break;
        case "Hidden":
          node.incrementLayer();
          break;
        case "Input":
          throw Error("Some node feeds to one of input nodes.");
      }
    }
  };

  private getAllNodesFromChain = (
    currentNode: Node,
    connections: Connection[],
    chainNodesIds: Set<number>
  ): Set<number> => {
    // Check for -1 is for post-crossover graph construction purposes.
    const connectedNodes: Node[] = connections
      .filter(c => c.nodeFrom == currentNode && c.nodeTo.layer != -1)
      .map(c => c.nodeTo);

    for (const node of connectedNodes) {
      this.getAllNodesFromChain(node, connections, chainNodesIds);
    }

    chainNodesIds.add(currentNode.id);
    return chainNodesIds;
  };

  private tryChooseConnectionTarget = (node: Node, targetNodes: Node[]): Node | null => {
    const targetsCopy = [...targetNodes];
    while (targetsCopy.length > 0) {
      const randomizedIndex: number = Math.floor(Math.random() * targetsCopy.length);
      const randomTargetNode: Node = targetsCopy[randomizedIndex];
      if (this.nodeFeedsForwardTo(randomTargetNode, node) == false) {
        return randomTargetNode;
      }

      targetsCopy.splice(randomizedIndex, 1);
    }

    return null;
  };

  private nodeFeedsForwardTo = (node: Node, targetNode: Node, nodesChecked: Node[] = []): boolean => {
    const targetsDirectOutputConnections: Node[] = this.connections
      .filter(c => c.nodeFrom == node && nodesChecked.includes(c.nodeTo) == false)
      .map(c => c.nodeTo);

    for (const destinationNode of targetsDirectOutputConnections) {
      if (destinationNode == targetNode) {
        return true;
      }
      if (this.nodeFeedsForwardTo(destinationNode, targetNode, nodesChecked)) {
        return true;
      }
    }

    nodesChecked.push(node);
    return false;
  };

  private compare = (other: NeuralNetworkNEAT): CompatibilityDistanceData => {
    let comparisonSummary: CompatibilityDistanceData = {
      avgDifferenceOnMatchingGenes: 0,
      numberOfDisjointGenes: 0,
      numberOfExcessGenes: 0,
      numberOfGenesInBiggerGenome: Math.max(this.connections.length, other.connections.length),
    };

    const smallerMaxInnovationNumber = Math.min(
      this.connections.at(-1)!.historicalMarking,
      other.connections.at(-1)!.historicalMarking
    );

    let matchingGenesDifferences: number[] = [];

    for (let i = 0; i <= Connection.globalMaxHistoricalMarking; i++) {
      const connectionInThis = this.connections.find(c => c.historicalMarking == i);
      const connectionInOther = other.connections.find(c => c.historicalMarking == i);

      if (connectionInThis && connectionInOther) {
        const difference = Math.abs(connectionInThis.weight - connectionInOther.weight);
        matchingGenesDifferences.push(difference);
      } else if (connectionInThis || connectionInOther) {
        if (i > smallerMaxInnovationNumber) {
          comparisonSummary.numberOfExcessGenes++;
        } else {
          comparisonSummary.numberOfDisjointGenes++;
        }
      }
    }

    const matchingDifferenceSum = matchingGenesDifferences.reduce((prev, current) => prev + current, 0);
    comparisonSummary.avgDifferenceOnMatchingGenes = matchingDifferenceSum / matchingGenesDifferences.length;

    return comparisonSummary;
  };

  private findMissingConnectionsFromNode = (node: Node): Node[] => {
    const allPossibleConnections = this.nodes.filter(n => n.type != "Input" && n.id != node.id);
    const presentConnections = this.connections.filter(c => c.nodeFrom == node).map(c => c.nodeTo);
    return allPossibleConnections.filter(n => presentConnections.includes(n) == false);
  };

  private addConnection = (
    innovations: ReadonlyArray<PartialConnectionData>,
    nodeFrom: Node,
    nodeTo: Node,
    weight: number
  ): PartialConnectionData | null => {
    const newConnectionFromList = innovations.find(c => c.nodeFrom == nodeFrom.id && c.nodeTo == nodeTo.id);

    if (newConnectionFromList) {
      this.connections.push(new Connection(newConnectionFromList.historicalMarking, nodeFrom, nodeTo, weight, true));
      nodeTo.incrementInputCount();
      return null;
    }

    const nextHistoricalMarking: number = Connection.getNextHistoricalMarking();
    const newConnection = new Connection(nextHistoricalMarking, nodeFrom, nodeTo, weight, true);
    this.connections.push(newConnection);
    nodeTo.incrementInputCount();
    return { historicalMarking: nextHistoricalMarking, nodeFrom: nodeFrom.id, nodeTo: nodeTo.id };
  };

  private inferNodesFromConnections = (connections: Connection[]): Node[] => {
    const nodes: Node[] = [];

    // Get nodes from connections
    for (const connection of connections) {
      const { nodeFrom, nodeTo } = connection;

      if (nodes.some(n => n.id == nodeFrom.id) == false) {
        nodeFrom.layer = -1;
        nodes.push(nodeFrom);
      }
      if (nodes.some(n => n.id == nodeTo.id) == false) {
        nodeTo.layer = -1;
        nodes.push(nodeTo);
      }
    }
    nodes.sort((a, b) => a.id - b.id);

    // Calculate number of inputs
    for (const node of nodes) {
      if (node.type == "Input") {
        node.inputCount = 1;
      } else {
        node.inputCount = connections.filter(c => c.nodeTo.id == node.id).length;
      }
    }

    // Calculate layer assignment
    for (const connection of connections) {
      const { nodeFrom, nodeTo } = connection;

      const nodeFromLayer = Math.max(
        ...connections.filter(c => c.nodeTo == nodeFrom && c.nodeFrom.layer != -1).map(c => c.nodeFrom.layer + 1),
        0
      );
      if (nodeFrom.layer != -1) {
        const movedBy: number = nodeFromLayer - nodeFrom.layer;
        for (let i = 0; i < movedBy; i++) {
          this.shiftChainRight(nodeFrom, connections, nodes);
        }
      }

      const nodeToLayer =
        Math.max(
          ...connections.filter(c => c.nodeTo == nodeTo && c.nodeFrom.layer != -1).map(c => c.nodeFrom.layer),
          nodeFromLayer
        ) + 1;
      if (nodeTo.layer != -1) {
        const movedBy: number = nodeToLayer - nodeTo.layer;
        for (let i = 0; i < movedBy; i++) {
          this.shiftChainRight(nodeTo, connections, nodes);
        }
      }

      // This assignment is always safe, even after chain shift, because nodeFrom.layer shifts to match nodeFromLayer...
      nodeFrom.layer = nodeFromLayer;
      // ... but output nodes can be further from all their inputs than one layer and they must not be pulled back.
      if (nodeTo.layer < nodeToLayer) {
        nodeTo.layer = nodeToLayer;
      }
    }

    return nodes;
  };
}

interface CompatibilityDistanceData {
  avgDifferenceOnMatchingGenes: number;
  numberOfDisjointGenes: number;
  numberOfExcessGenes: number;
  numberOfGenesInBiggerGenome: number;
}

export default NeuralNetworkNEAT;
