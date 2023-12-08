import {
  enemySpawnPoint,
  gameScreenHeight,
  gameScreenWidth,
  networkViewHeight,
  networkViewWidth,
  populationSize,
  siteRadius,
  sites,
} from "configuration";
import WallCollection from "entities/wallCollection";
import PopulationConventional from "machine-learning/conventional/populationConventional";
import NeuralNetworkConventional from "machine-learning/conventional/neuralNetworkConventional";
import UserSettingsReader from "utilities/userSettingsReader";
import Population from "machine-learning/population";
import PopulationNEAT from "machine-learning/NEAT/populationNEAT";
import NeuralNetworkNEAT from "machine-learning/NEAT/neuralNetworkNEAT";
import EnemyConventional from "machine-learning/conventional/enemyConventional";
import DummyPlayer from "entities/dummyPlayer";
import Vector2D from "utilities/vector2d";

const userSettings = UserSettingsReader.getConfig();

const gameCanvas: HTMLCanvasElement = document.getElementById("game-canvas") as HTMLCanvasElement;
gameCanvas.width = gameScreenWidth;
gameCanvas.height = gameScreenHeight;

const networkCanvas: HTMLCanvasElement = document.getElementById("network-canvas") as HTMLCanvasElement;
networkCanvas.width = networkViewWidth;
networkCanvas.height = networkViewHeight;
networkCanvas.style.display = "none";

const networkDisplayButton: HTMLButtonElement = document.getElementById("button-network") as HTMLButtonElement;
const sensorDisplayButton: HTMLButtonElement = document.getElementById("button-sensors") as HTMLButtonElement;

const gameCtx = gameCanvas.getContext("2d")!;
const networkCtx = networkCanvas.getContext("2d")!;

const walls: WallCollection = new WallCollection();

const enemy: EnemyConventional = new EnemyConventional(enemySpawnPoint.copy());
const dummy: DummyPlayer = new DummyPlayer(enemySpawnPoint.add(new Vector2D(30, 0)));
setTimeout(() => {
  dummy.controls.forward = true;
  setInterval(() => {
    dummy.controls.forward = false;
    setTimeout(() => {
      dummy.controls.forward = !dummy.controls.forward;
      dummy.controls.backward = !dummy.controls.backward;
    }, 1000);
  }, 2000);
}, 1000);

let networkDrawDelay = 0;
let showNetwork = false;
let showSensors = true;

let gameStopped = false;

setupOnClicks();

animate();

function animate(time: number = 0) {
  if (gameStopped === false) {
    manageGameCanvas(time);
    displaySites();
  }
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

  enemy.update(walls.collection, dummy);
  dummy.update(walls.collection);

  enemy.draw(gameCtx, showSensors, "#A77500");
  dummy.draw(gameCtx);

  walls.draw(gameCtx);
}

function manageNetworkCanvas(time: number) {
  networkCtx.clearRect(0, 0, networkCtx.canvas.width, networkCtx.canvas.height);
  enemy.drawBrain(networkCtx);
}

function setupOnClicks() {
  networkDisplayButton.onclick = () => {
    if (showNetwork) {
      showNetwork = false;
      networkCanvas.style.display = "none";
    } else {
      networkCanvas.style.display = "block";
      showNetwork = true;
    }
  };

  sensorDisplayButton.onclick = () => {
    if (showSensors) {
      showSensors = false;
    } else {
      showSensors = true;
    }
  };
}

function displaySites() {
  for (const point of sites) {
    gameCtx.fillStyle = "#2358D1";
    gameCtx.beginPath();
    gameCtx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    gameCtx.fill();

    gameCtx.fillStyle = "#2358D166";
    gameCtx.beginPath();
    gameCtx.arc(point.x, point.y, siteRadius, 0, 2 * Math.PI);
    gameCtx.fill();
  }
}
