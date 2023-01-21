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
export const networkViewWidth: number = 1500;
export const networkViewHeight: number = 1600;
export const mutationRate: number = 0.1;
export const dummySpawnPoint: Vector2D = new Vector2D(gameScreenWidth / 2 + 80, gameScreenHeight / 2);
export const sites: Vector2D[] = [
  new Vector2D(80, 80),
  new Vector2D(gameScreenWidth - 80, 80),
  new Vector2D(gameScreenWidth - 80, gameScreenHeight - 80),
  new Vector2D(80, gameScreenHeight - 80),
  new Vector2D(gameScreenWidth / 2, gameScreenHeight / 2),
];
