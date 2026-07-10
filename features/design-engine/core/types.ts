import type { Profile2D } from "../geometry/profile2d";
import type { SolidSpec } from "../geometry/solid-spec";

export type ParamRole = "primary" | "derived";

export type ParamType = "number" | "integer" | "enum" | "string" | "color";

export type ParamDef = {
  id: string;
  labelKey: string;
  role: ParamRole;
  type: ParamType;
  unit?: "mm" | "deg" | "shore" | "";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; labelKey: string }[];
  defaultValue: number | string;
  group?: string;
  visibleWhen?: (primary: Record<string, unknown>) => boolean;
};

export type ParameterSchema<TPrimary extends Record<string, unknown>> = {
  moduleId: string;
  parameters: ParamDef[];
  defaults: TPrimary;
};

export type ValidationIssue = {
  paramId?: string;
  code: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
};

export type DimensionAnnotation = {
  id: string;
  value: number;
  labelKey?: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  offset: { x: number; y: number };
  orientation: "horizontal" | "vertical" | "aligned";
  unit?: "mm";
};

export type DrawingView = {
  id: string;
  titleKey: string;
  profiles: Profile2D[];
  annotations: DimensionAnnotation[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  regionLabels?: { label: string; x: number; y: number }[];
};

export type DesignModel<
  TPrimary extends Record<string, unknown> = Record<string, unknown>,
  TDerived extends Record<string, unknown> = Record<string, unknown>,
> = {
  moduleId: string;
  primary: TPrimary;
  derived: TDerived;
  valid: boolean;
  issues: ValidationIssue[];
  views: DrawingView[];
  solidSpec: SolidSpec | null;
  evaluatedAt: number;
};

export type GeometryKernel = {
  buildFromSpec(spec: SolidSpec): Promise<SolidResult>;
};

export type MeshData = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
};

export type SolidResult = {
  stepBlob: Blob;
  mesh: MeshData;
};

/**
 * Plugin contract for every parametric product family.
 * Geometry is always regenerated from primary inputs via computeDerived → buildProfiles/buildSolidSpec.
 */
export interface DesignModule<
  TPrimary extends Record<string, unknown> = Record<string, unknown>,
  TDerived extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  status: "active" | "planned";
  schema: ParameterSchema<TPrimary>;
  computeDerived(primary: TPrimary): TDerived;
  validate(primary: TPrimary, derived: TDerived): ValidationIssue[];
  buildProfiles(primary: TPrimary, derived: TDerived): DrawingView[];
  buildSolidSpec(primary: TPrimary, derived: TDerived): SolidSpec | null;
  getDerivedParamDefs(derived: TDerived): { id: string; value: number | string }[];
}
