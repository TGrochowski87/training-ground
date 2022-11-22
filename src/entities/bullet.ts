import { bulletMaxDistance, bulletRadius, bulletSpeed } from "configuration";
import { getIntersection } from "utilities/mechanics-functions";
import Vector2D from "utilities/vector2d";
import Wall from "entities/wall";

class Bullet {
  position: Vector2D;
  radius: number = bulletRadius;

  displacementVector: Vector2D;
  distanceTraveled: number = 0;
  maxDistanceTraveled: number = bulletMaxDistance;

  toBeDeleted: boolean = false;

  constructor(pos: Vector2D, angle: number) {
    this.position = pos.copy();
    this.displacementVector = new Vector2D(0, -bulletSpeed).rotate(angle);
  }

  update = (walls: Wall[]): void => {
    const newPosition = this.position.add(this.displacementVector);
    this.distanceTraveled += bulletSpeed;
    this.checkDeleteCondition(walls, newPosition);

    if (this.toBeDeleted === false) {
      this.position = newPosition;
    }
  };

  draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  checkDeleteCondition = (walls: Wall[], newPosition: Vector2D): void => {
    if (this.distanceTraveled >= this.maxDistanceTraveled) {
      this.toBeDeleted = true;
      return;
    }
    if (this.detectCollisionWithWalls(walls, newPosition)) {
      this.toBeDeleted = true;
      return;
    }
  };

  private detectCollisionWithWalls = (
    walls: Wall[],
    newPosition: Vector2D
  ): boolean => {
    for (const wall of walls) {
      const { lines } = wall;

      for (let i = 0; i < lines.length; i++) {
        if (
          getIntersection(this.position, newPosition, lines[i][0], lines[i][1])
        ) {
          return true;
        }
      }
    }

    return false;
  };
}

export default Bullet;
