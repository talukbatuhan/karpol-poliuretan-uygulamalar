"use client";

import { useEffect, useRef } from "react";
import type { DrawingView } from "@/features/design-engine/core/types";
import { renderTechnicalDrawing } from "@/features/design-engine/render/technical-drawing-renderer";

type TechnicalDrawingViewProps = {
  view: DrawingView | null;
  title?: string;
  className?: string;
};

export function TechnicalDrawingView({
  view,
  title,
  className = "",
}: TechnicalDrawingViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !view) return;

    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 1 || h < 1) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderTechnicalDrawing(ctx, view, {
        width: w,
        height: h,
        title,
        showGrid: true,
      });
    };

    paint();

    const observer = new ResizeObserver(() => paint());
    observer.observe(container);
    return () => observer.disconnect();
  }, [view, title]);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-0 flex-1 bg-white ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {!view && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-navy-800/60">
          —
        </div>
      )}
    </div>
  );
}

export function getCanvasFromRef(
  container: HTMLDivElement | null,
): HTMLCanvasElement | null {
  return container?.querySelector("canvas") ?? null;
}
