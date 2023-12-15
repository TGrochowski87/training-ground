import { gameScreenHeight, gameScreenWidth, sites } from "configuration";
import Wall from "entities/wall";
import Vector2D from "utilities/vector2d";

export interface ScenarioResources {
  walls: Wall[];
  fieldSize: Vector2D;
  lifespan: number;
  sites: Vector2D[];
  specialInitialSequence?: number[];
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
    new Wall(new Vector2D(gameScreenWidth / 2 - 100, (gameScreenHeight * 3) / 4 - 100), "RIGHT", 200),
    new Wall(new Vector2D(gameScreenWidth / 2 - 100, (gameScreenHeight * 3) / 4 - 100), "DOWN", 200),
    new Wall(new Vector2D(gameScreenWidth / 2 + 100, (gameScreenHeight * 3) / 4 - 100), "DOWN", 200),
  ],
  fieldSize: new Vector2D(gameScreenWidth, gameScreenHeight),
  lifespan: 5000,
  sites: sites,
  specialInitialSequence: Array.from({ length: 10 }, () => [0, 1, 2, 3, 4, 5, 6]).flat(),
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

const scenario3FieldSize: Vector2D = new Vector2D(1600, 300);
export const resourcesScenario3: ScenarioResources = {
  walls: [
    // Outer walls
    new Wall(new Vector2D(0, 5), "RIGHT", scenario3FieldSize.x),
    new Wall(new Vector2D(scenario3FieldSize.x - 5, 0), "DOWN", scenario3FieldSize.y),
    new Wall(new Vector2D(scenario3FieldSize.x, scenario3FieldSize.y - 5), "LEFT", scenario3FieldSize.x),
    new Wall(new Vector2D(5, scenario3FieldSize.y), "UP", scenario3FieldSize.y),

    // Obstacles
    new Wall(new Vector2D(350, 0), "DOWN", scenario3FieldSize.y - 100),
    new Wall(new Vector2D(700, 100), "DOWN", scenario3FieldSize.y - 100),
    new Wall(new Vector2D(1050, 0), "DOWN", scenario3FieldSize.y - 100),
    new Wall(new Vector2D(1400, 100), "DOWN", scenario3FieldSize.y - 100),
  ],
  fieldSize: scenario3FieldSize,
  lifespan: 3000,
  sites: [
    new Vector2D(100, scenario3FieldSize.y / 2),
    new Vector2D(scenario3FieldSize.x - 100, scenario3FieldSize.y / 2),
  ],
  dummyPos: new Vector2D(scenario3FieldSize.x - 100, scenario3FieldSize.y / 2),
};

const scenario4FieldSize: Vector2D = new Vector2D(800, 800);
export const resourcesScenario4: ScenarioResources = {
  walls: [
    // Outer walls
    new Wall(new Vector2D(0, 5), "RIGHT", scenario4FieldSize.x),
    new Wall(new Vector2D(scenario4FieldSize.x - 5, 0), "DOWN", scenario4FieldSize.y),
    new Wall(new Vector2D(scenario4FieldSize.x, scenario4FieldSize.y - 5), "LEFT", scenario4FieldSize.x),
    new Wall(new Vector2D(5, scenario4FieldSize.y), "UP", scenario4FieldSize.y),

    // Inner
    new Wall(new Vector2D(0, 250), "RIGHT", scenario4FieldSize.x - 200),
    new Wall(new Vector2D(scenario4FieldSize.x - 200, 250), "DOWN", scenario4FieldSize.y - 450),
    new Wall(new Vector2D(scenario4FieldSize.x - 200, 600), "LEFT", scenario4FieldSize.x - 400),
    new Wall(new Vector2D(200, 600), "UP", scenario4FieldSize.y - 450),
  ],
  fieldSize: scenario4FieldSize,
  lifespan: 3000,
  sites: [
    new Vector2D(100, 100),
    new Vector2D(scenario4FieldSize.x - 100, 100),
    new Vector2D(scenario4FieldSize.x - 100, scenario4FieldSize.y - 100),
    new Vector2D(100, scenario4FieldSize.y - 100),
    new Vector2D(100, 350),
  ],
  dummyPos: new Vector2D(100, 350),
};
