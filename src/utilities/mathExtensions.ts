export const randomBetween = (min: number = 0, max: number = 1) => {
  return Math.random() * (max - min) + min;
};

export const gaussianRandomBetween = (start: number, end: number) => {
  return Math.floor(start + gaussianRandom() * (end - start + 1));
};

export const gaussianRandom = () => {
  let u = 1 - Math.random();
  let v = Math.random();

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};
