"use client";

import { useMemo } from "react";

import { sharpInputClassName } from "@/components/form/SharpField";
import type {
  WorkOrderCompletionStatus,
  WorkOrderListItem,
} from "@/types/work-order";

interface WorkOrderListPanelProps {
  records: WorkOrderListItem[];
  selectedId: string | null;
  search: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
}

function formatDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year!, month! - 1, day!).toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return new Date(value).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMiktar(miktar: number, birim: string | null): string {
  const formatted = Number.isInteger(miktar)
    ? String(miktar)
    : miktar.toLocaleString("tr-TR", { maximumFractionDigits: 3 });
  return birim ? `${formatted} ${birim}` : formatted;
}

function statusLabel(status: WorkOrderCompletionStatus): string {
  return status === "completed" ? "Tamamlandı" : "Tamamlanmadı";
}

function statusClass(status: WorkOrderCompletionStatus): string {
  return status === "completed"
    ? "border-green-700 bg-green-50 text-green-800"
    : "border-amber-700 bg-amber-50 text-amber-900";
}

function groupByDate(
  records: WorkOrderListItem[],
): { dateKey: string; label: string; items: WorkOrderListItem[] }[] {
  const groups = new Map<string, WorkOrderListItem[]>();

  for (const record of records) {
    const key = record.tarih;
    const current = groups.get(key);
    if (current) {
      current.push(record);
    } else {
      groups.set(key, [record]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => ({
    dateKey,
    label: formatDate(dateKey),
    items,
  }));
}

export function WorkOrderListPanel({
  records,
  selectedId,
  search,
  isLoading,
  onSearchChange,
  onSelect,
}: WorkOrderListPanelProps) {
  const groups = useMemo(() => groupByDate(records), [records]);

  return (
    <div className="flex h-full flex-col border border-black bg-white">
      <div className="border-b border-black px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
          İş Emri Kayıtları
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {isLoading ? "Yükleniyor..." : `${records.length} kayıt · günlere göre`}
        </p>
      </div>

      <div className="border-b border-black p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Firma, iş türü veya personel ara..."
          className={sharpInputClassName}
        />
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-500">Kayıtlar yükleniyor...</p>
        ) : records.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Kriterlere uygun iş emri bulunamadı.
          </p>
        ) : (
          <div className="divide-y divide-black">
            {groups.map((group) => (
              <section key={group.dateKey}>
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 px-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal">
                    {group.label}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {group.items.length} iş emri
                  </p>
                </div>
                <ul>
                  {group.items.map((record) => (
                    <li key={record.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(record.id)}
                        className={`flex w-full flex-col gap-1 border-b border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                          selectedId === record.id ? "bg-slate-100" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-charcoal">
                            {record.talepEdenFirma}
                          </p>
                          <span
                            className={`shrink-0 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass(record.completionStatus)}`}
                          >
                            {statusLabel(record.completionStatus)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {record.isTuru} · {formatMiktar(record.miktar, record.birim)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Sorumlu: {record.sorumluPersonel}
                          {record.attachmentCount > 0
                            ? ` · ${record.attachmentCount} görsel`
                            : ""}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
