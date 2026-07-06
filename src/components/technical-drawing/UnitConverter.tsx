"use client";

import { useMemo, useState } from "react";

import { SharpField, sharpInputClassName } from "@/components/form/SharpField";

type Unit = "mm" | "cm" | "m" | "inch" | "ft";

const UNITS: { value: Unit; label: string; factor: number }[] = [
  { value: "mm", label: "Milimetre (mm)", factor: 1 },
  { value: "cm", label: "Santimetre (cm)", factor: 10 },
  { value: "m", label: "Metre (m)", factor: 1000 },
  { value: "inch", label: "İnç (in)", factor: 25.4 },
  { value: "ft", label: "Fit (ft)", factor: 304.8 },
];

function convertLength(value: number, from: Unit, to: Unit): number {
  const fromFactor = UNITS.find((unit) => unit.value === from)?.factor ?? 1;
  const toFactor = UNITS.find((unit) => unit.value === to)?.factor ?? 1;
  return (value * fromFactor) / toFactor;
}

export function UnitConverter() {
  const [value, setValue] = useState("25.4");
  const [fromUnit, setFromUnit] = useState<Unit>("mm");
  const [toUnit, setToUnit] = useState<Unit>("inch");

  const result = useMemo(() => {
    const numeric = Number.parseFloat(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return null;
    return convertLength(numeric, fromUnit, toUnit);
  }, [value, fromUnit, toUnit]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result !== null) setValue(String(result));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <SharpField label="Değer" htmlFor="unit-value">
          <input
            id="unit-value"
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={sharpInputClassName}
          />
        </SharpField>

        <button
          type="button"
          onClick={swapUnits}
          aria-label="Birimleri değiştir"
          className="border border-black bg-white px-3 py-2 text-sm font-semibold text-charcoal hover:bg-slate-100 md:mb-0.5"
        >
          ⇄
        </button>

        <div className="hidden md:block" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SharpField label="Kaynak Birim" htmlFor="from-unit">
          <select
            id="from-unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as Unit)}
            className={sharpInputClassName}
          >
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </SharpField>

        <SharpField label="Hedef Birim" htmlFor="to-unit">
          <select
            id="to-unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value as Unit)}
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
            ? `${result.toLocaleString("tr-TR", { maximumFractionDigits: 6 })} ${toUnit}`
            : "—"}
        </p>
      </div>
    </div>
  );
}
