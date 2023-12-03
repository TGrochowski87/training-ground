import { sensorRayCount, sensorRaySpread } from "configuration";
import Ray from "mechanics/ray";
import { lerp } from "utilities/mechanicsFunctions";
import RayType from "enums/rayType";
import Wall from "entities/wall";
import SensorReading from "models/SensorReading";
import Fighter from "entities/fighter";
import Player from "entities/player";

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

  update = (walls: Wall[], player: Player) => {
    this.rays.forEach(ray => ray.update(this.source.position, this.source.angle, walls, player));
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    this.rays.forEach(ray => ray.draw(ctx));
  };

  getReadings = (): (SensorReading | null)[] => {
    const readings: (SensorReading | null)[] = [];

    for (const ray of this.rays) {
      readings.push(ray.intersectionReading);
    }

    return readings;
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
