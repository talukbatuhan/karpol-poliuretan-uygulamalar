import type { z } from "zod";

import type { workOrderFormSchema } from "@/lib/validations/work-order-form";

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

/** Supabase work_orders tablosu ile uyumlu kayıt tipi */
export interface WorkOrderRecord {
  id: string;
  tarih: string;
  city_id: string | null;
  talep_eden_firma_id: string;
  uygulayici_firma_id: string;
  is_turu_id: string;
  is_aciklamasi: string | null;
  miktar: number;
  birim_id: string | null;
  planlanan_teslim_tarihi: string | null;
  kargo_firmasi_id: string | null;
  talebi_olusturan_personel_id: string | null;
  sorumlu_personel_id: string;
  notlar: string | null;
  created_at: string;
  updated_at: string;
}

export function mapFormToWorkOrderRecord(
  values: WorkOrderFormValues,
): Omit<WorkOrderRecord, "id" | "created_at" | "updated_at"> {
  return {
    tarih: values.tarih,
    city_id: values.sehirId || null,
    talep_eden_firma_id: values.talepEdenFirmaId,
    uygulayici_firma_id: values.uygulayiciFirmaId,
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
