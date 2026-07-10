import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(
  root,
  "..",
  "node_modules",
  "replicad-opencascadejs",
  "src",
  "replicad_single.wasm",
);
const destDir = path.join(root, "..", "public", "wasm");
const dest = path.join(destDir, "replicad_single.wasm");

if (!fs.existsSync(src)) {
  console.warn("replicad_single.wasm not found — skip copy (run npm install)");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("Copied replicad wasm to public/wasm/replicad_single.wasm");
