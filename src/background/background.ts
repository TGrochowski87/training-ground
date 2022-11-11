import BackgroundShape from "./backgroundShape";
import { randomBetween } from "../utilities/mathExtensions";

class Background {
  private shapes: BackgroundShape[];
  private intervalId: number = 0;

  constructor() {
    this.shapes = [];

    this.setupBackgroundEvents();
  }

  update = (): void => {
    this.shapes.forEach((shape) => shape.update());
  };

  show = (ctx: CanvasRenderingContext2D): void => {
    this.shapes.forEach((shape) => shape.show(ctx));
  };

  private setupBackgroundEvents = (): void => {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stopGeneratingShapes();
      } else {
        this.startGeneratingShapes();
      }
    });
    //window.onfocus = this.startGeneratingShapes;
    //window.onblur = this.stopGeneratingShapes;
  };

  private startGeneratingShapes = (): void => {
    console.log("test");
    this.intervalId = setInterval(() => {
      const y = randomBetween(-100, window.innerHeight + 100);
      const scale = randomBetween(0.1, 1);

      const newShape = new BackgroundShape(y, scale);
      this.shapes.push(newShape);

      this.monitorShapesPosition();
    }, 1000);
  };

  private stopGeneratingShapes = (): void => {
    console.log("halo");
    clearInterval(this.intervalId);
  };

  private monitorShapesPosition = (): void => {
    this.shapes = this.shapes.filter(
      (shape) => shape.position.x + shape.image.width > 0
    );
  };
}

export default Background;
