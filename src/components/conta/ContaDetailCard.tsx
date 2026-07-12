"use client";

import { useEffect, useState } from "react";

import type { ContaRecordDetail } from "@/types/conta";

interface ContaDetailCardProps {
  recordId: string | null;
  refreshKey?: number;
  onEdit?: (record: ContaRecordDetail) => void;
  onDeleted?: (id: string) => void;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("tr-TR");
}

export function ContaDetailCard({
  recordId,
  refreshKey = 0,
  onEdit,
  onDeleted,
}: ContaDetailCardProps) {
  const [record, setRecord] = useState<ContaRecordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) {
      setRecord(null);
      setError(null);
      return;
    }

    const loadRecord = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/conta/${recordId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Kayıt yüklenemedi");
          setRecord(null);
          return;
        }

        setRecord(data.record);
      } catch {
        setError("Kayıt yüklenemedi");
        setRecord(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecord();
  }, [recordId, refreshKey]);

  const handleDelete = async () => {
    if (!recordId || !record) return;

    const confirmed = window.confirm(
      `${record.contaCode} kaydını silmek istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/conta/${recordId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kayıt silinemedi");
        return;
      }

      onDeleted?.(recordId);
    } catch {
      setError("Kayıt silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!recordId) {
    return (
      <div className="border border-black bg-white p-6">
        <p className="text-sm text-slate-500">
          Detay görmek için listeden bir conta seçin veya yeni kayıt oluşturun.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-black bg-white p-6">
        <p className="text-sm text-slate-500">Kayıt yükleniyor...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="border border-black bg-white p-6">
        <p className="text-sm text-red-700" role="alert">
          {error ?? "Kayıt bulunamadı"}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-black bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black px-4 py-4 md:px-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
            Conta Detayı
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {formatDateTime(record.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="border border-black bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-charcoal hover:bg-slate-100"
            >
              Düzenle
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="border border-black bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Conta ID
          </p>
          <p className="mt-1 text-sm font-medium text-charcoal">
            {record.contaCode}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Firma İsmi
          </p>
          <p className="mt-1 text-sm text-charcoal">{record.firmaIsmi}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Markası
          </p>
          <p className="mt-1 text-sm text-charcoal">{record.marka}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Uzunluk
          </p>
          <p className="mt-1 text-sm text-charcoal">{record.uzunluk}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Adet
          </p>
          <p className="mt-1 text-sm text-charcoal">{record.adet}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Renk
          </p>
          <p className="mt-1 text-sm text-charcoal">{record.renk}</p>
        </div>
      </div>

      {(record.images?.length ?? record.imageUrls.length) > 0 && (
        <div className="border-t border-black p-4 md:p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Görseller
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(record.images ?? record.imageUrls.map((url) => ({ id: url, url }))).map(
              (image) => (
                <li key={image.id} className="border border-black bg-white">
                  <a href={image.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt="Conta görseli"
                      className="aspect-square w-full object-cover"
                    />
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
