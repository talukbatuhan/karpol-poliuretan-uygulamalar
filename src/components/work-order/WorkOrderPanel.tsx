"use client";

import { useState } from "react";

import { WorkOrderSettingsModule } from "@/components/work-order/WorkOrderSettingsModule";
import { SharpForm } from "@/components/SharpForm";

type Tab = "form" | "settings";

export function WorkOrderPanel() {
  const [tab, setTab] = useState<Tab>("form");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("form")}
          className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
            tab === "form"
              ? "border-black bg-navy text-white"
              : "border-black bg-white text-charcoal hover:bg-slate-100"
          }`}
        >
          Yeni İş Kaydı
        </button>
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
            tab === "settings"
              ? "border-black bg-navy text-white"
              : "border-black bg-white text-charcoal hover:bg-slate-100"
          }`}
        >
          Ayarlar
        </button>
      </div>

      {tab === "form" ? <SharpForm /> : <WorkOrderSettingsModule />}
    </div>
  );
}
