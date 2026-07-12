export type WorkOrderLookupType = "job_types" | "personnel";

export interface LookupItem {
  id: string;
  slug: string;
  label: string;
  phone?: string | null;
  isActive: boolean;
}

export interface LookupItemInput {
  label: string;
  phone?: string;
  isActive?: boolean;
}

export const WORK_ORDER_LOOKUP_LABELS: Record<WorkOrderLookupType, string> = {
  job_types: "İş Türleri",
  personnel: "Personel",
};

export const WORK_ORDER_LOOKUP_FIELD_HINTS: Record<WorkOrderLookupType, string> = {
  job_types: "İş Türü seçiminde kullanılır",
  personnel:
    "Talebi Oluşturan ve Sorumlu Personel listelerinde kullanılır (WhatsApp'tan Gönder için telefon gerekli)",
};

export function isWorkOrderLookupType(value: string): value is WorkOrderLookupType {
  return value === "job_types" || value === "personnel";
}
