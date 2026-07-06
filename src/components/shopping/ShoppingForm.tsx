"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ShoppingFileUpload } from "@/components/shopping/ShoppingFileUpload";
import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { getTodayDateString } from "@/lib/utils/date";
import type { ShoppingRecordFormValues } from "@/lib/validations/shopping-record-form";
import type {
  PendingShoppingFile,
  ShoppingRecordDetail,
  ShoppingRecordFile,
} from "@/types/shopping-record";

interface ShoppingFormProps {
  mode: "create" | "edit";
  initialData?: ShoppingRecordDetail;
}

const EMPTY_FORM: ShoppingRecordFormValues = {
  productName: "",
  store: "",
  price: "",
  purchaseDate: getTodayDateString(),
  category: "",
  notes: "",
};

export function ShoppingForm({ mode, initialData }: ShoppingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ShoppingRecordFormValues>(() => {
    if (!initialData) return EMPTY_FORM;

    return {
      productName: initialData.productName,
      store: initialData.store,
      price: initialData.price !== null ? String(initialData.price) : "",
      purchaseDate: initialData.purchaseDate,
      category: initialData.category,
      notes: initialData.notes,
    };
  });
  const [pendingFiles, setPendingFiles] = useState<PendingShoppingFile[]>([]);
  const [existingFiles] = useState<ShoppingRecordFile[]>(
    initialData?.files ?? [],
  );
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof ShoppingRecordFormValues>(
    key: K,
    value: ShoppingRecordFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append(
        "payload",
        JSON.stringify(
          mode === "create" ? form : { form, removedFileIds },
        ),
      );
      pendingFiles.forEach((file) => formData.append("files", file.file));

      const url =
        mode === "create"
          ? "/api/e-alisveris"
          : `/api/e-alisveris/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, { method, body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }

      router.push(`/e-alisveris/${data.record.id}`);
      router.refresh();
    } catch {
      setError("İşlem başarısız");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
      <SharpField label="Ürün Adı" htmlFor="productName" required>
        <input
          id="productName"
          value={form.productName}
          onChange={(e) => updateField("productName", e.target.value)}
          className={sharpInputClassName}
          required
        />
      </SharpField>

      <div className="grid gap-5 md:grid-cols-2">
        <SharpField label="Mağaza / Web Sitesi" htmlFor="store">
          <input
            id="store"
            value={form.store}
            onChange={(e) => updateField("store", e.target.value)}
            placeholder="Amazon, MediaMarkt..."
            className={sharpInputClassName}
          />
        </SharpField>

        <SharpField label="Kategori" htmlFor="category">
          <input
            id="category"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            placeholder="Elektronik, Giyim..."
            className={sharpInputClassName}
          />
        </SharpField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SharpField label="Fiyat (₺)" htmlFor="price">
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="1299.90"
            className={sharpInputClassName}
          />
        </SharpField>

        <SharpField label="Alışveriş Tarihi" htmlFor="purchaseDate" required>
          <input
            id="purchaseDate"
            type="date"
            value={form.purchaseDate}
            onChange={(e) => updateField("purchaseDate", e.target.value)}
            className={sharpInputClassName}
            required
          />
        </SharpField>
      </div>

      <SharpField label="Notlar" htmlFor="notes" fullWidth>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={4}
          className={`${sharpInputClassName} resize-y`}
          placeholder="Garanti bilgisi, model no, hatırlatmalar..."
        />
      </SharpField>

      <ShoppingFileUpload
        pendingFiles={pendingFiles}
        existingFiles={existingFiles}
        removedFileIds={removedFileIds}
        onPendingChange={setPendingFiles}
        onRemoveExisting={(fileId) =>
          setRemovedFileIds((current) => [...current, fileId])
        }
        onRestoreExisting={(fileId) =>
          setRemovedFileIds((current) =>
            current.filter((id) => id !== fileId),
          )
        }
      />

      {error && (
        <p
          className="border-l-2 border-red-700 pl-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-navy px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
        >
          {isSubmitting
            ? "Kaydediliyor..."
            : mode === "create"
              ? "Kaydı Oluştur"
              : "Değişiklikleri Kaydet"}
        </button>
        <Link
          href={
            mode === "edit" && initialData
              ? `/e-alisveris/${initialData.id}`
              : "/e-alisveris"
          }
          className="border border-black bg-white px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-charcoal hover:bg-slate-100 sm:flex-1"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
