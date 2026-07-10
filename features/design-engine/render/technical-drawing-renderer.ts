import type { DrawingView, DimensionAnnotation } from "../core/types";
import type { Profile2D } from "../geometry/profile2d";
import { viewsBounds } from "../geometry/profile2d";
import { drawArrow, drawCadGrid } from "./cad-grid";

export type RenderOptions = {
  width: number;
  height: number;
  title?: string;
  showGrid?: boolean;
  padding?: number;
  activeDimId?: string | null;
};

const ACCENT = "#0284c7";
const DIM_INACTIVE = "#64748b";
const SHEET_BG = "#ffffff";

function strokeProfile(
  ctx: CanvasRenderingContext2D,
  profile: Profile2D,
  scale: number,
  ox: number,
  oy: number,
): void {
  const pts = profile.points;
  if (pts.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(ox + pts[0].x * scale, oy - pts[0].y * scale);

  for (const seg of profile.segments) {
    if (seg.kind === "line") {
      ctx.lineTo(ox + seg.to.x * scale, oy - seg.to.y * scale);
    } else if (seg.kind === "arc") {
      const last = seg.to;
      ctx.lineTo(ox + last.x * scale, oy - last.y * scale);
    } else if (seg.kind === "close") {
      ctx.closePath();
    }
  }

  if (profile.closed) ctx.closePath();

  if (profile.fill) {
    ctx.fillStyle = profile.fill;
    ctx.fill();
  }
  ctx.strokeStyle = profile.stroke ?? "#1e293b";
  ctx.lineWidth = profile.lineWidth ?? 1.25;
  ctx.stroke();
}

function drawDimension(
  ctx: CanvasRenderingContext2D,
  dim: DimensionAnnotation,
  scale: number,
  ox: number,
  oy: number,
  active: boolean,
): void {
  const color = active ? ACCENT : DIM_INACTIVE;
  const fx = ox + dim.from.x * scale;
  const fy = oy - dim.from.y * scale;
  const tx = ox + dim.to.x * scale;
  const ty = oy - dim.to.y * scale;
  const mx = (fx + tx) / 2 + dim.offset.x;
  const my = (fy + ty) / 2 + dim.offset.y;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = active ? 2.2 : 1.15;
  drawArrow(ctx, fx, fy, tx, ty, 5);

  const text = `${dim.value.toFixed(1)} mm`;
  ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = "rgba(255,255,255,0.93)";
  ctx.fillRect(mx - tw / 2 - 4, my - 8, tw + 8, 16);
  ctx.fillStyle = color;
  ctx.fillText(text, mx, my);
  ctx.restore();
}

export function renderTechnicalDrawing(
  ctx: CanvasRenderingContext2D,
  view: DrawingView,
  options: RenderOptions,
): void {
  const {
    width,
    height,
    title,
    showGrid = true,
    padding = 40,
    activeDimId,
  } = options;
  const TITLE_H = title ? 50 : 0;

  ctx.fillStyle = SHEET_BG;
  ctx.fillRect(0, 0, width, height);

  if (title) {
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(title, 16, TITLE_H / 2);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, TITLE_H - 1, width, 2);
  }

  const drawH = height - TITLE_H;
  if (showGrid) drawCadGrid(ctx, TITLE_H, drawH, width);

  const bounds = view.bounds;
  const bw = bounds.maxX - bounds.minX || 1;
  const bh = bounds.maxY - bounds.minY || 1;
  const maxScale = Math.min(
    (width - padding * 2) / bw,
    (drawH - padding * 2) / bh,
  );
  const scale = Math.max(0.1, Math.min(maxScale, 4));
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const ox = width / 2 - cx * scale;
  const oy = TITLE_H + drawH / 2 + cy * scale;

  for (const profile of view.profiles) {
    strokeProfile(ctx, profile, scale, ox, oy);
  }

  for (const dim of view.annotations) {
    drawDimension(ctx, dim, scale, ox, oy, dim.id === activeDimId);
  }

  if (view.regionLabels?.length) {
    ctx.save();
    ctx.fillStyle = "#64748b";
    ctx.font = "500 9px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const region of view.regionLabels) {
      ctx.fillText(
        region.label,
        ox + region.x * scale,
        oy - region.y * scale,
      );
    }
    ctx.restore();
  }
}

export function renderAllViews(
  ctx: CanvasRenderingContext2D,
  views: DrawingView[],
  options: RenderOptions,
): void {
  if (views.length === 0) {
    ctx.fillStyle = SHEET_BG;
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("—", options.width / 2, options.height / 2);
    return;
  }
  renderTechnicalDrawing(ctx, views[0], options);
}

export function computeViewBoundsFromProfiles(profiles: Profile2D[]) {
  return viewsBounds(profiles);
}
