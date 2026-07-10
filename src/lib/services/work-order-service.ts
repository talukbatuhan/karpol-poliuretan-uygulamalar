import { createAdminClient } from "@/lib/supabase/admin";
import {
  getLookupLabelMap,
  getPersonnelPhone,
} from "@/lib/services/work-order-lookup-service";
import { sendWorkOrderWhatsApp } from "@/lib/integrations/whatsapp";
import type { WorkOrderFormValues } from "@/types/work-order";
import { mapFormToWorkOrderRecord } from "@/types/work-order";

interface CreateWorkOrderContext {
  userId: string;
  userEmail: string;
  userName?: string | null;
}

export interface CreateWorkOrderResult {
  id: string;
  whatsappSent: boolean;
  whatsappError?: string;
  whatsappUrl?: string;
}

export async function createWorkOrder(
  values: WorkOrderFormValues,
  context: CreateWorkOrderContext,
  birimLabel = "",
): Promise<CreateWorkOrderResult> {
  const supabase = createAdminClient();
  const record = mapFormToWorkOrderRecord(values);

  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      ...record,
      created_by_user_id: context.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "İş kaydı oluşturulamadı");
  }

  const [companies, jobTypes, personnel] = await Promise.all([
    getLookupLabelMap("companies", [
      record.talep_eden_firma_id,
      record.uygulayici_firma_id,
    ]),
    getLookupLabelMap("job_types", [record.is_turu_id]),
    getLookupLabelMap("personnel", [
      record.sorumlu_personel_id,
      ...(record.talebi_olusturan_personel_id
        ? [record.talebi_olusturan_personel_id]
        : []),
    ]),
  ]);

  const responsiblePhone = await getPersonnelPhone(record.sorumlu_personel_id);

  const whatsappResult = await sendWorkOrderWhatsApp({
    toPhone: responsiblePhone,
    assignerName: context.userName || context.userEmail,
    assignerEmail: context.userEmail,
    talepEdenFirma: companies.get(record.talep_eden_firma_id) ?? "—",
    uygulayiciFirma: companies.get(record.uygulayici_firma_id) ?? "—",
    isTuru: jobTypes.get(record.is_turu_id) ?? "—",
    talebiOlusturan: record.talebi_olusturan_personel_id
      ? personnel.get(record.talebi_olusturan_personel_id) ?? "—"
      : "—",
    sorumluPersonel: personnel.get(record.sorumlu_personel_id) ?? "—",
    isAciklamasi: record.is_aciklamasi ?? "—",
    miktar: values.miktar,
    birimLabel,
    planlananTeslim: record.planlanan_teslim_tarihi ?? "—",
    notlar: record.notlar ?? "—",
    tarih: record.tarih,
  });

  if (whatsappResult.sent) {
    await supabase
      .from("work_orders")
      .update({ whatsapp_sent_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  return {
    id: data.id,
    whatsappSent: whatsappResult.sent,
    whatsappError: whatsappResult.error,
    whatsappUrl: whatsappResult.waUrl,
  };
}
