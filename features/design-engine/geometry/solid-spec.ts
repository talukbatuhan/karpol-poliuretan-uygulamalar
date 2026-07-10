import type { ProfilePoint } from "./profile2d";

export type RevolveSolidSpec = {
  kind: "revolve";
  profile: ProfilePoint[];
  axis: "x" | "y" | "z";
  angle?: number;
};

export type ExtrudeSolidSpec = {
  kind: "extrude";
  /** Closed profile in XY plane */
  profile: ProfilePoint[];
  distance: number;
};

export type CylinderSolidSpec = {
  kind: "cylinder";
  radius: number;
  innerRadius?: number;
  height: number;
  /** Holes cut along Z axis */
  holes?: { x: number; y: number; radius: number }[];
};

export type CompoundSolidSpec = {
  kind: "compound";
  parts: SolidSpec[];
};

export type SolidSpec =
  | RevolveSolidSpec
  | ExtrudeSolidSpec
  | CylinderSolidSpec
  | CompoundSolidSpec;
