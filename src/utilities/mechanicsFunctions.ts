import IntersectionReading from "models/intersectionReading";
import Vector2D from "utilities/vector2d";

export const lerp = (A: number, B: number, fraction: number): number => {
  return A + (B - A) * fraction;
};

export const getIntersection = (
  startA: Vector2D,
  endA: Vector2D,
  startB: Vector2D,
  endB: Vector2D
): IntersectionReading | null => {
  const tTop = (endB.x - startB.x) * (startA.y - startB.y) - (endB.y - startB.y) * (startA.x - startB.x);
  const uTop = (startB.y - startA.y) * (startA.x - endA.x) - (startB.x - startA.x) * (startA.y - endA.y);
  const bottom = (endB.y - startB.y) * (endA.x - startA.x) - (endB.x - startB.x) * (endA.y - startA.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(startA.x, endA.x, t),
        y: lerp(startA.y, endA.y, t),
        offset: t,
      };
    }
  }

  return null;
};

export const polygonsIntersect = (polygon1: Vector2D[], polygon2: Vector2D[]): boolean => {
  for (let i = 0; i < polygon1.length; i++) {
    for (let j = 0; j < polygon2.length; j++) {
      const touch = getIntersection(
        polygon1[i],
        polygon1[(i + 1) % polygon1.length],
        polygon2[j],
        polygon2[(j + 1) % polygon2.length]
      );

      if (touch) {
        return true;
      }
    }
  }

  return false;
};

export const getRGBAFromWeight = (value: number): string => {
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = value > 0 ? 0 : 255;
  const B = 100;

  return `rgba(${R}, ${G}, ${B}, ${alpha})`;
};

export const getRGBFromWeight = (value: number): string => {
  const R = value < 0 ? 0 : 255;
  const G = value > 0 ? 0 : 255;
  const B = 100;

  return `rgb(${R}, ${G}, ${B})`;
};
