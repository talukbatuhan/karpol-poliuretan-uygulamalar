"use client";

import { useEffect, useState } from "react";

import { WorkOrderHistoryModule } from "@/components/work-order/WorkOrderHistoryModule";
import { WorkOrderSettingsModule } from "@/components/work-order/WorkOrderSettingsModule";
import { SharpForm } from "@/components/SharpForm";

type Tab = "history" | "form" | "settings";

const TAB_CLASS = (active: boolean) =>
  `border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
    active
      ? "border-black bg-navy text-white"
      : "border-black bg-white text-charcoal hover:bg-slate-100"
  }`;

export function WorkOrderPanel() {
  const [tab, setTab] = useState<Tab>("form");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await fetch("/api/is-takip/me");
        const data = await response.json();
        if (response.ok) {
          setIsAdmin(Boolean(data.isAdmin));
        }
      } catch {
        setIsAdmin(false);
      }
    };

    void loadMe();
  }, []);

  useEffect(() => {
    if (!isAdmin && tab === "settings") {
      setTab("form");
    }
  }, [isAdmin, tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("form")}
          className={TAB_CLASS(tab === "form")}
        >
          Yeni İş Kaydı
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={TAB_CLASS(tab === "history")}
        >
          İş Emri Kayıtları
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={TAB_CLASS(tab === "settings")}
          >
            Ayarlar
          </button>
        )}
      </div>

      {tab === "form" ? (
        <SharpForm />
      ) : tab === "history" ? (
        <WorkOrderHistoryModule isAdmin={isAdmin} />
      ) : (
        <WorkOrderSettingsModule />
      )}
    </div>
  );
}
