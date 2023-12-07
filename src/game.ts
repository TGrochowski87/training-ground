import { enemySpawnPoint, gameScreenHeight, gameScreenWidth } from "configuration";
import Enemy from "entities/enemy";
import Player from "entities/player";
import WallCollection from "entities/wallCollection";
import EnemyConventional from "machine-learning/conventional/enemyConventional";
import NeuralNetworkConventional from "machine-learning/conventional/neuralNetworkConventional";
import Vector2D from "utilities/vector2d";

const appContainer: HTMLDivElement = document.getElementById("app") as HTMLDivElement;
const importContainer: HTMLDivElement = document.getElementById("import-container") as HTMLDivElement;
const trainingContainer: HTMLDivElement = document.getElementById("training-container") as HTMLDivElement;
const importBrainButton: HTMLInputElement = document.getElementById("button-import") as HTMLInputElement;

let gameStopped = false;

importBrainButton.onchange = async (event: Event) => {
  let file = (<HTMLInputElement>event.target).files![0];

  const brandNewBrain = await createBrainFromTemplate(file);

  const gameCtx = constructGameField();

  const walls: WallCollection = new WallCollection();
  const player: Player = new Player(new Vector2D(gameScreenWidth / 2, gameScreenHeight / 2));
  const enemy: EnemyConventional = new EnemyConventional(enemySpawnPoint, brandNewBrain.clone()); // TODO: NEAT

  animate();

  function animate(time: number = 0) {
    if (gameStopped === false) {
      manageGameCanvas(time);
    }

    requestAnimationFrame(animate);
  }

  function manageGameCanvas(time: number) {
    gameCtx.clearRect(0, 0, gameCtx.canvas.width, gameCtx.canvas.height);

    player.update(walls.collection, [enemy]);
    player.draw(gameCtx);

    enemy.update(walls.collection, player);
    enemy.draw(gameCtx, false, "#A77500");

    walls.draw(gameCtx);
  }
};

//const gameCanvas: HTMLCanvasElement = document.getElementById("game-canvas") as HTMLCanvasElement;

function constructGameField(): CanvasRenderingContext2D {
  const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
  gameCanvas.id = "game-canvas";
  trainingContainer.append(gameCanvas);
  appContainer.removeChild(importContainer);

  gameCanvas.width = gameScreenWidth;
  gameCanvas.height = gameScreenHeight;

  return gameCanvas.getContext("2d")!;
}

const createBrainFromTemplate = async (file: File): Promise<NeuralNetworkConventional> => {
  const content = await file.text();
  const brain = NeuralNetworkConventional.import(content);
  return brain;
};
