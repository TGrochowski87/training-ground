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

// NEAT Setup
const speciesSelectionContainer: HTMLDivElement = document.getElementById("species-selection") as HTMLDivElement;
speciesSelectionContainer.style.width = `${gameScreenWidth}px`;
const speciesNumberInfo: HTMLHeadingElement = document.getElementById("species-number-info") as HTMLHeadingElement;
const showSelectedCheckbox: HTMLInputElement = document.getElementById("show-only-selected") as HTMLInputElement;
const speciesSelectionButtons: HTMLButtonElement[] = [];
let selectedSpeciesId: number = 0;
if (userSettings.method == "NEAT") {
  prepareNEATControls();
}

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

    if (userSettings.method == "NEAT") {
      updateButtons();
      const highestSpeciesId = Math.max(...(population as PopulationNEAT).population.map(s => s.id));
      for (let i = speciesSelectionButtons.length; i <= highestSpeciesId; i++) {
        addNewSpeciesButton(i);
      }
    }
  }
  population.draw(gameCtx, showSensors, showSelectedCheckbox.checked ? selectedSpeciesId : undefined);

  walls.draw(gameCtx);
}

function manageNetworkCanvas(time: number) {
  networkCtx.clearRect(0, 0, networkCtx.canvas.width, networkCtx.canvas.height);
  population.drawBestMembersNeuralNetwork(networkCtx, selectedSpeciesId);
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

function prepareNEATControls() {
  const NEATControlsContainer: HTMLDivElement = document.getElementById("NEAT-controls") as HTMLDivElement;
  NEATControlsContainer.style.display = "block";
  addNewSpeciesButton(0);
}

function addNewSpeciesButton(id: number) {
  const button: HTMLButtonElement = document.createElement("button");
  button.textContent = `Species ${id}`;
  button.onclick = () => {
    selectedSpeciesId = id;
    speciesNumberInfo.textContent = `Selected species: ${id}`;
  };

  speciesSelectionContainer.appendChild(button);
  speciesSelectionButtons[id] = button;
}

const updateButtons = () => {
  for (let i = 0; i < speciesSelectionButtons.length; i++) {
    if ((population as PopulationNEAT).population.some(s => s.id == i) == false) {
      speciesSelectionButtons[i].disabled = true;
    }
  }

  if (speciesSelectionButtons[selectedSpeciesId].disabled) {
    for (let i = 0; i < speciesSelectionButtons.length; i++) {
      if (speciesSelectionButtons[i].disabled == false) {
        console.log("zmiana ", i);
        selectedSpeciesId = i;
        speciesNumberInfo.textContent = `Selected species: ${selectedSpeciesId}`;
      }
    }
  }
};

async function createPopulationFromTemplate(file: File) {
  const content = await file.text();

  if (userSettings.method == "NEAT") {
    const brain = NeuralNetworkNEAT.import(content);
    population = new PopulationNEAT(populationSize, userSettings.mode, brain);
  } else {
    const brain = NeuralNetworkConventional.import(content);
    population = new PopulationConventional(populationSize, userSettings.mode, brain);
  }
}
