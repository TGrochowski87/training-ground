import { gameScreenHeight, gameScreenWidth, networkViewHeight, networkViewWidth, sites } from "configuration";
import WallCollection from "entities/wallCollection";
import Player from "entities/player";
import "style.css";
import Vector2D from "utilities/vector2d";
import Population from "machine-learning/population";
import NeuralNetwork from "machine-learning/neuralNetwork";

const gameCanvas: HTMLCanvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;
gameCanvas.width = gameScreenWidth;
gameCanvas.height = gameScreenHeight;

const networkCanvas: HTMLCanvasElement = document.getElementById("networkCanvas") as HTMLCanvasElement;
networkCanvas.width = networkViewWidth;
networkCanvas.height = networkViewHeight;
networkCanvas.style.display = "none";

const networkDisplayButton: HTMLButtonElement = document.getElementById("button-network") as HTMLButtonElement;
const sensorDisplayButton: HTMLButtonElement = document.getElementById("button-sensors") as HTMLButtonElement;
const exportBrainButton: HTMLButtonElement = document.getElementById("button-save") as HTMLButtonElement;
const importBrainButton: HTMLInputElement = document.getElementById("button-import") as HTMLInputElement;

const gameCtx = gameCanvas.getContext("2d")!;
const networkCtx = networkCanvas.getContext("2d")!;

const player: Player = new Player(new Vector2D(gameScreenWidth / 2, gameScreenHeight / 2));

const populationCount = 20;
let population: Population = new Population(populationCount);

const walls: WallCollection = new WallCollection();

let networkDrawDelay = 0;
let showNetwork = false;
let showSensors = true;

setupOnClicks();

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

  displaySites();

  requestAnimationFrame(animate);
}

function manageGameCanvas(time: number) {
  gameCtx.clearRect(0, 0, gameCtx.canvas.width, gameCtx.canvas.height);

  player.update(walls.collection);
  player.draw(gameCtx);

  if (population.enemies.some(e => e.isDead === false)) {
    population.update(walls.collection, player);
  } else {
    population.calculateFitness(player);
    population.neuralSelection();
  }
  population.draw(gameCtx, showSensors);

  walls.draw(gameCtx);
}

function manageNetworkCanvas(time: number) {
  networkCtx.clearRect(0, 0, networkCtx.canvas.width, networkCtx.canvas.height);
  //networkCtx.lineDashOffset = -time / 50;
  population.enemies[0].drawNeuralNetwork(networkCtx);
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

  exportBrainButton.onclick = () => {
    population.enemies[population.bestEnemyIndex].brain.export();
  };

  importBrainButton.onchange = (event: Event) => {
    let file = (<HTMLInputElement>event.target).files![0];

    createPopulationFromTemplate(file);
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
    gameCtx.arc(point.x, point.y, 50, 0, 2 * Math.PI);
    gameCtx.fill();
  }
}

const createPopulationFromTemplate = async (file: File) => {
  const content = await file.text();
  const brain = NeuralNetwork.import(content);
  population = new Population(populationCount, brain);
};
