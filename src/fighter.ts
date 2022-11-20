import { gunPointOffset, playerSpeed } from "./constants";
import Wall from "entities/wall";
import FighterType from "enums/fighterType";
import RayType from "enums/RayType";
import Controls from "mechanics/controls";
import Ray from "mechanics/ray";
import Vector2D from "utilities/vector2d";
import { pointsDistanceFromLineSegment } from "./utilities/mathExtensions";

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
      displacementVector.visualize(ctx, this.position, 10);
      const newPosition: Vector2D = this.position.add(displacementVector);
      if (this.detectCollisionWithWalls(walls, newPosition) === false) {
        this.position = newPosition;
      }
    }
    if (this.controls.backward) {
      let displacementVector = new Vector2D(0, playerSpeed).rotate(this.angle);
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

  // 0. Check only the closest walls
  // 1. Calculate line function formula from every like of the wall by points
  // 2. Calculate distance between the line and the center of the player circle
  // 3. If the distance is lower than player's circle's radius, then the collision occurs

  // 4. Create a return force vector from the wall
  // 5. Move the vector to player's center
  // 6. Sum the vectors (might be more than 2)
  // 7. Apply the new vector
  private detectCollisionWithWalls = (
    walls: Wall[],
    newPlayerPosition: Vector2D
  ) => {
    let collidingWalls = [];

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
          collidingWalls.push(wall);
          break;
        }
      }

      // Lets try for max 2 walls
      // if (collidingWalls.length === 2) {
      //   break;
      // }
    }

    if (collidingWalls.length > 0) {
      return true;
    }
    return false;
  };
}

export default Fighter;
