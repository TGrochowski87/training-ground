import { gunPointOffset } from "../constants";
import Wall from "entities/wall";
import RayType from "enums/RayType";
import SensorReading from "models/SensorReading";
import { getIntersection } from "utilities/mechanicsFunctions";
import Vector2D from "utilities/vector2d";

class Ray {
  start: Vector2D;
  end: Vector2D;
  angle: number;
  length: number;

  width: number;
  color: string;
  readingColor: string;

  intersectionReading: SensorReading | null = null;

  constructor(start: Vector2D, type: RayType) {
    this.start = start.copy();
    this.angle = 0;
    this.end = new Vector2D(0, 0);

    if (type === RayType.Aim) {
      this.color = "#BD1000";
      this.readingColor = "#00000000";
      this.width = 1;
      this.length = 200;
    } else {
      this.color = "yellow";
      this.readingColor = "grey";
      this.width = 2;
      this.length = 300;
    }
  }

  update = (
    newStartingPoint: Vector2D,
    newAngle: number,
    walls: Wall[]
  ): void => {
    this.start = newStartingPoint.copy().add(gunPointOffset.rotate(this.angle));
    this.angle = newAngle;

    this.end = new Vector2D(
      this.start.x + Math.sin(this.angle) * this.length,
      this.start.y - Math.cos(this.angle) * this.length
    );

    this.intersectionReading = this.getIntersectionReading(walls);
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    let changePoint: Vector2D = this.end;
    if (this.intersectionReading) {
      changePoint = new Vector2D(
        this.intersectionReading.x,
        this.intersectionReading.y
      );
    }

    ctx.lineWidth = this.width;

    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(changePoint.x, changePoint.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = this.readingColor;
    ctx.moveTo(this.end.x, this.end.y);
    ctx.lineTo(changePoint.x, changePoint.y);
    ctx.stroke();
  };

  private getIntersectionReading = (walls: Wall[]) => {
    let intersections: SensorReading[] = [];

    // Processed by splitting every wall into four separate lines
    for (let i = 0; i < walls.length; i++) {
      const { topLeft, topRight, bottomLeft, bottomRight } = walls[i];
      const points = [
        [topLeft, topRight],
        [topRight, bottomRight],
        [bottomRight, bottomLeft],
        [bottomLeft, topLeft],
      ];

      for (let j = 0; j < points.length; j++) {
        const intersection: SensorReading | null = getIntersection(
          this.start,
          this.end,
          points[j][0],
          points[j][1]
        );

        if (intersection) {
          intersections.push(intersection);
        }
      }
    }

    if (intersections.length === 0) {
      return null;
    } else {
      const offsets = intersections.map((i) => i.offset);
      const minOffset = Math.min(...offsets);
      return intersections.find((i) => i.offset === minOffset) || null;
    }
  };
}

export default Ray;
