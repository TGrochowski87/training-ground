import { gameScreenHeight, gameScreenWidth } from "configuration";
import WallCollection from "entities/wall-collection";
import FighterType from "enums/fighter-type";
import Fighter from "entities/fighter";
import "style.css";
import Vector2D from "utilities/vector2d";

const gameCanvas: HTMLCanvasElement = document.getElementById(
  "gameCanvas"
) as HTMLCanvasElement;
gameCanvas.width = gameScreenWidth;
gameCanvas.height = gameScreenHeight;

const gameCtx = gameCanvas.getContext("2d")!;

const player: Fighter = new Fighter(
  new Vector2D(gameScreenWidth / 2, gameScreenHeight / 2),
  FighterType.Player
);

const walls: WallCollection = new WallCollection();

animate();

function animate(time: number = 0) {
  gameCtx.clearRect(0, 0, gameCtx.canvas.width, gameCtx.canvas.height);

  player.draw(gameCtx);
  walls.draw(gameCtx);
  player.update(walls.collection);
  requestAnimationFrame(animate);
}
