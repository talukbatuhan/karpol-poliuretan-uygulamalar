"use client";

import dynamic from "next/dynamic";
import { ToolSkeleton } from "@/components/tools/ToolSkeleton";
import type { DesignStudioLabels } from "./DesignStudioShell";

const DesignStudioShell = dynamic(
  () =>
    import("./DesignStudioShell").then((m) => ({
      default: m.DesignStudioShell,
    })),
  { ssr: false, loading: () => <ToolSkeleton /> },
);

export function DesignStudioLoader({
  moduleId,
  labels,
  drawingTitle,
}: {
  moduleId: string;
  labels: DesignStudioLabels;
  drawingTitle?: string;
}) {
  return (
    <DesignStudioShell
      moduleId={moduleId}
      labels={labels}
      drawingTitle={drawingTitle}
    />
  );
}
