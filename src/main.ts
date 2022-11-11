import Background from "./background/background";
import { gameScreenHeight, gameScreenWidth } from "./constants";
import "./style.css";

const appCanvas: HTMLCanvasElement = document.getElementById(
  "appCanvas"
) as HTMLCanvasElement;
appCanvas.width = window.innerWidth;
appCanvas.height = window.innerHeight;

const gameCanvas: HTMLCanvasElement = document.getElementById(
  "gameCanvas"
) as HTMLCanvasElement;
gameCanvas.width = gameScreenWidth;
gameCanvas.height = gameScreenHeight;

const appCtx = appCanvas.getContext("2d")!;
const gameCtx = gameCanvas.getContext("2d")!;

const background: Background = new Background();

animateBackground();

function animateBackground(time: number = 0) {
  appCanvas.width = window.innerWidth;
  appCanvas.height = window.innerHeight;

  background.update();
  background.show(appCtx);

  requestAnimationFrame(animateBackground);
}
