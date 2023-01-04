import { getRGBAFromWeight, getRGBFromWeight, lerp } from "utilities/mechanicsFunctions";
import Layer from "./Layer";

class NeuralNetwork {
  layers: Layer[];

  outputLabels: string[] = ["🠉", "🠈", "🠊", "🠋", "🔫"];

  constructor(neuronCounts: number[]) {
    this.layers = [];

    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.layers.push(new Layer(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  feedForward = (inputs: number[]): number[] => {
    // Funkcja output z asteroid.

    let outputs = this.layers[0].feedForward(inputs);
    for (let i = 1; i < this.layers.length; i++) {
      outputs = this.layers[i].feedForward(outputs);
    }

    return outputs;
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    const margin: number = 20;
    const width: number = ctx.canvas.width - margin * 2;
    const height: number = ctx.canvas.height - margin * 2;

    const layerHeight = height / this.layers.length;

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layerTop =
        margin + lerp(height - layerHeight, 0, this.layers.length === 1 ? 0.5 : i / (this.layers.length - 1));

      ctx.setLineDash([6, 3]);

      this.drawLayer(ctx, i, margin, layerTop, layerHeight, width, i === this.layers.length - 1);
    }
  };

  private drawLayer = (
    ctx: CanvasRenderingContext2D,
    layerIndex: number,
    margin: number,
    layerTop: number,
    layerHight: number,
    width: number,
    isOutput: boolean
  ): void => {
    const layerBottom = layerTop + layerHight;
    const nodeRadius: number = 16;

    const { inputs, outputs, weights } = this.layers[layerIndex];
    const inputCount = inputs.length;
    const outputCount = outputs.length;

    for (let i = 0; i < inputCount; i++) {
      for (let j = 0; j < outputCount; j++) {
        ctx.beginPath();
        ctx.moveTo(this.getNodeXPosition(inputCount, i, margin, width + margin), layerBottom);
        ctx.lineTo(this.getNodeXPosition(outputCount + 1, j, margin, width + margin), layerTop);

        const weightOnLine = weights.matrix[j][i];
        ctx.lineWidth = 2;
        ctx.strokeStyle = getRGBAFromWeight(weightOnLine);

        ctx.stroke();
      }
    }

    for (let i = 0; i < inputCount; i++) {
      const nodeX = this.getNodeXPosition(inputCount, i, margin, width + margin);
      ctx.beginPath();
      ctx.arc(nodeX, layerBottom, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      if (i === inputCount - 1) {
        ctx.fillStyle = "purple";
      }
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nodeX, layerBottom, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = getRGBAFromWeight(inputs[i]);
      ctx.fill();
    }

    for (let i = 0; i < outputCount; i++) {
      const nodeX = this.getNodeXPosition(outputCount + 1, i, margin, width + margin);

      ctx.beginPath();
      ctx.arc(nodeX, layerTop, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nodeX, layerTop, nodeRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = getRGBAFromWeight(outputs[i]);
      ctx.fill();

      ctx.setLineDash([]);

      if (isOutput) {
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.font = nodeRadius * 1.5 + "px Arial";
        ctx.fillText(this.outputLabels[i], nodeX, layerTop + nodeRadius * 0.1);
        ctx.lineWidth = 0.5;
        ctx.strokeText(this.outputLabels[i], nodeX, layerTop + nodeRadius * 0.1);
      }
    }
  };

  private getNodeXPosition = (nodeCount: number, nodeIndex: number, leftX: number, rightX: number): number => {
    return lerp(leftX, rightX, nodeCount === 1 ? 0.5 : nodeIndex / (nodeCount - 1));
  };
}

export default NeuralNetwork;
