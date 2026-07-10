import { draw, drawCircle, setOC } from "replicad";
import type { OpenCascadeInstance } from "replicad-opencascadejs";
import type { MeshData } from "../core/types";
import type { SolidSpec } from "./solid-spec";

let ocReady = false;

const WASM_PUBLIC_PATH = "/wasm/replicad_single.wasm";

async function loadWasmBinary(): Promise<ArrayBuffer> {
  const origin =
    typeof self !== "undefined" && "location" in self
      ? self.location.origin
      : "";
  const url = `${origin}${WASM_PUBLIC_PATH}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `OpenCascade WASM not found at ${url} (${response.status}). Run: node scripts/copy-replicad-wasm.mjs`,
    );
  }
  return response.arrayBuffer();
}

async function ensureOc(): Promise<void> {
  if (ocReady) return;
  const opencascade = (await import(
    "replicad-opencascadejs/src/replicad_single.js"
  )).default as unknown as (opts: {
    wasmBinary: ArrayBuffer;
  }) => Promise<OpenCascadeInstance>;
  const wasmBinary = await loadWasmBinary();
  const OC = await opencascade({ wasmBinary });
  setOC(OC);
  ocReady = true;
}

function profileToSketch(profile: { x: number; y: number }[]) {
  if (profile.length < 3) throw new Error("Profile needs at least 3 points");
  let pen = draw([profile[0].x, profile[0].y]);
  for (let i = 1; i < profile.length; i++) {
    pen = pen.lineTo([profile[i].x, profile[i].y]);
  }
  return pen.close().sketchOnPlane("XZ");
}

function meshFromShape(shape: {
  mesh: (opts?: { tolerance?: number; angularTolerance?: number }) => {
    vertices: number[] | number[][];
    triangles: number[] | number[][];
    normals?: number[] | number[][];
  };
}): MeshData {
  const m = shape.mesh({ tolerance: 0.15, angularTolerance: 0.2 });

  const positions = new Float32Array(
    Array.isArray(m.vertices[0])
      ? (m.vertices as number[][]).flat()
      : (m.vertices as number[]),
  );

  const rawNormals = m.normals;
  const normals = new Float32Array(
    rawNormals
      ? Array.isArray(rawNormals[0])
        ? (rawNormals as number[][]).flat()
        : (rawNormals as number[])
      : positions.map((_, i) => (i % 3 === 1 ? 1 : 0)),
  );

  const indices = new Uint32Array(
    Array.isArray(m.triangles[0])
      ? (m.triangles as number[][]).flatMap(([a, b, c]) => [a, b, c])
      : (m.triangles as number[]),
  );

  return { positions, normals, indices };
}

type Shape3D = {
  blobSTEP: () => Blob;
  mesh: (opts?: { tolerance?: number; angularTolerance?: number }) => {
    vertices: number[][];
    triangles: number[][];
    normals?: number[][];
  };
  fuse: (other: Shape3D) => Shape3D;
  cut: (other: Shape3D) => Shape3D;
};

function asShape3D(shape: unknown): Shape3D {
  return shape as Shape3D;
}

export async function buildSolidFromSpec(spec: SolidSpec): Promise<{
  stepBlob: Blob;
  mesh: MeshData;
}> {
  await ensureOc();

  let shape: Shape3D;

  switch (spec.kind) {
    case "revolve": {
      const sketch = profileToSketch(spec.profile);
      const axis =
        spec.axis === "x"
          ? ([1, 0, 0] as [number, number, number])
          : spec.axis === "y"
            ? ([0, 1, 0] as [number, number, number])
            : ([0, 0, 1] as [number, number, number]);
      shape = asShape3D(sketch.revolve(axis, { angle: spec.angle ?? 360 }));
      break;
    }
    case "extrude": {
      let pen = draw([spec.profile[0].x, spec.profile[0].y]);
      for (let i = 1; i < spec.profile.length; i++) {
        pen = pen.lineTo([spec.profile[i].x, spec.profile[i].y]);
      }
      shape = asShape3D(
        pen.close().sketchOnPlane("XY").extrude(spec.distance),
      );
      break;
    }
    case "cylinder": {
      shape = asShape3D(
        drawCircle(spec.radius).sketchOnPlane("XY").extrude(spec.height),
      );
      if (spec.innerRadius && spec.innerRadius > 0) {
        const innerCut = asShape3D(
          drawCircle(spec.innerRadius)
            .sketchOnPlane("XY")
            .extrude(spec.height + 2),
        );
        shape = shape.cut(innerCut);
      }
      if (spec.holes?.length) {
        for (const hole of spec.holes) {
          const cutter = asShape3D(
            drawCircle(hole.radius)
              .sketchOnPlane("XY", [hole.x, hole.y, 0])
              .extrude(spec.height + 2),
          );
          shape = shape.cut(cutter);
        }
      }
      break;
    }
    case "compound": {
      let combined: Shape3D | null = null;
      for (const part of spec.parts) {
        const built = await buildSolidFromSpec(part);
        const partShape = await buildShapeOnly(part);
        combined = combined ? combined.fuse(partShape) : partShape;
      }
      shape = combined!;
      break;
    }
    default:
      throw new Error(`Unknown solid spec`);
  }

  return {
    stepBlob: shape.blobSTEP(),
    mesh: meshFromShape(shape),
  };
}

async function buildShapeOnly(spec: SolidSpec): Promise<Shape3D> {
  const result = await buildSolidFromSpec(spec);
  void result;
  await ensureOc();
  switch (spec.kind) {
    case "revolve": {
      const sketch = profileToSketch(spec.profile);
      return asShape3D(sketch.revolve([1, 0, 0], { angle: spec.angle ?? 360 }));
    }
    case "extrude": {
      let pen = draw([spec.profile[0].x, spec.profile[0].y]);
      for (let i = 1; i < spec.profile.length; i++) {
        pen = pen.lineTo([spec.profile[i].x, spec.profile[i].y]);
      }
      return asShape3D(
        pen.close().sketchOnPlane("XY").extrude(spec.distance),
      );
    }
    case "cylinder": {
      let s = asShape3D(
        drawCircle(spec.radius).sketchOnPlane("XY").extrude(spec.height),
      );
      if (spec.innerRadius && spec.innerRadius > 0) {
        const innerCut = asShape3D(
          drawCircle(spec.innerRadius)
            .sketchOnPlane("XY")
            .extrude(spec.height + 2),
        );
        s = s.cut(innerCut);
      }
      if (spec.holes?.length) {
        for (const hole of spec.holes) {
          const cutter = asShape3D(
            drawCircle(hole.radius)
              .sketchOnPlane("XY", [hole.x, hole.y, 0])
              .extrude(spec.height + 2),
          );
          s = s.cut(cutter);
        }
      }
      return s;
    }
    default:
      throw new Error("compound nested in compound not supported");
  }
}
