import * as Comlink from "comlink";
import type { MeshData } from "../core/types";
import type { SolidSpec } from "../geometry/solid-spec";

export type WorkerApi = {
  init(): Promise<void>;
  buildFromSpec(spec: SolidSpec): Promise<{ stepBlob: Blob; mesh: MeshData }>;
};

let worker: Worker | null = null;
let api: Comlink.Remote<WorkerApi> | null = null;
let initPromise: Promise<void> | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("./design-engine.worker.ts", import.meta.url),
      { type: "module" },
    );
    api = Comlink.wrap<WorkerApi>(worker);
  }
  return worker;
}

export async function initGeometryWorker(): Promise<void> {
  if (initPromise) return initPromise;
  getWorker();
  initPromise = api!.init();
  return initPromise;
}

export async function buildSolidInWorker(
  spec: SolidSpec,
): Promise<{ stepBlob: Blob; mesh: MeshData }> {
  await initGeometryWorker();
  return api!.buildFromSpec(spec);
}

export function isGeometryWorkerReady(): boolean {
  return initPromise !== null;
}
