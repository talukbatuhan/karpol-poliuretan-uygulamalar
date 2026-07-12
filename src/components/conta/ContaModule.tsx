"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ContaDetailCard } from "@/components/conta/ContaDetailCard";
import { ContaForm } from "@/components/conta/ContaForm";
import { ContaListPanel } from "@/components/conta/ContaListPanel";
import type { ContaFormValues, ContaRecord, ContaRecordDetail } from "@/types/conta";

function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type RightPane =
  | { mode: "empty" }
  | { mode: "detail"; recordId: string }
  | { mode: "create" }
  | {
      mode: "edit";
      recordId: string;
      contaCode: string;
      values: ContaFormValues;
      images: ContaRecordDetail["images"];
    };

export function ContaModule() {
  const [records, setRecords] = useState<ContaRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pane, setPane] = useState<RightPane>({ mode: "empty" });
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const response = await fetch("/api/conta");
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error ?? "Conta kayıtları yüklenemedi");
        setRecords([]);
        return;
      }

      setRecords(data.records ?? []);
    } catch {
      setListError("Conta kayıtları yüklenemedi");
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
        normalizeSearch(record.contaCode).includes(normalizedSearch) ||
        normalizeSearch(record.firmaIsmi).includes(normalizedSearch) ||
        normalizeSearch(record.marka).includes(normalizedSearch) ||
        normalizeSearch(record.renk).includes(normalizedSearch)
      );
    });
  }, [records, search]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setPane({ mode: "detail", recordId: id });
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setPane({ mode: "create" });
  };

  const handleSaved = async (payload: { id: string; contaCode: string }) => {
    await loadRecords();
    setSelectedId(payload.id);
    setDetailRefreshKey((key) => key + 1);
    setPane({ mode: "detail", recordId: payload.id });
  };

  const handleEdit = (record: ContaRecordDetail) => {
    setSelectedId(record.id);
    setPane({
      mode: "edit",
      recordId: record.id,
      contaCode: record.contaCode,
      values: {
        firmaIsmi: record.firmaIsmi,
        marka: record.marka,
        uzunluk: record.uzunluk,
        adet: record.adet,
        renk: record.renk,
      },
      images: record.images ?? [],
    });
  };

  const handleDeleted = async (id: string) => {
    await loadRecords();
    if (selectedId === id) {
      setSelectedId(null);
    }
    setPane({ mode: "empty" });
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
        <ContaListPanel
          records={filteredRecords}
          selectedId={selectedId}
          search={search}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          onCreateNew={handleCreateNew}
        />

        <div className="min-w-0">
          {pane.mode === "create" ? (
            <ContaForm
              mode="create"
              onSaved={handleSaved}
              onCancel={() => setPane({ mode: "empty" })}
            />
          ) : pane.mode === "edit" ? (
            <ContaForm
              mode="edit"
              recordId={pane.recordId}
              contaCode={pane.contaCode}
              initialValues={pane.values}
              existingImages={pane.images}
              onSaved={handleSaved}
              onCancel={() =>
                setPane({ mode: "detail", recordId: pane.recordId })
              }
            />
          ) : pane.mode === "detail" ? (
            <ContaDetailCard
              recordId={pane.recordId}
              refreshKey={detailRefreshKey}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
            />
          ) : (
            <ContaDetailCard recordId={null} />
          )}
        </div>
      </div>
    </div>
  );
}
