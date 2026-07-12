import {
  syncWorkOrderToGoogleSheets,
  workOrderSheetNameFromTarih,
} from "@/lib/integrations/google-sheets";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildShortImageUrl,
  createShortCode,
} from "@/lib/utils/short-link";
import type { AttachmentCategory } from "@/types/attachment";
import type {
  WorkOrderCompletionStatus,
  WorkOrderDetail,
  WorkOrderFormValues,
  WorkOrderListItem,
} from "@/types/work-order";
import { mapFormToWorkOrderRecord } from "@/types/work-order";

const STORAGE_BUCKET = "work-order-images";

interface NamedRef {
  name?: string;
  full_name?: string;
}

interface WorkOrderListRow {
  id: string;
  tarih: string;
  is_aciklamasi: string | null;
  miktar: number;
  planlanan_teslim_tarihi: string | null;
  completion_status?: string | null;
  whatsapp_sent_at?: string | null;
  created_at: string;
  updated_at?: string;
  notlar?: string | null;
  talep_eden_firma?: string | null;
  uygulayici_firma?: string | null;
  talep_eden_firma_ref: NamedRef | NamedRef[] | null;
  uygulayici_firma_ref: NamedRef | NamedRef[] | null;
  is_turu: NamedRef | NamedRef[] | null;
  birim: NamedRef | NamedRef[] | null;
  sehir: NamedRef | NamedRef[] | null;
  sorumlu_personel: NamedRef | NamedRef[] | null;
  kargo_firmasi?: NamedRef | NamedRef[] | null;
  talebi_olusturan_personel?: NamedRef | NamedRef[] | null;
  work_order_attachments?: { count: number }[] | { id: string; category: string; file_name: string; file_path: string }[];
}

function pickName(ref: NamedRef | NamedRef[] | null | undefined): string | null {
  if (!ref) return null;
  const item = Array.isArray(ref) ? ref[0] : ref;
  if (!item) return null;
  return item.name ?? item.full_name ?? null;
}

function mapCompletionStatus(
  value: string | null | undefined,
): WorkOrderCompletionStatus {
  return value === "completed" ? "completed" : "incomplete";
}

function mapListItem(row: WorkOrderListRow): WorkOrderListItem {
  let attachmentCount = 0;
  if (Array.isArray(row.work_order_attachments) && row.work_order_attachments.length > 0) {
    const first = row.work_order_attachments[0];
    if (first && "count" in first) {
      attachmentCount = Number(first.count ?? 0);
    } else {
      attachmentCount = row.work_order_attachments.length;
    }
  }

  return {
    id: row.id,
    tarih: row.tarih,
    talepEdenFirma:
      row.talep_eden_firma?.trim() ||
      pickName(row.talep_eden_firma_ref) ||
      "—",
    uygulayiciFirma:
      row.uygulayici_firma?.trim() ||
      pickName(row.uygulayici_firma_ref) ||
      "—",
    isTuru: pickName(row.is_turu) ?? "—",
    isAciklamasi: row.is_aciklamasi,
    miktar: Number(row.miktar),
    birim: pickName(row.birim),
    planlananTeslimTarihi: row.planlanan_teslim_tarihi,
    sorumluPersonel: pickName(row.sorumlu_personel) ?? "—",
    sehir: pickName(row.sehir),
    attachmentCount,
    completionStatus: mapCompletionStatus(row.completion_status),
    whatsappSentAt: row.whatsapp_sent_at ?? null,
    createdAt: row.created_at,
  };
}

const LIST_SELECT = `
  id,
  tarih,
  is_aciklamasi,
  miktar,
  planlanan_teslim_tarihi,
  completion_status,
  whatsapp_sent_at,
  created_at,
  talep_eden_firma,
  uygulayici_firma,
  talep_eden_firma_ref:companies!talep_eden_firma_id(name),
  uygulayici_firma_ref:companies!uygulayici_firma_id(name),
  is_turu:job_types!is_turu_id(name),
  birim:units!birim_id(name),
  sehir:cities!city_id(name),
  sorumlu_personel:personnel!sorumlu_personel_id(full_name),
  work_order_attachments(count)
`;

const DETAIL_SELECT = `
  id,
  tarih,
  is_aciklamasi,
  miktar,
  planlanan_teslim_tarihi,
  notlar,
  completion_status,
  whatsapp_sent_at,
  created_at,
  updated_at,
  talep_eden_firma,
  uygulayici_firma,
  talep_eden_firma_ref:companies!talep_eden_firma_id(name),
  uygulayici_firma_ref:companies!uygulayici_firma_id(name),
  is_turu:job_types!is_turu_id(name),
  birim:units!birim_id(name),
  sehir:cities!city_id(name),
  sorumlu_personel:personnel!sorumlu_personel_id(full_name),
  talebi_olusturan_personel:personnel!talebi_olusturan_personel_id(full_name),
  kargo_firmasi:cargo_companies!kargo_firmasi_id(name)
`;

