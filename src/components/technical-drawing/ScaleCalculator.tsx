"use client";

import { useMemo, useState } from "react";

import { SharpField, sharpInputClassName } from "@/components/form/SharpField";

const PRESET_SCALES = ["1:1", "1:2", "1:5", "1:10", "1:20", "1:50", "1:100"];

function parseScale(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed.includes(":")) {
    const [left, right] = trimmed.split(":");
    const a = Number.parseFloat(left);
    const b = Number.parseFloat(right);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b;
  }

  const numeric = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function ScaleCalculator() {
  const [realValue, setRealValue] = useState("100");
  const [scale, setScale] = useState("1:10");
  const [mode, setMode] = useState<"real-to-drawing" | "drawing-to-real">(
    "real-to-drawing",
  );

  const result = useMemo(() => {
    const value = Number.parseFloat(realValue.replace(",", "."));
    const ratio = parseScale(scale);

    if (!Number.isFinite(value) || ratio === null) return null;

    return mode === "real-to-drawing" ? value * ratio : value / ratio;
  }, [realValue, scale, mode]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("real-to-drawing")}
          className={`border px-3 py-2 text-xs font-medium uppercase tracking-wide ${
            mode === "real-to-drawing"
              ? "border-black bg-navy text-white"
              : "border-black bg-white text-charcoal hover:bg-slate-50"
          }`}
        >
          Gerçek → Çizim
        </button>
        <button
          type="button"
          onClick={() => setMode("drawing-to-real")}
          className={`border px-3 py-2 text-xs font-medium uppercase tracking-wide ${
            mode === "drawing-to-real"
              ? "border-black bg-navy text-white"
              : "border-black bg-white text-charcoal hover:bg-slate-50"
          }`}
        >
          Çizim → Gerçek
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SharpField
          label={mode === "real-to-drawing" ? "Gerçek Ölçü (mm)" : "Çizim Ölçüsü (mm)"}
          htmlFor="scale-value"
        >
          <input
            id="scale-value"
            type="text"
            inputMode="decimal"
            value={realValue}
            onChange={(e) => setRealValue(e.target.value)}
            className={sharpInputClassName}
          />
        </SharpField>

        <SharpField label="Ölçek" htmlFor="scale-ratio">
          <input
            id="scale-ratio"
            type="text"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            placeholder="1:10"
            className={sharpInputClassName}
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {PRESET_SCALES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setScale(preset)}
                className="border border-slate-300 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-600 hover:border-black hover:text-charcoal"
              >
                {preset}
              </button>
            ))}
          </div>
        </SharpField>
      </div>

      <div className="border-l-4 border-navy bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Sonuç
        </p>
        <p className="mt-1 text-lg font-semibold text-charcoal">
          {result !== null
            ? `${result.toLocaleString("tr-TR", { maximumFractionDigits: 4 })} mm`
            : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {mode === "real-to-drawing"
            ? "Çizimde görünecek uzunluk"
            : "Gerçek parça uzunluğu"}
        </p>
      </div>
    </div>
  );
}
