import { gameScreenHeight, gameScreenWidth } from "./constants";
import WallCollection from "entities/wallCollection";
import FighterType from "enums/fighterType";
import Fighter from "fighter";
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

  walls.draw(gameCtx);
  player.show(gameCtx);
  player.update(walls.collection, gameCtx);
  requestAnimationFrame(animate);
}