export async function listWorkOrders(): Promise<WorkOrderListItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("work_orders")
    .select(LIST_SELECT)
    .order("tarih", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`İş emirleri okunamadı: ${error.message}`);
  }

  return ((data ?? []) as WorkOrderListRow[]).map(mapListItem);
}

export async function getWorkOrderById(id: string): Promise<WorkOrderDetail> {
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("work_orders")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "İş emri bulunamadı");
  }

  const { data: attachments, error: attachmentError } = await supabase
    .from("work_order_attachments")
    .select("id, category, file_name, file_path")
    .eq("work_order_id", id)
    .order("created_at", { ascending: true });

  if (attachmentError) {
    throw new Error(`İş emri görselleri okunamadı: ${attachmentError.message}`);
  }

  const mappedAttachments =
    attachments?.map((attachment) => {
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(attachment.file_path);

      return {
        id: attachment.id as string,
        category: attachment.category as "product" | "technical",
        fileName: attachment.file_name as string,
        url: publicUrlData.publicUrl,
      };
    }) ?? [];

  const listItem = mapListItem({
    ...(row as WorkOrderListRow),
    work_order_attachments: attachments ?? [],
  });

  return {
    ...listItem,
    kargoFirmasi: pickName((row as WorkOrderListRow).kargo_firmasi),
    talebiOlusturanPersonel: pickName(
      (row as WorkOrderListRow).talebi_olusturan_personel,
    ),
    notlar: (row as WorkOrderListRow).notlar ?? null,
    attachments: mappedAttachments,
    updatedAt: (row as WorkOrderListRow).updated_at ?? listItem.createdAt,
  };
}

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}`;
  }
  return value;
}

async function syncWorkOrderCreateToSheets(detail: WorkOrderDetail) {
  const sheetName = workOrderSheetNameFromTarih(detail.tarih);
  const result = await syncWorkOrderToGoogleSheets({
    action: "create",
    workOrderId: detail.id,
    sheetName,
    tarih: detail.tarih,
    tarihLabel: formatDateLabel(detail.tarih),
    sehir: detail.sehir ?? "",
    talepEdenFirma: detail.talepEdenFirma,
    uygulayiciFirma: detail.uygulayiciFirma,
    isTuru: detail.isTuru,
    isAciklamasi: detail.isAciklamasi ?? "",
    miktar: detail.miktar,
    birim: detail.birim ?? "",
    planlananTeslimTarihi: formatDateLabel(detail.planlananTeslimTarihi),
    sorumluPersonel: detail.sorumluPersonel,
    durum: "Tamamlanmadı",
    createdAt: detail.createdAt,
  });

  if (!result.synced) {
    console.warn("[is-emri sheets] create sync failed:", result.error);
  }

  return result;
}

async function syncWorkOrderCompleteToSheets(detail: WorkOrderDetail) {
  const sheetName = workOrderSheetNameFromTarih(detail.tarih);
  const result = await syncWorkOrderToGoogleSheets({
    action: "complete",
    workOrderId: detail.id,
    sheetName,
    tarih: detail.tarih,
  });

  if (!result.synced) {
    console.warn("[is-emri sheets] complete sync failed:", result.error);
  }

  return result;
}

export async function updateWorkOrderCompletionStatus(
  id: string,
  completionStatus: WorkOrderCompletionStatus,
): Promise<WorkOrderDetail> {
  const existing = await getWorkOrderById(id);

  if (
    existing.completionStatus === "completed" &&
    completionStatus === "incomplete"
  ) {
    throw new Error("Tamamlanan iş emri geri alınamaz");
  }

  if (
    existing.completionStatus === "completed" &&
    completionStatus === "completed"
  ) {
    return existing;
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("work_orders")
    .update({
      completion_status: completionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`İş emri durumu güncellenemedi: ${error.message}`);
  }

  const updated = await getWorkOrderById(id);

  if (completionStatus === "completed") {
    await syncWorkOrderCompleteToSheets(updated);
  }

  return updated;
}

export async function markWorkOrderWhatsAppSent(
  id: string,
): Promise<WorkOrderDetail> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("work_orders")
    .update({
      whatsapp_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`WhatsApp gönderim kaydı güncellenemedi: ${error.message}`);
  }

  return getWorkOrderById(id);
}

export async function deleteWorkOrder(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: attachments } = await supabase
    .from("work_order_attachments")
    .select("file_path")
    .eq("work_order_id", id);

  if (attachments?.length) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(attachments.map((item) => item.file_path));
  }

  const { error } = await supabase.from("work_orders").delete().eq("id", id);

  if (error) {
    throw new Error(`İş emri silinemedi: ${error.message}`);
  }
}

interface CreateWorkOrderContext {
  userId: string;
  appBaseUrl: string;
}

export interface WorkOrderImageUpload {
  file: File;
  category: AttachmentCategory;
}

export interface CreateWorkOrderResult {
  id: string;
  productUrls: string[];
  technicalUrls: string[];
  sheetsSynced?: boolean;
  sheetsError?: string;
}

async function ensureStorageBucket(): Promise<void> {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Storage bucket listelenemedi: ${listError.message}`);
  }

  if (buckets?.some((bucket) => bucket.id === STORAGE_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    STORAGE_BUCKET,
    { public: true },
  );

  if (createError && !createError.message.toLowerCase().includes("already")) {
    throw new Error(`Storage bucket oluşturulamadı: ${createError.message}`);
  }
}

