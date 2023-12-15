import { gameScreenHeight, gameScreenWidth } from "configuration";
import Vector2D from "utilities/vector2d";
import Wall from "entities/wall";

class WallCollection {
  collection: Wall[];

  constructor() {
    this.collection = [
      // Outer walls
      new Wall(new Vector2D(0, 5), "RIGHT", gameScreenWidth),
      new Wall(new Vector2D(gameScreenWidth - 5, 0), "DOWN", gameScreenHeight),
      new Wall(new Vector2D(gameScreenWidth, gameScreenHeight - 5), "LEFT", gameScreenWidth),
      new Wall(new Vector2D(5, gameScreenHeight), "UP", gameScreenHeight),

      // Around the player
      new Wall(new Vector2D(gameScreenWidth / 2 - 100, (gameScreenHeight * 3) / 4 - 100), "RIGHT", 200),
      new Wall(new Vector2D(gameScreenWidth / 2 - 100, (gameScreenHeight * 3) / 4 - 100), "DOWN", 200),
      new Wall(new Vector2D(gameScreenWidth / 2 + 100, (gameScreenHeight * 3) / 4 - 100), "DOWN", 200),
    ];
  }

  draw = (ctx: CanvasRenderingContext2D): void => {
    for (const wall of this.collection) {
      wall.draw(ctx);
    }
  };
}

export default WallCollection;
