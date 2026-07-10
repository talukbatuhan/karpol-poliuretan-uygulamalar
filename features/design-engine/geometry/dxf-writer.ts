import type { Profile2D } from "./profile2d";
import { flattenProfile } from "./profile2d";

function fmt(n: number): string {
  return n.toFixed(4).replace(/\.?0+$/, "");
}

/**
 * Minimal DXF R12 writer for 2D profile polylines.
 */
export function profilesToDxf(profiles: Profile2D[], layer = "PROFILE"): string {
  const lines: string[] = [
    "0",
    "SECTION",
    "2",
    "HEADER",
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "TABLES",
    "0",
    "TABLE",
    "2",
    "LAYER",
    "70",
    "1",
    "0",
    "LAYER",
    "2",
    layer,
    "70",
    "0",
    "62",
    "7",
    "6",
    "CONTINUOUS",
    "0",
    "ENDTAB",
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "ENTITIES",
  ];

  for (const profile of profiles) {
    const pts = flattenProfile(profile);
    if (pts.length < 2) continue;

    lines.push(
      "0",
      "POLYLINE",
      "8",
      layer,
      "66",
      "1",
      "70",
      profile.closed ? "1" : "0",
    );

    for (const p of pts) {
      lines.push("0", "VERTEX", "8", layer, "10", fmt(p.x), "20", fmt(p.y));
    }

    lines.push("0", "SEQEND");
  }

  lines.push("0", "ENDSEC", "0", "EOF");
  return lines.join("\n");
}

export function downloadDxf(profiles: Profile2D[], filename: string): void {
  const content = profilesToDxf(profiles);
  const blob = new Blob([content], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
