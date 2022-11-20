import { gameScreenHeight, gameScreenWidth } from "constants";
import Vector2D from "utilities/vector2d";
import Wall from "entities/wall";

class WallCollection {
  collection: Wall[];

  constructor() {
    this.collection = [];

    // Outer walls
    this.collection.push(
      new Wall(
        new Vector2D(0, 0),
        new Vector2D(gameScreenWidth, 0),
        new Vector2D(0, 10),
        new Vector2D(gameScreenWidth, 10)
      )
    );
    this.collection.push(
      new Wall(
        new Vector2D(0, 0),
        new Vector2D(10, 0),
        new Vector2D(0, gameScreenHeight),
        new Vector2D(10, gameScreenHeight)
      )
    );
    this.collection.push(
      new Wall(
        new Vector2D(0, gameScreenHeight - 10),
        new Vector2D(gameScreenWidth, gameScreenHeight - 10),
        new Vector2D(0, gameScreenHeight),
        new Vector2D(gameScreenWidth, gameScreenHeight)
      )
    );
    this.collection.push(
      new Wall(
        new Vector2D(gameScreenWidth - 10, 0),
        new Vector2D(gameScreenWidth, 0),
        new Vector2D(gameScreenWidth - 10, gameScreenHeight),
        new Vector2D(gameScreenWidth, gameScreenHeight)
      )
    );
    //--------------

    this.collection.push(
      new Wall(
        new Vector2D(gameScreenWidth / 2 - 50, 50),
        new Vector2D(gameScreenWidth / 2 + 50, 50),
        new Vector2D(gameScreenWidth / 2 - 50, 60),
        new Vector2D(gameScreenWidth / 2 + 50, 60)
      )
    );
  }

  draw = (ctx: CanvasRenderingContext2D): void => {
    for (const wall of this.collection) {
      wall.draw(ctx);
    }
  };
}

export default WallCollection;
