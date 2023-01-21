import Enemy from "entities/enemy";
import Player from "entities/player";
import { distanceBetweenPoints } from "utilities/mathExtensions";

export const approachPlayer = (ai: Enemy, player: Player): number => {
  let fitness: number = 0.0;
  fitness += 1 / distanceBetweenPoints(ai.position, player.position);
  fitness += ai.pointsForBeingCloseToPlayer;

  return fitness;
};

export const explore = (ai: Enemy) => {
  let fitness: number = ai.points;
  return fitness;
};
