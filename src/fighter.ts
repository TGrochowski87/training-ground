import { gunPointOffset, playerSpeed } from "./constants";
import Wall from "entities/wall";
import FighterType from "enums/fighterType";
import RayType from "enums/RayType";
import Controls from "mechanics/controls";
import Ray from "mechanics/ray";
import Vector2D from "utilities/vector2d";
import { pointsDistanceFromLineSegment } from "./utilities/mathExtensions";
import DistanceData from "./models/distanceData";

class Fighter {
  position: Vector2D;
  radius: number = 10;

  type: FighterType;

  controls: Controls;
  angle: number;
  aimRay: Ray;

  constructor(pos: Vector2D, fighterType: FighterType) {
    this.position = pos.copy();
    this.type = fighterType;

    this.angle = 0.0;
    this.controls = new Controls();

    this.aimRay = new Ray(gunPointOffset, RayType.Aim);
  }

  // fix rootDir
  update = (walls: Wall[], ctx: CanvasRenderingContext2D): void => {
    this.move(walls, ctx);
    this.aimRay.update(this.position, this.angle, walls);
  };

  show = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = "#566040";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(8, -13);
    ctx.stroke();

    ctx.restore();

    this.aimRay.draw(ctx);
  };

  private move = (walls: Wall[], ctx: CanvasRenderingContext2D): void => {
    if (this.controls.forward) {
      let displacementVector = new Vector2D(0, -playerSpeed).rotate(this.angle);

      displacementVector = this.applyCollisionToDisplacementVector(
        walls,
        displacementVector
      );

      let componentX = new Vector2D(displacementVector.x, 0);
      let componentY = new Vector2D(0, displacementVector.y);

      componentX.visualize(ctx, this.position, 10);
      componentY.visualize(ctx, this.position, 10);

      this.position = this.position.add(displacementVector);
    }
    if (this.controls.backward) {
      let displacementVector = new Vector2D(0, playerSpeed).rotate(this.angle);

      displacementVector = this.applyCollisionToDisplacementVector(
        walls,
        displacementVector
      );

      let componentX = new Vector2D(displacementVector.x, 0);
      let componentY = new Vector2D(0, displacementVector.y);

      componentX.visualize(ctx, this.position, 10);
      componentY.visualize(ctx, this.position, 10);

      this.position = this.position.add(displacementVector);
    }

    const flip: number = this.controls.backward ? -1 : 1;
    if (this.controls.right) {
      this.angle += 0.08 * flip;
    }
    if (this.controls.left) {
      this.angle -= 0.08 * flip;
    }
  };

  private applyCollisionToDisplacementVector = (
    walls: Wall[],
    displacementVector: Vector2D
  ): Vector2D => {
    const newPosition: Vector2D = this.position.add(displacementVector);
    const collisions = this.detectCollisionWithWalls(walls, newPosition);

    for (const collision of collisions) {
      const { intersectionPoint } = collision;

      // Diagonal walls not supported
      if (Math.floor(intersectionPoint.x) === Math.floor(newPosition.x)) {
        displacementVector = new Vector2D(displacementVector.x, 0);
      }
      if (Math.floor(intersectionPoint.y) === Math.floor(newPosition.y)) {
        displacementVector = new Vector2D(0, displacementVector.y);
      }
    }

    return displacementVector;
  };

  private detectCollisionWithWalls = (
    walls: Wall[],
    newPlayerPosition: Vector2D
  ): DistanceData[] => {
    let collisions: DistanceData[] = [];

    for (const wall of walls) {
      const { topLeft, topRight, bottomLeft, bottomRight } = wall;
      const points = [
        [topLeft, topRight],
        [topRight, bottomRight],
        [bottomRight, bottomLeft],
        [bottomLeft, topLeft],
      ];

      for (let i = 0; i < points.length; i++) {
        const distanceFromPlayerCenter = pointsDistanceFromLineSegment(
          newPlayerPosition,
          points[i][0],
          points[i][1]
        );
        if (distanceFromPlayerCenter.distance <= this.radius) {
          collisions.push(distanceFromPlayerCenter);
          break;
        }
      }

      // Max two walls possible
      if (collisions.length === 2) {
        break;
      }
    }

    return collisions;
  };
}

export default Fighter;