async function uploadWorkOrderImages(
  workOrderId: string,
  images: WorkOrderImageUpload[],
  appBaseUrl: string,
): Promise<{ productUrls: string[]; technicalUrls: string[] }> {
  if (images.length === 0) {
    return { productUrls: [], technicalUrls: [] };
  }

  await ensureStorageBucket();

  const supabase = createAdminClient();
  const productUrls: string[] = [];
  const technicalUrls: string[] = [];

  for (const image of images) {
    const safeName = image.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${workOrderId}/${image.category}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, image.file, {
        contentType: image.file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Görsel yüklenemedi: ${uploadError.message}`);
    }

    let shortCode = createShortCode();
    let metaError: { message: string } | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { error } = await supabase.from("work_order_attachments").insert({
        work_order_id: workOrderId,
        category: image.category,
        file_name: image.file.name,
        file_path: filePath,
        mime_type: image.file.type || "image/jpeg",
        file_size: image.file.size,
        short_code: shortCode,
      });

      if (!error) {
        metaError = null;
        break;
      }

      // Unique short_code çakışması — yeni kod dene
      if (error.message.toLowerCase().includes("short_code") || error.code === "23505") {
        shortCode = createShortCode();
        metaError = error;
        continue;
      }

      metaError = error;
      break;
    }

    if (metaError) {
      throw new Error(
        `Görsel meta verisi kaydedilemedi: ${metaError.message}`,
      );
    }

    const shortUrl = buildShortImageUrl(appBaseUrl, shortCode);

    if (image.category === "product") {
      productUrls.push(shortUrl);
    } else {
      technicalUrls.push(shortUrl);
    }
  }

  return { productUrls, technicalUrls };
}

export async function createWorkOrder(
  values: WorkOrderFormValues,
  context: CreateWorkOrderContext,
  images: WorkOrderImageUpload[] = [],
): Promise<CreateWorkOrderResult> {
  const supabase = createAdminClient();
  const record = mapFormToWorkOrderRecord(values);

  const registryIds = [
    record.talep_eden_company_registry_id,
    record.uygulayici_company_registry_id,
  ].filter((id): id is string => Boolean(id));

  if (registryIds.length > 0) {
    const { data: cards, error: cardsError } = await supabase
      .from("company_registry")
      .select("id, short_name, legal_name")
      .in("id", registryIds);

    if (cardsError) {
      throw new Error(`Firma kartları doğrulanamadı: ${cardsError.message}`);
    }

    const byId = new Map(
      (cards ?? []).map((card) => [
        card.id as string,
        ((card.short_name as string) || (card.legal_name as string)).trim(),
      ]),
    );

    if (record.talep_eden_company_registry_id) {
      const name = byId.get(record.talep_eden_company_registry_id);
      if (!name) {
        throw new Error("Talep eden firma kartı bulunamadı");
      }
      record.talep_eden_firma = name;
    }

    if (record.uygulayici_company_registry_id) {
      const name = byId.get(record.uygulayici_company_registry_id);
      if (!name) {
        throw new Error("Uygulayıcı firma kartı bulunamadı");
      }
      record.uygulayici_firma = name;
    }
  }

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

  const { productUrls, technicalUrls } = await uploadWorkOrderImages(
    data.id,
    images,
    context.appBaseUrl,
  );

  const detail = await getWorkOrderById(data.id);
  const sheetsResult = await syncWorkOrderCreateToSheets(detail);

  return {
    id: data.id,
    productUrls,
    technicalUrls,
    sheetsSynced: sheetsResult.synced,
    sheetsError: sheetsResult.error,
  };
}
