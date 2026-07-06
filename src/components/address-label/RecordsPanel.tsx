"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteAddressLabel,
  fetchAddressLabels,
} from "@/lib/services/address-label-service";
import { formatRecordDate } from "@/lib/utils/date";
import type { AddressLabel } from "@/types/address-label";

interface RecordsPanelProps {
  onSelect: (record: AddressLabel) => void;
  refreshKey: number;
  onDeleted?: () => void;
}

export function RecordsPanel({
  onSelect,
  refreshKey,
  onDeleted,
}: RecordsPanelProps) {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<AddressLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRecords = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAddressLabels(query);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıtlar yüklenemedi.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRecords(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, refreshKey, loadRecords]);

  const handleDelete = async (record: AddressLabel) => {
    const confirmed = window.confirm(
      `"${record.company_title}" kaydını silmek istediğinize emin misiniz?`,
    );

    if (!confirmed) return;

    setDeletingId(record.id);
    setError(null);

    try {
      await deleteAddressLabel(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal">
          Kayıtlar
        </h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Firma adına göre ara..."
          className="mt-3 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-slate-400 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-4 py-6 text-sm text-slate-500">Yükleniyor...</p>
        )}

        {error && (
          <p className="px-4 py-6 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && records.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500">Kayıt bulunamadı.</p>
        )}

        {!loading && !error && records.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {records.map((record) => (
              <li key={record.id} className="group flex items-stretch">
                <button
                  type="button"
                  onClick={() => onSelect(record)}
                  className="min-w-0 flex-1 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  <p className="truncate text-sm font-medium text-charcoal">
                    {record.company_title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatRecordDate(record.created_at)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(record)}
                  disabled={deletingId === record.id}
                  aria-label={`${record.company_title} kaydını sil`}
                  className="shrink-0 border-l border-slate-100 px-3 text-xs font-medium uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === record.id ? "..." : "Sil"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
