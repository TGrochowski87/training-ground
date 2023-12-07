export default abstract class NeuralNetwork {
  abstract process(inputs: number[]): number[];
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
