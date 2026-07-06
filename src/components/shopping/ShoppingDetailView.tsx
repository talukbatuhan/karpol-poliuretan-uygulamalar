"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  formatShoppingDate,
  formatShoppingPrice,
  type ShoppingRecordDetail,
} from "@/types/shopping-record";

interface ShoppingDetailViewProps {
  record: ShoppingRecordDetail;
}

export function ShoppingDetailView({ record }: ShoppingDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `"${record.productName}" kaydını silmek istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/e-alisveris/${record.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kayıt silinemedi");
        return;
      }

      router.push("/e-alisveris");
      router.refresh();
    } catch {
      setError("Kayıt silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/e-alisveris"
            className="text-xs font-medium uppercase tracking-wide text-slate-500 hover:text-charcoal"
          >
            ← Tüm kayıtlar
          </Link>
          <h2 className="mt-2 text-xl font-semibold uppercase tracking-wide text-charcoal md:text-2xl">
            {record.productName}
          </h2>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/e-alisveris/${record.id}/duzenle`}
            className="border border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal hover:bg-slate-100"
          >
            Düzenle
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="border border-red-700 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 border border-black bg-white p-5 md:grid-cols-2">
        <DetailField label="Mağaza / Web Sitesi" value={record.store || "—"} />
        <DetailField label="Kategori" value={record.category || "—"} />
        <DetailField label="Fiyat" value={formatShoppingPrice(record.price)} />
        <DetailField
          label="Alışveriş Tarihi"
          value={formatShoppingDate(record.purchaseDate)}
        />
        <div className="md:col-span-2">
          <DetailField label="Notlar" value={record.notes || "—"} multiline />
        </div>
      </div>

      {record.files.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Dosyalar ({record.files.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {record.files.map((file) => (
              <div
                key={file.id}
                className="border border-black bg-white"
              >
                {file.mimeType.startsWith("image/") ? (
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.fileName}
                      className="aspect-video w-full object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video items-center justify-center bg-slate-100 text-sm font-semibold uppercase tracking-wide text-navy hover:bg-slate-200"
                  >
                    PDF Aç
                  </a>
                )}
                <div className="border-t border-black px-3 py-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-charcoal hover:underline"
                  >
                    {file.fileName}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-charcoal ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
