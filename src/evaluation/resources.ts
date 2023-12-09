import { gameScreenHeight, gameScreenWidth, sites } from "configuration";
import Wall from "entities/wall";
import Vector2D from "utilities/vector2d";

export interface ScenarioResources {
  walls: Wall[];
  lifespan: number;
  sites?: Vector2D[];
  dummyPos?: Vector2D;
}

export const resourcesScenario1: ScenarioResources = {
  walls: [
    new Wall(new Vector2D(0, 5), "RIGHT", gameScreenWidth),
    new Wall(new Vector2D(gameScreenWidth - 5, 0), "DOWN", gameScreenHeight),
    new Wall(new Vector2D(gameScreenWidth, gameScreenHeight - 5), "LEFT", gameScreenWidth),
    new Wall(new Vector2D(5, gameScreenHeight), "UP", gameScreenHeight),

    // Around the player
    new Wall(new Vector2D(gameScreenWidth / 2 - 100, gameScreenHeight / 2 - 100), "RIGHT", 200),
    new Wall(new Vector2D(gameScreenWidth / 2 - 100, gameScreenHeight / 2 - 100), "DOWN", 200),
    new Wall(new Vector2D(gameScreenWidth / 2 + 100, gameScreenHeight / 2 - 100), "DOWN", 200),
  ],
  lifespan: 3000,
  sites: sites,
};
