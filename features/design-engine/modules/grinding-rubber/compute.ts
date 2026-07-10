import type { GrindingRubberDerived, GrindingRubberPrimary } from "./schema";

export function computeGrindingRubberDerived(
  primary: GrindingRubberPrimary,
): GrindingRubberDerived {
  const outerRadius = primary.disCap / 2;
  const innerRadius = primary.icCap / 2;
  const pcdRadius = primary.merkezCapi / 2;
  const holeRadius = primary.delikCapi / 2;
  const holeAngles = Array.from(
    { length: primary.delikAdeti },
    (_, i) => (i * 2 * Math.PI) / primary.delikAdeti - Math.PI / 2,
  );
  return { outerRadius, innerRadius, pcdRadius, holeRadius, holeAngles };
}
