import { sensorRayCount, sensorRaySpread } from "configuration";
import Ray from "mechanics/ray";
import Player from "entities/player";
import { lerp } from "utilities/mechanicsFunctions";
import RayType from "enums/rayType";
import Wall from "entities/wall";

class Sensor {
  source: Player;

  rayCount: number;
  raySpread: number;

  rays: Ray[] = [];

  constructor(source: Player) {
    this.source = source;

    this.rayCount = sensorRayCount;
    this.raySpread = sensorRaySpread;

    this.rays = this.createRays();
  }

  update = (walls: Wall[]) => {
    this.rays.forEach(ray => ray.update(this.source.position, this.source.angle, walls));
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    this.rays.forEach(ray => ray.draw(ctx));
  };

  private createRays = (): Ray[] => {
    let rays: Ray[] = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = lerp(-this.raySpread / 2, this.raySpread / 2, i / this.rayCount);

      rays.push(new Ray(this.source.position, RayType.Sensor, rayAngle));
    }

    return rays;
  };
}

export default Sensor;
