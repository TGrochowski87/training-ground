import { sensorRayCount, sensorRaySpread } from "~/constants";
import Ray from "~/mechanics/ray";
import Fighter from "~/entities/fighter";
import { lerp } from "~/utilities/mechanicsFunctions";
import RayType from "~/enums/RayType";
import Wall from "~/entities/wall";

class Sensor {
  source: Fighter;

  rayCount: number;
  raySpread: number;

  rays: Ray[] = [];

  constructor(source: Fighter) {
    this.source = source;

    this.rayCount = sensorRayCount;
    this.raySpread = sensorRaySpread;

    this.rays = this.createRays();
  }

  update = (walls: Wall[]) => {
    this.rays.forEach((ray) =>
      ray.update(this.source.position, this.source.angle, walls)
    );
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    this.rays.forEach((ray) => ray.draw(ctx));
  };

  private createRays = (): Ray[] => {
    let rays: Ray[] = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = lerp(
        -this.raySpread / 2,
        this.raySpread / 2,
        i / this.rayCount
      );

      rays.push(new Ray(this.source.position, RayType.Sensor, rayAngle));
    }

    return rays;
  };
}

export default Sensor;
