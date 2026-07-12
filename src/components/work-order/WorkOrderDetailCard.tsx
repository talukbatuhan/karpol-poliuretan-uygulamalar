"use client";

import { useEffect, useState } from "react";

import type {
  WorkOrderCompletionStatus,
  WorkOrderDetail,
} from "@/types/work-order";

interface WorkOrderDetailCardProps {
  recordId: string | null;
  canDelete?: boolean;
  onDeleted?: () => void;
  onUpdated?: (record: WorkOrderDetail) => void;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year!, month! - 1, day!).toLocaleDateString("tr-TR");
  }
  return new Date(value).toLocaleDateString("tr-TR");
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("tr-TR");
}

function formatMiktar(miktar: number, birim: string | null): string {
  const formatted = Number.isInteger(miktar)
    ? String(miktar)
    : miktar.toLocaleString("tr-TR", { maximumFractionDigits: 3 });
  return birim ? `${formatted} ${birim}` : formatted;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-charcoal whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export function WorkOrderDetailCard({
  recordId,
  canDelete = false,
  onDeleted,
  onUpdated,
}: WorkOrderDetailCardProps) {
  const [record, setRecord] = useState<WorkOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!record) return;

    const confirmed = window.confirm(
      `${record.talepEdenFirma} — ${record.isTuru} iş emrini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/is-takip/work-orders/${record.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        window.alert(data.error ?? "İş emri silinemedi");
        return;
      }

      onDeleted?.();
    } catch {
      window.alert("İş emri silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (completionStatus: WorkOrderCompletionStatus) => {
    if (!record || record.completionStatus === completionStatus) return;
    if (record.completionStatus === "completed") return;
    if (completionStatus !== "completed") return;

    setIsUpdatingStatus(true);
    setError(null);

    try {
      const response = await fetch(`/api/is-takip/work-orders/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Durum güncellenemedi");
        return;
      }

      setRecord(data.record);
      onUpdated?.(data.record);
    } catch {
      setError("Durum güncellenemedi");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
        const response = await fetch(`/api/is-takip/work-orders/${recordId}`);
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
  }, [recordId]);

  if (!recordId) {
    return (
      <div className="border border-black bg-white p-6">
        <p className="text-sm text-slate-500">
          Detay görmek için listeden bir iş emri seçin.
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

  if ((error && !record) || !record) {
    return (
      <div className="border border-black bg-white p-6">
        <p className="text-sm text-red-700" role="alert">
          {error ?? "Kayıt bulunamadı"}
        </p>
      </div>
    );
  }

  const productImages = record.attachments.filter(
    (item) => item.category === "product",
  );
  const technicalImages = record.attachments.filter(
    (item) => item.category === "technical",
  );

  return (
    <div className="border border-black bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-black px-4 py-4 md:px-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
            İş Emri Detayı
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Oluşturulma: {formatDateTime(record.createdAt)}
          </p>
          {record.whatsappSentAt && (
            <p className="mt-1 text-xs text-slate-500">
              WhatsApp: {formatDateTime(record.whatsappSentAt)}
            </p>
          )}
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="shrink-0 border border-red-700 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </button>
        )}
      </div>

      <div className="border-b border-black px-4 py-4 md:px-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          İş durumu
        </p>
        <div className="flex flex-wrap gap-2">
          {record.completionStatus === "completed" ? (
            <p className="border border-green-700 bg-green-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-green-800">
              İş tamamlandı
            </p>
          ) : (
            <>
              <button
                type="button"
                disabled={isUpdatingStatus}
                className="border border-amber-700 bg-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-900 disabled:opacity-50"
              >
                Tamamlanmadı
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => void handleStatusChange("completed")}
                className="border border-black bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Tamamlandı olarak işaretle
              </button>
            </>
          )}
        </div>
        {record.completionStatus === "completed" && (
          <p className="mt-2 text-xs text-slate-500">
            Bu iş emri tamamlandı; durum geri alınamaz.
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {isUpdatingStatus && (
          <p className="mt-2 text-xs text-slate-500">Durum güncelleniyor...</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6">
        <DetailField label="Tarih" value={formatDate(record.tarih)} />
        <DetailField label="Şehir" value={record.sehir ?? "—"} />
        <DetailField label="Talep Eden Firma" value={record.talepEdenFirma} />
        <DetailField label="Uygulayıcı Firma" value={record.uygulayiciFirma} />
        <DetailField label="İş Türü" value={record.isTuru} />
        <DetailField
          label="Miktar"
          value={formatMiktar(record.miktar, record.birim)}
        />
        <DetailField
          label="Planlanan Teslim"
          value={formatDate(record.planlananTeslimTarihi)}
        />
        <DetailField
          label="Kargo Firması"
          value={record.kargoFirmasi ?? "—"}
        />
        <DetailField
          label="Talebi Oluşturan"
          value={record.talebiOlusturanPersonel ?? "—"}
        />
        <DetailField label="Sorumlu Personel" value={record.sorumluPersonel} />
      </div>

      {(record.isAciklamasi || record.notlar) && (
        <div className="grid grid-cols-1 gap-4 border-t border-black p-4 md:grid-cols-2 md:p-6">
          {record.isAciklamasi && (
            <DetailField label="İş Açıklaması" value={record.isAciklamasi} />
          )}
          {record.notlar && (
            <DetailField label="Notlar" value={record.notlar} />
          )}
        </div>
      )}

      {productImages.length > 0 && (
        <div className="border-t border-black p-4 md:p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Ürün Görselleri
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {productImages.map((image) => (
              <li key={image.id} className="border border-black bg-white">
                <a href={image.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="aspect-square w-full object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {technicalImages.length > 0 && (
        <div className="border-t border-black p-4 md:p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Teknik Resimler
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {technicalImages.map((image) => (
              <li key={image.id} className="border border-black bg-white">
                <a href={image.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="aspect-square w-full object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
