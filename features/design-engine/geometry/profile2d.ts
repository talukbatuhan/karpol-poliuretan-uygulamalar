export type ProfilePoint = { x: number; y: number };

export type ProfileSegment =
  | { kind: "line"; to: ProfilePoint }
  | { kind: "arc"; to: ProfilePoint; radius: number; clockwise?: boolean }
  | { kind: "close" };

export type Profile2D = {
  id: string;
  closed: boolean;
  points: ProfilePoint[];
  segments: ProfileSegment[];
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  layer?: "rubber" | "metal" | "hole" | "centerline" | "dimension";
};

export function profileBounds(profile: Profile2D): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of profile.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  for (const seg of profile.segments) {
    if (seg.kind !== "close") {
      minX = Math.min(minX, seg.to.x);
      minY = Math.min(minY, seg.to.y);
      maxX = Math.max(maxX, seg.to.x);
      maxY = Math.max(maxY, seg.to.y);
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  }
  return { minX, minY, maxX, maxY };
}

export function viewsBounds(
  profiles: Profile2D[],
): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of profiles) {
    const b = profileBounds(p);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }
  return { minX, minY, maxX, maxY };
}

export function flattenProfile(profile: Profile2D): ProfilePoint[] {
  const out: ProfilePoint[] = [...profile.points];
  for (const seg of profile.segments) {
    if (seg.kind === "line" || seg.kind === "arc") {
      out.push(seg.to);
    }
  }
  return out;
}

export function offsetProfile(
  profile: Profile2D,
  dx: number,
  dy: number,
): Profile2D {
  const shift = (p: ProfilePoint) => ({ x: p.x + dx, y: p.y + dy });
  return {
    ...profile,
    points: profile.points.map(shift),
    segments: profile.segments.map((seg) => {
      if (seg.kind === "close") return seg;
      return { ...seg, to: shift(seg.to) };
    }),
  };
}
