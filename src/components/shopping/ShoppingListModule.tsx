"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ShoppingCard } from "@/components/shopping/ShoppingCard";
import { sharpInputClassName } from "@/components/form/SharpField";
import type { ShoppingRecord } from "@/types/shopping-record";

export function ShoppingListModule() {
  const [records, setRecords] = useState<ShoppingRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      const response = await fetch(`/api/e-alisveris${params}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kayıtlar yüklenemedi");
        setRecords([]);
        return;
      }

      setRecords(data.records ?? []);
    } catch {
      setError("Kayıtlar yüklenemedi");
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
  }, [search, loadRecords]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün, mağaza, kategori veya notlarda ara..."
          className={`${sharpInputClassName} sm:max-w-xl`}
        />
        <Link
          href="/e-alisveris/yeni"
          className="shrink-0 bg-navy px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy-light"
        >
          Yeni Kayıt
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Kayıtlar yükleniyor...</p>
      )}

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-600">
            {search.trim()
              ? "Aramanızla eşleşen kayıt bulunamadı."
              : "Henüz alışveriş kaydı yok."}
          </p>
          {!search.trim() && (
            <Link
              href="/e-alisveris/yeni"
              className="mt-4 inline-block text-sm font-medium text-navy hover:underline"
            >
              İlk kaydınızı oluşturun
            </Link>
          )}
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <ShoppingCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
