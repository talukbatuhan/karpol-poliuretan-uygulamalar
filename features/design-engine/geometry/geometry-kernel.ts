import type { MeshData, SolidResult } from "../core/types";
import type { SolidSpec } from "./solid-spec";

export type GeometryBuildResult = SolidResult;

export interface GeometryKernelClient {
  init(): Promise<void>;
  buildFromSpec(spec: SolidSpec): Promise<GeometryBuildResult>;
  isReady(): boolean;
}

export type { MeshData, SolidResult };
