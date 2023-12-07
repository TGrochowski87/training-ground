import {
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
const exportBrainButton: HTMLButtonElement = document.getElementById("button-save") as HTMLButtonElement;
const importBrainButton: HTMLInputElement = document.getElementById("button-import") as HTMLInputElement;

const gameCtx = gameCanvas.getContext("2d")!;
const networkCtx = networkCanvas.getContext("2d")!;

let population: Population =
  userSettings.method == "NEAT"
    ? new PopulationNEAT(populationSize, userSettings.mode)
    : new PopulationConventional(populationSize, userSettings.mode);

const walls: WallCollection = new WallCollection();

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

  if (population.isPopulationExtinct() == false) {
    population.update(walls.collection);
  } else {
    population.calculateFitness();
    population.naturalSelection();
  }
  population.draw(gameCtx, showSensors);

  walls.draw(gameCtx);
}

function manageNetworkCanvas(time: number) {
  networkCtx.clearRect(0, 0, networkCtx.canvas.width, networkCtx.canvas.height);
  population.drawBestMembersNeuralNetwork(networkCtx, 0);
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
    population.exportBestNeuralNetwork();
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
    gameCtx.arc(point.x, point.y, siteRadius, 0, 2 * Math.PI);
    gameCtx.fill();
  }
}

const createPopulationFromTemplate = async (file: File) => {
  const content = await file.text();

  if (userSettings.method == "NEAT") {
    const brain = NeuralNetworkNEAT.import(content);
    population = new PopulationNEAT(populationSize, userSettings.mode, brain);
  } else {
    const brain = NeuralNetworkConventional.import(content);
    population = new PopulationConventional(populationSize, userSettings.mode, brain);
  }
};
