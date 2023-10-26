import IntersectionReading from "./intersectionReading";

export default interface SensorReading extends IntersectionReading {
  detectedEntity: "WALL" | "PLAYER";
}
