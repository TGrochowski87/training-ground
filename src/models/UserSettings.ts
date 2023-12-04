export type Mode = "movement" | "full";
export type Method = "conventional" | "NEAT";

export interface UserSettings {
  mode: Mode;
  method: Method;
}
