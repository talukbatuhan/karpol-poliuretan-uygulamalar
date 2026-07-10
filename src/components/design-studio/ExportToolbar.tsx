"use client";

import type { DrawingView } from "@/features/design-engine/core/types";
import { profilesToDxf } from "@/features/design-engine/geometry/dxf-writer";

type ExportToolbarProps = {
  valid: boolean;
  stepBlob: Blob | null;
  views: DrawingView[];
  canvasContainerId: string;
  labels: {
    exportPng: string;
    exportPdf: string;
    exportStep: string;
    exportDxf: string;
    exportBlocked: string;
  };
  filenameBase: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportToolbar({
  valid,
  stepBlob,
  views,
  canvasContainerId,
  labels,
  filenameBase,
}: ExportToolbarProps) {
  const profiles = views.flatMap((v) => v.profiles);

  const exportPng = () => {
    const container = document.getElementById(canvasContainerId);
    const canvas = container?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}.png`;
    a.click();
  };

  const exportPdf = () => {
    const container = document.getElementById(canvasContainerId);
    const canvas = container?.querySelector("canvas");
    if (!canvas) return;
    const w = window.open("");
    if (!w) return;
    w.document.write(
      `<html><head><title>${filenameBase}</title></head><body style="margin:0"><img src="${canvas.toDataURL("image/png")}" style="width:100%"/></body></html>`,
    );
    w.document.close();
    w.print();
  };

  const exportStep = () => {
    if (stepBlob) downloadBlob(stepBlob, `${filenameBase}.step`);
  };

  const exportDxf = () => {
    const dxf = profilesToDxf(profiles);
    downloadBlob(new Blob([dxf], { type: "application/dxf" }), `${filenameBase}.dxf`);
  };

  const btnClass =
    "border border-navy-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-navy-950 transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-navy-800 bg-ivory-50 px-4 py-2">
      {!valid && (
        <span className="font-sans text-xs text-red-700">{labels.exportBlocked}</span>
      )}
      <button type="button" className={btnClass} disabled={!valid} onClick={exportPng}>
        {labels.exportPng}
      </button>
      <button type="button" className={btnClass} disabled={!valid} onClick={exportPdf}>
        {labels.exportPdf}
      </button>
      <button
        type="button"
        className={btnClass}
        disabled={!valid || !stepBlob}
        onClick={exportStep}
      >
        {labels.exportStep}
      </button>
      <button type="button" className={btnClass} disabled={!valid} onClick={exportDxf}>
        {labels.exportDxf}
      </button>
    </div>
  );
}
