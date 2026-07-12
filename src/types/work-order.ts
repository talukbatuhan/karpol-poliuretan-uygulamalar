import type { z } from "zod";

import type { workOrderFormSchema } from "@/lib/validations/work-order-form";

export type WorkOrderCompletionStatus = "incomplete" | "completed";

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

/** Supabase work_orders tablosu ile uyumlu kayıt tipi */
export interface WorkOrderRecord {
  id: string;
  tarih: string;
  city_id: string | null;
  talep_eden_firma: string;
  uygulayici_firma: string;
  talep_eden_firma_id: string | null;
  uygulayici_firma_id: string | null;
  talep_eden_company_registry_id: string | null;
  uygulayici_company_registry_id: string | null;
  is_turu_id: string;
  is_aciklamasi: string | null;
  miktar: number;
  birim_id: string | null;
  planlanan_teslim_tarihi: string | null;
  kargo_firmasi_id: string | null;
  talebi_olusturan_personel_id: string | null;
  sorumlu_personel_id: string;
  notlar: string | null;
  completion_status: WorkOrderCompletionStatus;
  created_by_user_id: string | null;
  whatsapp_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Liste görünümü — lookup adlarıyla */
export interface WorkOrderListItem {
  id: string;
  tarih: string;
  talepEdenFirma: string;
  uygulayiciFirma: string;
  isTuru: string;
  isAciklamasi: string | null;
  miktar: number;
  birim: string | null;
  planlananTeslimTarihi: string | null;
  sorumluPersonel: string;
  sehir: string | null;
  attachmentCount: number;
  completionStatus: WorkOrderCompletionStatus;
  whatsappSentAt: string | null;
  createdAt: string;
}

export interface WorkOrderAttachmentItem {
  id: string;
  category: "product" | "technical";
  fileName: string;
  url: string;
}

/** Detay görünümü */
export interface WorkOrderDetail extends WorkOrderListItem {
  kargoFirmasi: string | null;
  talebiOlusturanPersonel: string | null;
  notlar: string | null;
  attachments: WorkOrderAttachmentItem[];
  updatedAt: string;
}

export function mapFormToWorkOrderRecord(
  values: WorkOrderFormValues,
): Omit<
  WorkOrderRecord,
  | "id"
  | "created_at"
  | "updated_at"
  | "completion_status"
  | "created_by_user_id"
  | "whatsapp_sent_at"
> {
  return {
    tarih: values.tarih,
    city_id: values.sehirId || null,
    talep_eden_firma: values.talepEdenFirma.trim(),
    uygulayici_firma: values.uygulayiciFirma.trim(),
    talep_eden_firma_id: null,
    uygulayici_firma_id: null,
    talep_eden_company_registry_id: values.talepEdenFirmaKartId || null,
    uygulayici_company_registry_id: values.uygulayiciFirmaKartId || null,
    is_turu_id: values.isTuruId,
    is_aciklamasi: values.isAciklamasi || null,
    miktar: values.miktar,
    birim_id: values.birimId || null,
    planlanan_teslim_tarihi: values.planlananTeslimTarihi || null,
    kargo_firmasi_id: values.kargoFirmasiId || null,
    talebi_olusturan_personel_id: values.talebiOlusturanPersonelId || null,
    sorumlu_personel_id: values.sorumluPersonelId,
    notlar: values.notlar || null,
  };
}
