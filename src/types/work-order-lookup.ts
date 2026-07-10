export type WorkOrderLookupType = "companies" | "job_types" | "personnel";

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
  companies: "Firmalar",
  job_types: "İş Türleri",
  personnel: "Personel",
};

export const WORK_ORDER_LOOKUP_FIELD_HINTS: Record<WorkOrderLookupType, string> = {
  companies: "Talep Eden Firma ve Uygulayıcı Firma listelerinde kullanılır",
  job_types: "İş Türü seçiminde kullanılır",
  personnel: "Talebi Oluşturan ve Sorumlu Personel listelerinde kullanılır (WhatsApp için telefon gerekli)",
};

export function isWorkOrderLookupType(value: string): value is WorkOrderLookupType {
  return value === "companies" || value === "job_types" || value === "personnel";
}
