import type { DesignModule, ValidationIssue } from "../../core/types";
import { computeGrindingRubberDerived } from "./compute";
import {
  buildGrindingRubberProfiles,
  buildGrindingRubberSolidSpec,
} from "./profiles";
import {
  grindingRubberDefaults,
  grindingRubberSchema,
  type GrindingRubberDerived,
  type GrindingRubberPrimary,
} from "./schema";

export const grindingRubberModule: DesignModule<
  GrindingRubberPrimary,
  GrindingRubberDerived
> = {
  id: "grinding-rubber",
  status: "active",
  schema: grindingRubberSchema,
  computeDerived: computeGrindingRubberDerived,
  validate(primary) {
    const issues: ValidationIssue[] = [];
    if (primary.icCap >= primary.disCap) {
      issues.push({ paramId: "icCap", code: "ic_ge_dis", messageKey: "errors.icGeDis" });
    }
    if (primary.merkezCapi >= primary.disCap) {
      issues.push({ paramId: "merkezCapi", code: "merkez_ge_dis", messageKey: "errors.merkezGeDis" });
    }
    if (primary.merkezCapi <= primary.icCap) {
      issues.push({ paramId: "merkezCapi", code: "merkez_le_ic", messageKey: "errors.merkezLeIc" });
    }
    if (primary.delikCapi >= primary.disCap - primary.merkezCapi) {
      issues.push({ paramId: "delikCapi", code: "delik_too_large", messageKey: "errors.delikTooLarge" });
    }
    return issues;
  },
  buildProfiles: buildGrindingRubberProfiles,
  buildSolidSpec: buildGrindingRubberSolidSpec,
  getDerivedParamDefs(derived) {
    return [
      { id: "outerRadius", value: derived.outerRadius },
      { id: "pcdRadius", value: derived.pcdRadius },
      { id: "holeCount", value: derived.holeAngles.length },
    ];
  },
};

export { grindingRubberDefaults };
