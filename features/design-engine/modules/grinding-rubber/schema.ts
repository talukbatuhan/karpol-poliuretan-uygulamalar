import type { ParameterSchema } from "../../core/types";

export type GrindingRubberPrimary = {
  disCap: number;
  merkezCapi: number;
  icCap: number;
  delikCapi: number;
  delikAdeti: number;
  kalinlik: number;
  shoreSertlik: number;
  color: string;
  marka: string;
};

export type GrindingRubberDerived = {
  outerRadius: number;
  innerRadius: number;
  pcdRadius: number;
  holeRadius: number;
  holeAngles: number[];
};

export const grindingRubberDefaults: GrindingRubberPrimary = {
  disCap: 200,
  merkezCapi: 140,
  icCap: 50,
  delikCapi: 12,
  delikAdeti: 6,
  kalinlik: 30,
  shoreSertlik: 60,
  color: "#1e3a5f",
  marka: "KARPOL",
};

export const grindingRubberSchema: ParameterSchema<GrindingRubberPrimary> = {
  moduleId: "grinding-rubber",
  defaults: grindingRubberDefaults,
  parameters: [
    { id: "disCap", labelKey: "disCap", role: "primary", type: "number", unit: "mm", min: 10, max: 2000, step: 1, defaultValue: 200, group: "dimensions" },
    { id: "merkezCapi", labelKey: "merkezCapi", role: "primary", type: "number", unit: "mm", min: 5, max: 1900, step: 1, defaultValue: 140, group: "dimensions" },
    { id: "icCap", labelKey: "icCap", role: "primary", type: "number", unit: "mm", min: 5, max: 1800, step: 1, defaultValue: 50, group: "dimensions" },
    { id: "delikCapi", labelKey: "delikCapi", role: "primary", type: "number", unit: "mm", min: 1, max: 100, step: 0.5, defaultValue: 12, group: "holes" },
    { id: "delikAdeti", labelKey: "delikAdeti", role: "primary", type: "integer", unit: "", min: 1, max: 24, step: 1, defaultValue: 6, group: "holes" },
    { id: "kalinlik", labelKey: "kalinlik", role: "primary", type: "number", unit: "mm", min: 1, max: 200, step: 0.5, defaultValue: 30, group: "dimensions" },
    { id: "shoreSertlik", labelKey: "shoreSertlik", role: "primary", type: "number", unit: "shore", min: 20, max: 95, step: 1, defaultValue: 60, group: "material" },
    { id: "color", labelKey: "color", role: "primary", type: "color", unit: "", defaultValue: "#1e3a5f", group: "material" },
    { id: "marka", labelKey: "marka", role: "primary", type: "string", unit: "", defaultValue: "KARPOL", group: "meta" },
  ],
};
