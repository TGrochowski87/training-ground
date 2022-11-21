import { gunPointOffset, playerRadius, playerSpeed } from "../constants";
import Wall from "entities/wall";
import FighterType from "enums/fighterType";
import RayType from "enums/RayType";
import Controls from "mechanics/controls";
import Ray from "mechanics/ray";
import Vector2D from "utilities/vector2d";
import { pointsDistanceFromLineSegment } from "../utilities/mathExtensions";
import DistanceData from "../models/distanceData";
import Bullet from "./bullet";
import Sensor from "~/mechanics/sensor";

class Fighter {
  position: Vector2D;
  radius: number = playerRadius;

  type: FighterType;

  controls: Controls;
  angle: number;
  aimRay: Ray;

  bullets: Bullet[] = [];
  canShoot: boolean = true;

  // AI stuff (TODO: move to different Fighter class)
  sensor: Sensor;

  constructor(pos: Vector2D, fighterType: FighterType) {
    this.position = pos.copy();
    this.type = fighterType;

    this.angle = 0.0;
    this.controls = new Controls();

    this.aimRay = new Ray(gunPointOffset, RayType.Aim);
    this.sensor = new Sensor(this);
  }

  update = (walls: Wall[]): void => {
    this.move(walls);
    this.aimRay.update(
      this.position.add(gunPointOffset.rotate(this.angle)),
      this.angle,
      walls
    );

    this.sensor.update(walls);
    this.bullets = this.bullets.filter(
      (bullet) => bullet.toBeDeleted === false
    );
    this.bullets.forEach((bullet) => bullet.update(walls));
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    this.sensor.draw(ctx);

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
    this.bullets.forEach((bullet) => bullet.draw(ctx));
  };

  private move = (walls: Wall[]): void => {
    if (this.controls.forward) {
      let displacementVector = new Vector2D(0, -playerSpeed).rotate(this.angle);

      displacementVector = this.applyCollisionToDisplacementVector(
        walls,
        displacementVector
      );

      this.position = this.position.add(displacementVector);
    }
    if (this.controls.backward) {
      let displacementVector = new Vector2D(0, playerSpeed).rotate(this.angle);

      displacementVector = this.applyCollisionToDisplacementVector(
        walls,
        displacementVector
      );

      this.position = this.position.add(displacementVector);
    }

    const flip: number = this.controls.backward ? -1 : 1;
    if (this.controls.right) {
      this.angle += 0.08 * flip;
    }
    if (this.controls.left) {
      this.angle -= 0.08 * flip;
    }

    if (this.controls.shoot && this.canShoot) {
      this.canShoot = false;
      const bullet = new Bullet(
        this.position.add(gunPointOffset.rotate(this.angle)),
        this.angle
      );
      this.bullets.push(bullet);
      setTimeout(() => {
        this.canShoot = true;
      }, 200);
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

      if (
        Math.floor(intersectionPoint.x) > Math.floor(newPosition.x) &&
        displacementVector.x > 0
      ) {
        displacementVector = new Vector2D(0, displacementVector.y);
      }
      if (
        Math.floor(intersectionPoint.x) < Math.floor(newPosition.x) &&
        displacementVector.x < 0
      ) {
        displacementVector = new Vector2D(0, displacementVector.y);
      }
      if (
        Math.floor(intersectionPoint.y) > Math.floor(newPosition.y) &&
        displacementVector.y > 0
      ) {
        displacementVector = new Vector2D(displacementVector.x, 0);
      }
      if (
        Math.floor(intersectionPoint.y) < Math.floor(newPosition.y) &&
        displacementVector.y < 0
      ) {
        displacementVector = new Vector2D(displacementVector.x, 0);
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
      const { lines } = wall;

      let collidingWalls: DistanceData[] = [];
      for (let i = 0; i < lines.length; i++) {
        const distanceFromPlayerCenter = pointsDistanceFromLineSegment(
          newPlayerPosition,
          lines[i][0],
          lines[i][1]
        );
        if (distanceFromPlayerCenter.distance <= this.radius) {
          collidingWalls.push(distanceFromPlayerCenter);
        }
      }

      if (collidingWalls.length > 0) {
        // Take the single closest collision
        const collisionToAdd =
          collidingWalls.length > 1
            ? collidingWalls.filter(
                (c) =>
                  c.distance ===
                  Math.min(...collidingWalls.map((col) => col.distance))
              )[0]
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
