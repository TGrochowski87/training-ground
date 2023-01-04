import { gameScreenHeight, gameScreenWidth, networkViewHeight, networkViewWidth } from "configuration";
import WallCollection from "entities/wallCollection";
import Player from "entities/player";
import "style.css";
import Vector2D from "utilities/vector2d";
import Enemy from "entities/enemy";

const gameCanvas: HTMLCanvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;
gameCanvas.width = gameScreenWidth;
gameCanvas.height = gameScreenHeight;

const networkCanvas: HTMLCanvasElement = document.getElementById("networkCanvas") as HTMLCanvasElement;
networkCanvas.width = networkViewWidth;
networkCanvas.height = networkViewHeight;
networkCanvas.style.display = "none";

const networkDisplayButton: HTMLButtonElement = document.getElementById("show-hide-button") as HTMLButtonElement;

const gameCtx = gameCanvas.getContext("2d")!;
const networkCtx = networkCanvas.getContext("2d")!;

const player: Player = new Player(new Vector2D(gameScreenWidth / 2, gameScreenHeight / 2));
const enemies: Enemy[] = [new Enemy(new Vector2D(300, 300))];

const walls: WallCollection = new WallCollection();

let networkDrawDelay = 0;
let showNetwork = false;

networkDisplayButton.onclick = () => {
  if (showNetwork) {
    showNetwork = false;
    networkCanvas.style.display = "none";
  } else {
    networkCanvas.style.display = "block";
    showNetwork = true;
  }
};

animate();

function animate(time: number = 0) {
  manageGameCanvas(time);
  if (showNetwork) {
    if (networkDrawDelay >= 10) {
      manageNetworkCanvas(time);
      networkDrawDelay = 0;
    }
    networkDrawDelay++;
  }

  requestAnimationFrame(animate);
}

function manageGameCanvas(time: number) {
  gameCtx.clearRect(0, 0, gameCtx.canvas.width, gameCtx.canvas.height);

  player.update(walls.collection);
  player.draw(gameCtx);
  for (const enemy of enemies) {
    enemy.update(walls.collection, player);
    enemy.draw(gameCtx);
  }
  walls.draw(gameCtx);
}

function manageNetworkCanvas(time: number) {
  networkCtx.clearRect(0, 0, networkCtx.canvas.width, networkCtx.canvas.height);
  //networkCtx.lineDashOffset = -time / 50;
  enemies[0].drawNeuralNetwork(networkCtx);
}
