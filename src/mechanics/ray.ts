import { aimRayLength, sensorRayLength } from "configuration";
import Player from "entities/player";
import Wall from "entities/wall";
import RayType from "enums/rayType";
import IntersectionReading from "models/intersectionReading";
import SensorReading from "models/sensorReading";
import { distanceBetweenPoints, pointsDistanceFromLineSegment } from "utilities/mathExtensions";
import { getIntersection } from "utilities/mechanicsFunctions";
import Vector2D from "utilities/vector2d";

class Ray {
  readonly angle: number;
  start: Vector2D;
  end: Vector2D;
  length: number;

  width: number;
  color: string;
  readingColor: string;

  intersectionReading: SensorReading | null = null;

  constructor(start: Vector2D, type: RayType, angle: number = 0) {
    this.start = start.copy();
    this.angle = angle;
    this.end = new Vector2D(0, 0);

    if (type === RayType.Aim) {
      this.color = "#BD1000";
      this.readingColor = "#00000000";
      this.width = 1;
      this.length = aimRayLength;
    } else {
      this.color = "yellow";
      this.readingColor = "grey";
      this.width = 2;
      this.length = sensorRayLength;
    }
  }

  update = (newStartingPoint: Vector2D, additionalRotation: number, walls: Wall[], player: Player): void => {
    this.start = newStartingPoint;
    const newAngle = this.angle + additionalRotation;

    this.end = new Vector2D(
      this.start.x + Math.sin(newAngle) * this.length,
      this.start.y - Math.cos(newAngle) * this.length
    );

    this.intersectionReading = this.getIntersectionReading(walls, player);
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    let changePoint: Vector2D = this.end;
    if (this.intersectionReading) {
      changePoint = new Vector2D(this.intersectionReading.x, this.intersectionReading.y);
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

  private getIntersectionReading = (walls: Wall[], player: Player): SensorReading | null => {
    const readings = [this.getReadingForIntersectionWithWalls(walls), this.getReadingForIntersectionWithPlayer(player)];

    const nonNullReadings = readings.filter(r => r !== null);

    if (nonNullReadings.length === 0) {
      return null;
    } else {
      const offsets = nonNullReadings.map(r => r!.offset);
      const minOffset = Math.min(...offsets);
      return nonNullReadings.find(r => r!.offset === minOffset) || null;
    }
  };

  private getReadingForIntersectionWithWalls = (walls: Wall[]): SensorReading | null => {
    let intersections: SensorReading[] = [];

    // Processed by splitting every wall into four separate lines
    for (let i = 0; i < walls.length; i++) {
      const { lines } = walls[i];

      for (let j = 0; j < lines.length; j++) {
        const intersection: IntersectionReading | null = getIntersection(
          this.start,
          this.end,
          lines[j][0],
          lines[j][1]
        );

        if (intersection) {
          intersections.push({ detectedEntity: "WALL", ...intersection });
        }
      }
    }

    if (intersections.length === 0) {
      return null;
    } else {
      const offsets = intersections.map(i => i.offset);
      const minOffset = Math.min(...offsets);
      return intersections.find(i => i.offset === minOffset) || null;
    }
  };

  private getReadingForIntersectionWithPlayer = (player: Player): SensorReading | null => {
    const distanceFromPlayerCenter = pointsDistanceFromLineSegment(player.position, this.start, this.end);
    if (distanceFromPlayerCenter.distance <= player.radius) {
      return {
        x: distanceFromPlayerCenter.intersectionPoint.x,
        y: distanceFromPlayerCenter.intersectionPoint.y,
        offset: distanceBetweenPoints(this.start, distanceFromPlayerCenter.intersectionPoint) / this.length,
        detectedEntity: "PLAYER",
      };
    } else {
      return null;
    }
  };
}

export default Ray;
