import type { DrawingView, DimensionAnnotation } from "../../core/types";
import type { Profile2D } from "../../geometry/profile2d";
import { viewsBounds } from "../../geometry/profile2d";
import type { SolidSpec } from "../../geometry/solid-spec";
import type { GrindingRubberDerived, GrindingRubberPrimary } from "./schema";

function circleProfile(
  id: string,
  cx: number,
  cy: number,
  r: number,
  opts: Partial<Profile2D> = {},
): Profile2D {
  const segs = 48;
  const points = [{ x: cx + r, y: cy }];
  const segments: Profile2D["segments"] = [];
  for (let i = 1; i <= segs; i++) {
    const a = (i / segs) * 2 * Math.PI;
    segments.push({ kind: "line", to: { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) } });
  }
  segments.push({ kind: "close" });
  return { id, closed: true, points, segments, ...opts };
}

export function buildGrindingRubberProfiles(
  primary: GrindingRubberPrimary,
  derived: GrindingRubberDerived,
): DrawingView[] {
  const { outerRadius, innerRadius, pcdRadius, holeRadius, holeAngles } =
    derived;
  const cx = outerRadius + 10;

  const topViewProfiles: Profile2D[] = [
    circleProfile("od", cx, cx, outerRadius, {
      fill: primary.color,
      stroke: "#1e293b",
      layer: "rubber",
    }),
    circleProfile("id", cx, cx, innerRadius, {
      fill: "#ffffff",
      stroke: "#1e293b",
      layer: "hole",
    }),
    circleProfile("pcd", cx, cx, pcdRadius, {
      stroke: "rgba(2, 132, 199, 0.75)",
      lineWidth: 1,
      layer: "centerline",
    }),
  ];

  for (let i = 0; i < holeAngles.length; i++) {
    const hx = cx + pcdRadius * Math.cos(holeAngles[i]);
    const hy = cx + pcdRadius * Math.sin(holeAngles[i]);
    topViewProfiles.push(
      circleProfile(`hole-${i}`, hx, hy, holeRadius, {
        fill: "#e2e8f0",
        stroke: "#64748b",
        layer: "hole",
      }),
    );
  }

  const profileX = cx + outerRadius + 40;
  const elevation: Profile2D = {
    id: "elevation",
    closed: true,
    points: [
      { x: profileX, y: 0 },
      { x: profileX + primary.kalinlik, y: 0 },
      { x: profileX + primary.kalinlik, y: primary.disCap },
      { x: profileX, y: primary.disCap },
    ],
    segments: [{ kind: "close" }],
    fill: primary.color,
    stroke: "#1e293b",
    layer: "rubber",
  };

  const allProfiles = [...topViewProfiles, elevation];
  const bounds = viewsBounds(allProfiles);

  const annotations: DimensionAnnotation[] = [
    {
      id: "disCap",
      value: primary.disCap,
      from: { x: cx - outerRadius, y: cx + outerRadius + 5 },
      to: { x: cx + outerRadius, y: cx + outerRadius + 5 },
      offset: { x: 0, y: 14 },
      orientation: "horizontal",
    },
    {
      id: "kalinlik",
      value: primary.kalinlik,
      from: { x: profileX, y: primary.disCap + 8 },
      to: { x: profileX + primary.kalinlik, y: primary.disCap + 8 },
      offset: { x: 0, y: 12 },
      orientation: "horizontal",
    },
  ];

  return [
    {
      id: "plan-elevation",
      titleKey: "planElevation",
      profiles: allProfiles,
      annotations,
      bounds,
    },
  ];
}

export function buildGrindingRubberSolidSpec(
  primary: GrindingRubberPrimary,
  derived: GrindingRubberDerived,
): SolidSpec {
  const holes = derived.holeAngles.map((angle) => ({
    x: derived.pcdRadius * Math.cos(angle),
    y: derived.pcdRadius * Math.sin(angle),
    radius: derived.holeRadius,
  }));

  return {
    kind: "cylinder",
    radius: derived.outerRadius,
    innerRadius: derived.innerRadius,
    height: primary.kalinlik,
    holes,
  };
}
