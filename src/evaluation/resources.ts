import { gameScreenHeight, gameScreenWidth, sites } from "configuration";
import Wall from "entities/wall";
import Vector2D from "utilities/vector2d";

export interface ScenarioResources {
  walls: Wall[];
  fieldSize: Vector2D;
  lifespan: number;
  sites: Vector2D[];
  dummyPos?: Vector2D;
}

export const resourcesScenario1: ScenarioResources = {
  walls: [
    // Outer walls
    new Wall(new Vector2D(0, 5), "RIGHT", gameScreenWidth),
    new Wall(new Vector2D(gameScreenWidth - 5, 0), "DOWN", gameScreenHeight),
    new Wall(new Vector2D(gameScreenWidth, gameScreenHeight - 5), "LEFT", gameScreenWidth),
    new Wall(new Vector2D(5, gameScreenHeight), "UP", gameScreenHeight),

    // Around the player
    new Wall(new Vector2D(gameScreenWidth / 2 - 100, gameScreenHeight / 2 - 100), "RIGHT", 200),
    new Wall(new Vector2D(gameScreenWidth / 2 - 100, gameScreenHeight / 2 - 100), "DOWN", 200),
    new Wall(new Vector2D(gameScreenWidth / 2 + 100, gameScreenHeight / 2 - 100), "DOWN", 200),
  ],
  fieldSize: new Vector2D(gameScreenWidth, gameScreenHeight),
  lifespan: 3000,
  sites: sites,
};

const scenario2FieldSize: Vector2D = new Vector2D(1600, 200);
export const resourcesScenario2: ScenarioResources = {
  walls: [
    // Outer walls
    new Wall(new Vector2D(0, 5), "RIGHT", scenario2FieldSize.x),
    new Wall(new Vector2D(scenario2FieldSize.x - 5, 0), "DOWN", scenario2FieldSize.y),
    new Wall(new Vector2D(scenario2FieldSize.x, scenario2FieldSize.y - 5), "LEFT", scenario2FieldSize.x),
    new Wall(new Vector2D(5, scenario2FieldSize.y), "UP", scenario2FieldSize.y),
  ],
  fieldSize: scenario2FieldSize,
  lifespan: 3000,
  sites: [
    new Vector2D(100, scenario2FieldSize.y / 2),
    new Vector2D(scenario2FieldSize.x - 100, scenario2FieldSize.y / 2),
  ],
  dummyPos: new Vector2D(scenario2FieldSize.x - 100, scenario2FieldSize.y / 2),
};
