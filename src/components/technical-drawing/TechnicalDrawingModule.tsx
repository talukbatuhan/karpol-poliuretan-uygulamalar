"use client";

import { useState } from "react";

import { AngleConverter } from "@/components/technical-drawing/AngleConverter";
import { ScaleCalculator } from "@/components/technical-drawing/ScaleCalculator";
import { UnitConverter } from "@/components/technical-drawing/UnitConverter";

const TOOLS = [
  { id: "scale", label: "Ölçek Hesaplama" },
  { id: "unit", label: "Birim Dönüştürücü" },
  { id: "angle", label: "Açı Dönüştürücü" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function TechnicalDrawingModule() {
  const [activeTool, setActiveTool] = useState<ToolId>("scale");

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
        Teknik resim çalışmalarında sık kullanılan ölçek, birim ve açı
        dönüşümlerini hızlıca hesaplayın.
      </p>

      <div className="flex flex-wrap gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTool(tool.id)}
            className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeTool === tool.id
                ? "border-black bg-navy text-white"
                : "border-black bg-white text-charcoal hover:bg-slate-100"
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="border border-black bg-white p-5 md:p-6">
        {activeTool === "scale" && <ScaleCalculator />}
        {activeTool === "unit" && <UnitConverter />}
        {activeTool === "angle" && <AngleConverter />}
      </div>
    </div>
  );
}
