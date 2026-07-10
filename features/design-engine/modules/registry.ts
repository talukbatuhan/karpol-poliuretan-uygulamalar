import type { DesignModule } from "../core/types";
import { grindingRubberModule } from "./grinding-rubber";

export type ModuleId = "grinding-rubber";

export const designModules: Record<ModuleId, DesignModule> = {
  "grinding-rubber": grindingRubberModule,
};

export function getDesignModule(id: string): DesignModule | undefined {
  return designModules[id as ModuleId];
}

export const activeModuleIds = Object.entries(designModules)
  .filter(([, m]) => m.status === "active")
  .map(([id]) => id);

export { grindingRubberModule };
