import Vector2D from "utilities/vector2d";

// Game
export const gameScreenWidth: number = 700;
export const gameScreenHeight: number = 700;
export const enemySpawnPoint: Vector2D = new Vector2D(100, 100);

// Fighter
export const playerSpeed: number = 4;
export const gunPointOffset: Vector2D = new Vector2D(8, -13);
export const playerRadius: number = 10;

// Bullets
export const bulletSpeed: number = 12;
export const bulletRadius: number = 3;
export const bulletMaxDistance: number = 150;

// Rays
export const aimRayLength: number = 150;
export const sensorRayLength: number = 200;
export const sensorRaySpread: number = Math.PI * 2;
export const sensorRayCount: number = 8;

// Machine Learning
export const populationSize: number = 200;
export const weightMutationRate: number = 0.5;
export const weightPerturbationChance: number = 0.9;

// Machine Learning NEAT
export const compatibilityCoefficients: [number, number, number] = [1.0, 1.0, 0.4];
export const genomeLengthNormalizationThreshold: number = 20;
export const massExtinctionThreshold: number = 20;
export const speciesExtinctionThreshold: number = 15;
export const partOfSpeciesMembersAllowedToReproduce: number = 0.5;
export const addNodeMutationChance: number = 0.03;
export const addConnectionMutationChance: number = 0.03;
export const inheritedConnectionStaysDisabledChance: number = 0.75;
export const populationPartWithoutCrossover: number = 0.25;
export const interspeciesMatingRate: number = 0.001;

// AI Adaptation
export const networkViewWidth: number = 800;
export const networkViewHeight: number = 600;
export const dummySpawnPoint: Vector2D = new Vector2D(gameScreenWidth / 2 + 80, gameScreenHeight / 2);
export const sites: Vector2D[] = [
  new Vector2D(80, 80),
  new Vector2D(gameScreenWidth - 80, 80),
  new Vector2D(gameScreenWidth - 80, gameScreenHeight - 80),
  new Vector2D(80, gameScreenHeight - 80),
  new Vector2D(gameScreenWidth / 2, gameScreenHeight / 2),
];
export const siteRadius: number = 50;
