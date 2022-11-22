import DistanceData from "models/distance-data";
import Vector2D from "utilities/vector2d";

export const randomBetween = (min: number = 0, max: number = 1) => {
  return Math.random() * (max - min) + min;
};

export const gaussianRandomBetween = (start: number, end: number) => {
  return Math.floor(start + gaussianRandom() * (end - start + 1));
};

export const gaussianRandom = () => {
  let u = 1 - Math.random();
  let v = Math.random();

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const pointsDistanceFromLineSegment = (
  point: Vector2D,
  segmentPointA: Vector2D,
  segmentPointB: Vector2D
): DistanceData => {
  var A = point.x - segmentPointA.x;
  var B = point.y - segmentPointA.y;
  var C = segmentPointB.x - segmentPointA.x;
  var D = segmentPointB.y - segmentPointA.y;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = segmentPointA.x;
    yy = segmentPointA.y;
  } else if (param > 1) {
    xx = segmentPointB.x;
    yy = segmentPointB.y;
  } else {
    xx = segmentPointA.x + param * C;
    yy = segmentPointA.y + param * D;
  }

  var dx = point.x - xx;
  var dy = point.y - yy;
  return {
    distance: Math.sqrt(dx * dx + dy * dy),
    intersectionPoint: new Vector2D(xx, yy),
  };
};
