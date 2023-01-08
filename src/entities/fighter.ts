import { gunPointOffset, playerRadius, playerSpeed } from "configuration";
import RayType from "enums/rayType";
import Controls from "mechanics/controls";
import Ray from "mechanics/ray";
import DistanceData from "models/distanceData";
import { pointsDistanceFromLineSegment } from "utilities/mathExtensions";
import Vector2D from "utilities/vector2d";
import Bullet from "./bullet";
import Wall from "./wall";

abstract class Fighter {
  position: Vector2D;
  radius: number = playerRadius;
  angle: number;
  aimRay: Ray;

  bullets: Bullet[] = [];
  canShoot: boolean = true;

  constructor(pos: Vector2D) {
    this.position = pos.copy();
    this.angle = 0.0;
    this.aimRay = new Ray(gunPointOffset, RayType.Aim);
  }

  protected move = (controls: Controls, walls: Wall[]): void => {
    if (controls.forward) {
      let displacementVector = new Vector2D(0, -playerSpeed).rotate(this.angle);

      displacementVector = this.applyCollisionToDisplacementVector(walls, displacementVector);

      this.position = this.position.add(displacementVector);
    }
    if (controls.backward) {
      let displacementVector = new Vector2D(0, playerSpeed).rotate(this.angle);

      displacementVector = this.applyCollisionToDisplacementVector(walls, displacementVector);

      this.position = this.position.add(displacementVector);
    }

    const flip: number = controls.backward ? -1 : 1;
    if (controls.right) {
      this.angle += 0.08 * flip;
    }
    if (controls.left) {
      this.angle -= 0.08 * flip;
    }

    if (controls.shoot && this.canShoot) {
      this.canShoot = false;
      const bullet = new Bullet(this.position.add(gunPointOffset.rotate(this.angle)), this.angle);
      this.bullets.push(bullet);
      setTimeout(() => {
        this.canShoot = true;
      }, 200);
    }
  };

  private applyCollisionToDisplacementVector = (walls: Wall[], displacementVector: Vector2D): Vector2D => {
    const newPosition: Vector2D = this.position.add(displacementVector);
    const collisions = this.detectCollisionWithWalls(walls, newPosition);

    for (const collision of collisions) {
      const { intersectionPoint } = collision;

      if (Math.floor(intersectionPoint.x) > Math.floor(newPosition.x) && displacementVector.x > 0) {
        displacementVector = new Vector2D(0, displacementVector.y);
      }
      if (Math.floor(intersectionPoint.x) < Math.floor(newPosition.x) && displacementVector.x < 0) {
        displacementVector = new Vector2D(0, displacementVector.y);
      }
      if (Math.floor(intersectionPoint.y) > Math.floor(newPosition.y) && displacementVector.y > 0) {
        displacementVector = new Vector2D(displacementVector.x, 0);
      }
      if (Math.floor(intersectionPoint.y) < Math.floor(newPosition.y) && displacementVector.y < 0) {
        displacementVector = new Vector2D(displacementVector.x, 0);
      }
    }

    return displacementVector;
  };

  private detectCollisionWithWalls = (walls: Wall[], newPlayerPosition: Vector2D): DistanceData[] => {
    let collisions: DistanceData[] = [];

    for (const wall of walls) {
      const { lines } = wall;

      let collidingWalls: DistanceData[] = [];
      for (let i = 0; i < lines.length; i++) {
        const distanceFromPlayerCenter = pointsDistanceFromLineSegment(newPlayerPosition, lines[i][0], lines[i][1]);
        if (distanceFromPlayerCenter.distance <= this.radius) {
          collidingWalls.push(distanceFromPlayerCenter);
        }
      }

      if (collidingWalls.length > 0) {
        // Take the single closest collision
        const collisionToAdd =
          collidingWalls.length > 1
            ? collidingWalls.filter(c => c.distance === Math.min(...collidingWalls.map(col => col.distance)))[0]
            : collidingWalls[0];

        collisions.push(collisionToAdd);
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
