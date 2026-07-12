"use client";

import { useCallback, useEffect, useState } from "react";

import { sharpInputClassName } from "@/components/form/SharpField";
import {
  WORK_ORDER_LOOKUP_FIELD_HINTS,
  WORK_ORDER_LOOKUP_LABELS,
  type LookupItem,
  type WorkOrderLookupType,
} from "@/types/work-order-lookup";

const LOOKUP_TYPES: WorkOrderLookupType[] = ["job_types", "personnel"];

interface FormState {
  label: string;
  phone: string;
}

const EMPTY_FORM: FormState = { label: "", phone: "" };

export function WorkOrderSettingsModule() {
  const [activeType, setActiveType] = useState<WorkOrderLookupType>("job_types");
  const [items, setItems] = useState<LookupItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadItems = useCallback(async (type: WorkOrderLookupType) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/is-takip/admin/lookups/${type}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Liste yüklenemedi");
        setItems([]);
        return;
      }

      setItems(data.items ?? []);
    } catch {
      setError("Liste yüklenemedi");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems(activeType);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }, [activeType, loadItems]);

  const handleEdit = (item: LookupItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      phone: item.phone ?? "",
    });
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        label: form.label,
        phone: activeType === "personnel" ? form.phone : undefined,
        isActive: true,
      };

      const url = editingId
        ? `/api/is-takip/admin/lookups/${activeType}/${editingId}`
        : `/api/is-takip/admin/lookups/${activeType}`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }

      setSuccess(editingId ? "Kayıt güncellendi." : "Kayıt eklendi.");
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadItems(activeType);
    } catch {
      setError("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: LookupItem) => {
    const confirmed = window.confirm(`"${item.label}" kaydını silmek istiyor musunuz?`);
    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/is-takip/admin/lookups/${activeType}/${item.id}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Silinemedi");
        return;
      }

      setSuccess("Kayıt silindi.");
      if (editingId === item.id) handleCancelEdit();
      await loadItems(activeType);
    } catch {
      setError("Silinemedi");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        İş takip formundaki firma, iş türü ve personel listelerini buradan
        yönetin. Sorumlu personele WhatsApp&apos;tan Gönder için telefon numarası
        girin.
      </p>

      <div className="flex flex-wrap gap-2">
        {LOOKUP_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              activeType === type
                ? "border-black bg-navy text-white"
                : "border-black bg-white text-charcoal hover:bg-slate-100"
            }`}
          >
            {WORK_ORDER_LOOKUP_LABELS[type]}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        {WORK_ORDER_LOOKUP_FIELD_HINTS[activeType]}
      </p>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="grid gap-4 border border-black bg-white p-4 md:grid-cols-2 md:p-5"
      >
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
            {activeType === "personnel" ? "Personel Adı" : "Ad"}
          </label>
          <input
            value={form.label}
            onChange={(e) => setForm((current) => ({ ...current, label: e.target.value }))}
            className={sharpInputClassName}
            required
          />
        </div>

        {activeType === "personnel" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
              WhatsApp Telefon
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
              placeholder="905551234567"
              className={sharpInputClassName}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-navy-light disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="border border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal hover:bg-slate-100"
            >
              İptal
            </button>
          )}
        </div>
      </form>

      {success && (
        <p className="border-l-2 border-green-700 pl-2 text-sm text-green-700">{success}</p>
      )}
      {error && (
        <p className="border-l-2 border-red-700 pl-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="border border-black bg-white">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Yükleniyor...</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal">{item.label}</p>
                  {item.phone && (
                    <p className="text-xs text-slate-500">{item.phone}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="text-xs font-medium uppercase tracking-wide text-navy hover:underline"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    className="text-xs font-medium uppercase tracking-wide text-red-700 hover:underline"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
