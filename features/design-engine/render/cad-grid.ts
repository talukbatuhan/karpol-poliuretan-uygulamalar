export function drawCadGrid(
  ctx: CanvasRenderingContext2D,
  y0: number,
  h: number,
  w: number,
): void {
  const step = 20;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y0, w, h);
  ctx.clip();
  for (let x = 0; x <= w; x += step) {
    ctx.strokeStyle =
      x % (step * 5) === 0
        ? "rgba(8, 145, 178, 0.09)"
        : "rgba(148, 163, 184, 0.05)";
    ctx.lineWidth = x % (step * 5) === 0 ? 0.6 : 0.35;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y0 + h);
    ctx.stroke();
  }
  for (let y = y0; y <= y0 + h; y += step) {
    const rel = y - y0;
    ctx.strokeStyle =
      rel % (step * 5) === 0
        ? "rgba(8, 145, 178, 0.09)"
        : "rgba(148, 163, 184, 0.05)";
    ctx.lineWidth = rel % (step * 5) === 0 ? 0.6 : 0.35;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size = 6,
): void {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - size * Math.cos(angle - 0.35),
    y2 - size * Math.sin(angle - 0.35),
  );
  ctx.lineTo(
    x2 - size * Math.cos(angle + 0.35),
    y2 - size * Math.sin(angle + 0.35),
  );
  ctx.closePath();
  ctx.fill();
}
