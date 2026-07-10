import * as Comlink from "comlink";
import { buildSolidFromSpec } from "../geometry/replicad-builder";
import type { SolidSpec } from "../geometry/solid-spec";

const api = {
  async init() {
    await buildSolidFromSpec({
      kind: "cylinder",
      radius: 1,
      height: 1,
    }).catch(() => {
      /* warm-up may fail on first wasm load; retry on real build */
    });
  },

  async buildFromSpec(spec: SolidSpec) {
    return buildSolidFromSpec(spec);
  },
};

Comlink.expose(api);
