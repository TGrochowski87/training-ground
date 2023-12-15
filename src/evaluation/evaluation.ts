import { siteRadius } from "configuration";
import DummyPlayer from "entities/dummyPlayer";
import Enemy from "entities/enemy";
import Wall from "entities/wall";
import EnemyConventional from "machine-learning/conventional/enemyConventional";
import NeuralNetworkConventional from "machine-learning/conventional/neuralNetworkConventional";
import EnemyNEAT from "machine-learning/NEAT/enemyNEAT";
import NeuralNetworkNEAT from "machine-learning/NEAT/neuralNetworkNEAT";
import NeuralNetwork from "machine-learning/neuralNetwork";
import TargetSiteDealer from "mechanics/targetSiteDealer";
import { distanceBetweenPoints } from "utilities/mathExtensions";
import Vector2D from "utilities/vector2d";
import {
  resourcesScenario1,
  resourcesScenario2,
  resourcesScenario3,
  resourcesScenario4,
  ScenarioResources,
} from "./resources";

const appContainer: HTMLDivElement = document.getElementById("app") as HTMLDivElement;
const importContainer: HTMLDivElement = document.getElementById("import-container") as HTMLDivElement;
const trainingContainer: HTMLDivElement = document.getElementById("training-container") as HTMLDivElement;
const importBrainButton: HTMLInputElement = document.getElementById("button-import") as HTMLInputElement;

const urlParams = new URLSearchParams(window.location.search);
const scenario: string = urlParams.get("scenario")!;
let resources: ScenarioResources;
let dummyExists: boolean = false;
let dummyAlive: boolean = true;
let currentLifetime: number = 0;
let currentTargetSiteSequenceIndex: number = 1;
let sitesReachedCounter: number = 0;

const dummyIncluded: boolean = urlParams.get("with-dummy") ? true : false;

switch (scenario) {
  case "one":
    resources = resourcesScenario1;
    break;

  case "two":
    resources = resourcesScenario2;
    break;

  case "three":
    resources = resourcesScenario3;
    break;

  case "four":
    resources = resourcesScenario4;
    break;

  default:
    break;
}

TargetSiteDealer.initialize(resources!.sites, resources!.specialInitialSequence);
dummyExists = dummyIncluded && resources!.dummyPos != undefined;

importBrainButton.onchange = async (event: Event) => {
  let file = (<HTMLInputElement>event.target).files![0];

  const brandNewBrain = await createBrainFromTemplate(file);
  const gameCtx = constructGameField();

  const walls: Wall[] = resources!.walls;
  const dummy: DummyPlayer = new DummyPlayer(dummyExists ? resources!.dummyPos! : new Vector2D(-1000, -1000), false);
  const enemy: Enemy<NeuralNetwork> =
    brandNewBrain instanceof NeuralNetworkConventional
      ? new EnemyConventional(new Vector2D(100, 100), (brandNewBrain as NeuralNetworkConventional).clone())
      : new EnemyNEAT(new Vector2D(100, 100), (brandNewBrain as NeuralNetworkNEAT).clone());

  animate();

  function animate(time: number = 0) {
    if (checkEndingConditions()) {
      return;
    }

    manageGameCanvas(time);
    currentLifetime++;

    requestAnimationFrame(animate);
  }

  function manageGameCanvas(time: number) {
    gameCtx.clearRect(0, 0, gameCtx.canvas.width, gameCtx.canvas.height);

    displaySites(gameCtx);

    if (dummyExists) {
      dummy.update(walls);
      dummy.draw(gameCtx);
    }

    enemy.update(walls, dummy);
    enemy.draw(gameCtx, false, "#A77500");

    for (const wall of walls) {
      wall.draw(gameCtx);
    }

    realTimeScoreTracking();
  }

  function realTimeScoreTracking(): void {
    const distanceToSite: number = distanceBetweenPoints(
      enemy.position,
      resources.sites[TargetSiteDealer.siteTargetSequence[currentTargetSiteSequenceIndex]]
    );
    if (distanceToSite < siteRadius) {
      console.log(
        `Reached site ${TargetSiteDealer.siteTargetSequence[currentTargetSiteSequenceIndex]}, Time in frames: ${currentLifetime}`
      );
      currentTargetSiteSequenceIndex++;
      sitesReachedCounter++;
    }

    if (dummyAlive && dummy.isDead) {
      console.log("Dummy shot!");
      dummyAlive = false;
    }
  }

  function checkEndingConditions(): boolean {
    let evaluationFinished: boolean = false;

    if (currentLifetime >= resources.lifespan) {
      console.log("================================");
      console.log("Time's up!");
      console.log(`The AI reached ${sitesReachedCounter} sites.`);
      evaluationFinished = true;
    }

    const lastSiteIndex = resources.specialInitialSequence?.length ?? resources.sites.length;
    if (enemy.currentTargetSiteSequenceIndex == lastSiteIndex) {
      console.log("================================");
      console.log(`The last site reached in ${currentLifetime} frames.`);
      evaluationFinished = true;
    }

    if (evaluationFinished && dummyAlive == false) {
      console.log("The AI managed to shoot down the dummy.");
    }

    return evaluationFinished;
  }
};

function constructGameField(): CanvasRenderingContext2D {
  const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
  gameCanvas.id = "game-canvas";
  trainingContainer.append(gameCanvas);
  appContainer.removeChild(importContainer);

  gameCanvas.width = resources.fieldSize.x;
  gameCanvas.height = resources.fieldSize.y;

  return gameCanvas.getContext("2d")!;
}

function displaySites(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < resources.sites!.length; i++) {
    const point = resources.sites![i];

    ctx.fillStyle = "#2358D1";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#2358D166";
    ctx.beginPath();
    ctx.arc(point.x, point.y, siteRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`${i}`, point.x, point.y);
  }
}

const createBrainFromTemplate = async (file: File): Promise<NeuralNetwork> => {
  const content = await file.text();

  if (file.name.includes("NEAT")) {
    return NeuralNetworkNEAT.import(content);
  }

  return NeuralNetworkConventional.import(content);
};
