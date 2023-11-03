const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
const relu = (x: number) => Math.max(0, x);

export { sigmoid, relu };
