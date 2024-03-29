const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
const steepSigmoid = (summedOutput: number): number => 1 / (1 + Math.exp(-summedOutput * 4.9));
const relu = (x: number) => Math.max(0, x);

export { sigmoid, steepSigmoid, relu };
