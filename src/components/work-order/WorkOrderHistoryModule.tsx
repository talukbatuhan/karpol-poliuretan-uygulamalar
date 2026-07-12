"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { WorkOrderDetailCard } from "@/components/work-order/WorkOrderDetailCard";
import { WorkOrderListPanel } from "@/components/work-order/WorkOrderListPanel";
import type { WorkOrderDetail, WorkOrderListItem } from "@/types/work-order";

function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function WorkOrderHistoryModule({ isAdmin = false }: { isAdmin?: boolean }) {
  const [records, setRecords] = useState<WorkOrderListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const response = await fetch("/api/is-takip/work-orders");
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error ?? "İş emirleri yüklenemedi");
        setRecords([]);
        return;
      }

      setRecords(data.records ?? []);
    } catch {
      setListError("İş emirleri yüklenemedi");
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((record) => {
      return (
        normalizeSearch(record.talepEdenFirma).includes(normalizedSearch) ||
        normalizeSearch(record.uygulayiciFirma).includes(normalizedSearch) ||
        normalizeSearch(record.isTuru).includes(normalizedSearch) ||
        normalizeSearch(record.sorumluPersonel).includes(normalizedSearch) ||
        normalizeSearch(record.isAciklamasi ?? "").includes(normalizedSearch) ||
        normalizeSearch(record.sehir ?? "").includes(normalizedSearch)
      );
    });
  }, [records, search]);

  const handleDeleted = async () => {
    setSelectedId(null);
    await loadRecords();
  };

  const handleUpdated = (updated: WorkOrderDetail) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === updated.id
          ? {
              ...item,
              completionStatus: updated.completionStatus,
            }
          : item,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {listError && (
        <p
          className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {listError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,2fr)_minmax(360px,3fr)] lg:items-start">
        <WorkOrderListPanel
          records={filteredRecords}
          selectedId={selectedId}
          search={search}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onSelect={setSelectedId}
        />

        <div className="min-w-0">
          <WorkOrderDetailCard
            recordId={selectedId}
            canDelete={isAdmin}
            onDeleted={() => void handleDeleted()}
            onUpdated={handleUpdated}
          />
        </div>
      </div>
    </div>
  );
}
