"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DesignModel } from "@/features/design-engine/core";
import { evaluateDesign } from "@/features/design-engine/core";
import type { DesignModule } from "@/features/design-engine/core/types";
import type { MeshData } from "@/features/design-engine/core/types";

export function useDesignStudio<TPrimary extends Record<string, unknown>>(
  module: DesignModule<TPrimary>,
  initialPrimary?: TPrimary,
) {
  const [primary, setPrimary] = useState<TPrimary>(
    () => initialPrimary ?? (module.schema.defaults as TPrimary),
  );
  const [mesh, setMesh] = useState<MeshData | null>(null);
  const [stepBlob, setStepBlob] = useState<Blob | null>(null);
  const [building3d, setBuilding3d] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);

  const model: DesignModel<TPrimary> = useMemo(
    () => evaluateDesign(module, primary),
    [module, primary],
  );

  const updateParam = useCallback(
    (id: string, value: number | string) => {
      setPrimary((prev) => ({ ...prev, [id]: value }));
    },
    [],
  );

  useEffect(() => {
    if (!model.valid || !model.solidSpec) {
      setMesh(null);
      setStepBlob(null);
      return;
    }

    let cancelled = false;
    setBuilding3d(true);
    setWorkerError(null);

    import("@/features/design-engine/worker/worker-client")
      .then(({ initGeometryWorker, buildSolidInWorker }) =>
        initGeometryWorker().then(() => buildSolidInWorker(model.solidSpec!)),
      )
      .then((result) => {
        if (!cancelled) {
          setMesh(result.mesh);
          setStepBlob(result.stepBlob);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setWorkerError(err instanceof Error ? err.message : String(err));
          setMesh(null);
          setStepBlob(null);
        }
      })
      .finally(() => {
        if (!cancelled) setBuilding3d(false);
      });

    return () => {
      cancelled = true;
    };
  }, [model.valid, model.solidSpec, model.evaluatedAt]);

  return {
    primary,
    model,
    updateParam,
    mesh,
    stepBlob,
    building3d,
    workerError,
  };
}
