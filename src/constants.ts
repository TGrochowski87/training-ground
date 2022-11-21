import Vector2D from "utilities/vector2d";

// Game
export const gameScreenWidth: number = 700;
export const gameScreenHeight: number = 700;

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
export const sensorRayCount: number = 16;
