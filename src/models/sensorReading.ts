export default interface SensorReading {
  x: number;
  y: number;
  offset: number;
  detectedEntity: "WALL" | "PLAYER";
}
