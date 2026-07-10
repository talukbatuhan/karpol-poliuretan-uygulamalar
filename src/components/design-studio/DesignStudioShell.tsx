"use client";

import { useMemo } from "react";
import { getDesignModule } from "@/features/design-engine/modules/registry";
import { useDesignStudio } from "@/hooks/useDesignStudio";
import { ExportToolbar } from "./ExportToolbar";
import { ParameterPanel } from "./ParameterPanel";
import { TechnicalDrawingView } from "./TechnicalDrawingView";
import { Viewport3D } from "./Viewport3D";

export type DesignStudioLabels = {
  panelTitle: string;
  derivedTitle: string;
  view2d: string;
  view3d: string;
  params: Record<string, string>;
  derived: Record<string, string>;
  groups: Record<string, string>;
  errors: Record<string, string>;
  export: {
    exportPng: string;
    exportPdf: string;
    exportStep: string;
    exportDxf: string;
    exportBlocked: string;
  };
  workerError: string;
};

type DesignStudioShellProps = {
  moduleId: string;
  labels: DesignStudioLabels;
  drawingTitle?: string;
};

const CANVAS_ID = "design-studio-canvas";

export function DesignStudioShell({
  moduleId,
  labels,
  drawingTitle,
}: DesignStudioShellProps) {
  const module = useMemo(() => getDesignModule(moduleId), [moduleId]);

  if (!module || module.status !== "active") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-navy-800">
        Module not found: {moduleId}
      </div>
    );
  }

  return (
    <DesignStudioContent
      module={module}
      labels={labels}
      drawingTitle={drawingTitle}
    />
  );
}

function DesignStudioContent({
  module,
  labels,
  drawingTitle,
}: {
  module: NonNullable<ReturnType<typeof getDesignModule>>;
  labels: DesignStudioLabels;
  drawingTitle?: string;
}) {
  const { model, updateParam, mesh, stepBlob, building3d, workerError } =
    useDesignStudio(module);

  const derivedDefs = module.getDerivedParamDefs(model.derived);
  const view = model.views[0] ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-full max-w-xs shrink-0 lg:max-w-sm">
          <ParameterPanel
            module={module}
            primary={model.primary}
            derivedDefs={derivedDefs}
            issues={model.issues}
            onChange={updateParam}
            labels={labels.params}
            panelTitle={labels.panelTitle}
            derivedTitle={labels.derivedTitle}
            derivedLabels={labels.derived}
            groupLabels={labels.groups}
            errorLabels={labels.errors}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
            <div
              id={CANVAS_ID}
              className="flex min-h-0 flex-col border-b border-navy-800 lg:border-b-0 lg:border-r"
            >
              <div className="border-b border-navy-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-navy-800">
                {labels.view2d}
              </div>
              <TechnicalDrawingView view={view} title={drawingTitle} />
            </div>
            <div className="flex min-h-0 flex-col">
              <div className="border-b border-navy-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-navy-800">
                {labels.view3d}
              </div>
              <Viewport3D mesh={mesh} loading={building3d} />
            </div>
          </div>

          {workerError && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">
              {labels.workerError}: {workerError}
            </div>
          )}

          <ExportToolbar
            valid={model.valid}
            stepBlob={stepBlob}
            views={model.views}
            canvasContainerId={CANVAS_ID}
            labels={labels.export}
            filenameBase={module.id}
          />
        </div>
      </div>
    </div>
  );
}
