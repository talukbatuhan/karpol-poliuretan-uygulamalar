"use client";

import { useMemo, useState } from "react";

import { SharpField, sharpInputClassName } from "@/components/form/SharpField";

type AngleUnit = "degree" | "radian" | "gradian";

const UNITS: { value: AngleUnit; label: string }[] = [
  { value: "degree", label: "Derece (°)" },
  { value: "radian", label: "Radyan (rad)" },
  { value: "gradian", label: "Grad (gon)" },
];

function toDegrees(value: number, unit: AngleUnit): number {
  if (unit === "degree") return value;
  if (unit === "radian") return (value * 180) / Math.PI;
  return (value * 9) / 10;
}

function fromDegrees(value: number, unit: AngleUnit): number {
  if (unit === "degree") return value;
  if (unit === "radian") return (value * Math.PI) / 180;
  return (value * 10) / 9;
}

export function AngleConverter() {
  const [value, setValue] = useState("90");
  const [fromUnit, setFromUnit] = useState<AngleUnit>("degree");
  const [toUnit, setToUnit] = useState<AngleUnit>("radian");

  const result = useMemo(() => {
    const numeric = Number.parseFloat(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return null;
    return fromDegrees(toDegrees(numeric, fromUnit), toUnit);
  }, [value, fromUnit, toUnit]);

  return (
    <div className="space-y-5">
      <SharpField label="Açı Değeri" htmlFor="angle-value">
        <input
          id="angle-value"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={sharpInputClassName}
        />
      </SharpField>

      <div className="grid gap-5 md:grid-cols-2">
        <SharpField label="Kaynak Birim" htmlFor="angle-from">
          <select
            id="angle-from"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as AngleUnit)}
            className={sharpInputClassName}
          >
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </SharpField>

        <SharpField label="Hedef Birim" htmlFor="angle-to">
          <select
            id="angle-to"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value as AngleUnit)}
            className={sharpInputClassName}
          >
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </SharpField>
      </div>

      <div className="border-l-4 border-navy bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Sonuç
        </p>
        <p className="mt-1 text-lg font-semibold text-charcoal">
          {result !== null
            ? `${result.toLocaleString("tr-TR", { maximumFractionDigits: 6 })} ${
                UNITS.find((unit) => unit.value === toUnit)?.label.split(" ")[1] ??
                toUnit
              }`
            : "—"}
        </p>
      </div>
    </div>
  );
}
