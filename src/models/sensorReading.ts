import IntersectionReading from "./IntersectionReading";

export default interface SensorReading extends IntersectionReading {
  detectedEntity: "WALL" | "PLAYER";
}
