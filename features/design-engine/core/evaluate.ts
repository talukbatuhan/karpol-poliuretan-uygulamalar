import type { DesignModel, DesignModule } from "./types";

/**
 * Full parametric evaluation pipeline: derive → validate → profiles → solid spec.
 */
export function evaluateDesign<
  TPrimary extends Record<string, unknown>,
  TDerived extends Record<string, unknown>,
>(
  module: DesignModule<TPrimary, TDerived>,
  primary: TPrimary,
): DesignModel<TPrimary, TDerived> {
  const derived = module.computeDerived(primary);
  const issues = module.validate(primary, derived);
  const valid = issues.length === 0;

  const views = valid ? module.buildProfiles(primary, derived) : [];
  const solidSpec = valid ? module.buildSolidSpec(primary, derived) : null;

  return {
    moduleId: module.id,
    primary,
    derived,
    valid,
    issues,
    views,
    solidSpec,
    evaluatedAt: Date.now(),
  };
}
