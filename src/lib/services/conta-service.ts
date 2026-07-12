import {
  syncContaToGoogleSheets,
  type ContaSheetRow,
} from "@/lib/integrations/google-sheets";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContaFormValues } from "@/types/conta";

const STORAGE_BUCKET = "conta-images";

export async function getNextContaCode(): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("conta_records")
    .select("conta_code")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Conta kodu okunamadı: ${error.message}`);
  }

  let nextNumber = 1;
  const latestCode = data?.[0]?.conta_code as string | undefined;
  const match = latestCode?.match(/^CT-(\d+)$/);

  if (match) {
    nextNumber = Number.parseInt(match[1], 10) + 1;
  }

  return `CT-${String(nextNumber).padStart(4, "0")}`;
}

interface ContaRecordRow {
  id: string;
  conta_code: string;
  firma_ismi: string;
  marka: string;
  uzunluk: string;
  adet: number;
  renk: string;
  created_at: string;
  updated_at: string;
  conta_attachments?: { count: number }[];
}

function mapContaRecord(row: ContaRecordRow) {
  return {
    id: row.id,
    contaCode: row.conta_code,
    firmaIsmi: row.firma_ismi,
    marka: row.marka,
    uzunluk: row.uzunluk,
    adet: row.adet,
    renk: row.renk,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachmentCount: row.conta_attachments?.[0]?.count ?? 0,
  };
}

export async function listContaRecords() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("conta_records")
    .select(
      "id, conta_code, firma_ismi, marka, uzunluk, adet, renk, created_at, updated_at, conta_attachments(count)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Conta kayıtları okunamadı: ${error.message}`);
  }

  return (data as ContaRecordRow[]).map(mapContaRecord);
}

export async function getContaRecordById(id: string) {
  const supabase = createAdminClient();

  const { data: record, error } = await supabase
    .from("conta_records")
    .select(
      "id, conta_code, firma_ismi, marka, uzunluk, adet, renk, created_at, updated_at, conta_attachments(count)",
    )
    .eq("id", id)
    .single();

  if (error || !record) {
    throw new Error(error?.message ?? "Conta kaydı bulunamadı");
  }

  const { data: attachments, error: attachmentError } = await supabase
    .from("conta_attachments")
    .select("id, file_path")
    .eq("conta_record_id", id)
    .order("created_at", { ascending: true });

  if (attachmentError) {
    throw new Error(`Conta görselleri okunamadı: ${attachmentError.message}`);
  }

  const images =
    attachments?.map((attachment) => {
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(attachment.file_path);
      return {
        id: attachment.id as string,
        url: data.publicUrl,
        filePath: attachment.file_path as string,
      };
    }) ?? [];

  return {
    ...mapContaRecord(record as ContaRecordRow),
    imageUrls: images.map((image) => image.url),
    images,
  };
}

async function uploadContaImages(
  recordId: string,
  images: File[],
): Promise<string[]> {
  const supabase = createAdminClient();
  const imageUrls: string[] = [];

  for (const image of images) {
    const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${recordId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Görsel yüklenemedi: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    imageUrls.push(publicUrlData.publicUrl);

    const { error: attachmentError } = await supabase
      .from("conta_attachments")
      .insert({
        conta_record_id: recordId,
        file_name: image.name,
        file_path: filePath,
        mime_type: image.type,
        file_size: image.size,
      });

    if (attachmentError) {
      throw new Error(
        `Görsel meta verisi kaydedilemedi: ${attachmentError.message}`,
      );
    }
  }

  return imageUrls;
}

async function removeContaAttachments(attachmentIds: string[]): Promise<void> {
  if (attachmentIds.length === 0) return;

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("conta_attachments")
    .select("id, file_path")
    .in("id", attachmentIds);

  if (error) {
    throw new Error(`Görseller okunamadı: ${error.message}`);
  }

  const paths = (rows ?? []).map((row) => row.file_path as string);
  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }

  const { error: deleteError } = await supabase
    .from("conta_attachments")
    .delete()
    .in("id", attachmentIds);

  if (deleteError) {
    throw new Error(`Görseller silinemedi: ${deleteError.message}`);
  }
}

interface SaveContaInput {
  form: ContaFormValues;
  images: File[];
}

export interface SaveContaResult {
  id: string;
  contaCode: string;
  imageUrls: string[];
  sheetsSynced: boolean;
  sheetsError?: string;
}

export async function saveContaRecord({
  form,
  images,
}: SaveContaInput): Promise<SaveContaResult> {
  const supabase = createAdminClient();
  const contaCode = await getNextContaCode();

  const { data: record, error: insertError } = await supabase
    .from("conta_records")
    .insert({
      conta_code: contaCode,
      firma_ismi: form.firmaIsmi,
      marka: form.marka,
      uzunluk: form.uzunluk,
      adet: form.adet,
      renk: form.renk,
    })
    .select("id, conta_code, created_at")
    .single();

  if (insertError || !record) {
    throw new Error(insertError?.message ?? "Conta kaydı oluşturulamadı");
  }

  const imageUrls = await uploadContaImages(record.id, images);

  const sheetRow: ContaSheetRow = {
    contaCode: record.conta_code,
    firmaIsmi: form.firmaIsmi,
    marka: form.marka,
    uzunluk: form.uzunluk,
    adet: form.adet,
    renk: form.renk,
    gorselUrlList: imageUrls,
    gorselLinkleri: imageUrls.join("\n"),
    createdAt: record.created_at as string,
    supabaseId: record.id,
  };

  const sheetsResult = await syncContaToGoogleSheets(sheetRow);
  let sheetsSynced = sheetsResult.synced;
  let sheetsError = sheetsResult.error;

  if (
    sheetsSynced &&
    imageUrls.length > 0 &&
    sheetsResult.gorselCount === 0
  ) {
    sheetsSynced = false;
    sheetsError =
      "Google E-Tablolar görsel linklerini yazamadı. Apps Script kodunu güncelleyip yeni sürüm dağıtın.";
  }

  await supabase.from("conta_sync_log").insert({
    conta_record_id: record.id,
    target: "google_sheets",
    status: sheetsSynced ? "success" : "failed",
    error_message: sheetsError ?? null,
    synced_at: sheetsSynced ? new Date().toISOString() : null,
  });

  return {
    id: record.id,
    contaCode: record.conta_code,
    imageUrls,
    sheetsSynced,
    sheetsError,
  };
}

export async function updateContaRecord(
  id: string,
  form: ContaFormValues,
  images: File[] = [],
  removedAttachmentIds: string[] = [],
): Promise<SaveContaResult> {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("conta_records")
    .select("id, conta_code, created_at")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    throw new Error(existingError?.message ?? "Conta kaydı bulunamadı");
  }

  const { error: updateError } = await supabase
    .from("conta_records")
    .update({
      firma_ismi: form.firmaIsmi,
      marka: form.marka,
      uzunluk: form.uzunluk,
      adet: form.adet,
      renk: form.renk,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(`Conta kaydı güncellenemedi: ${updateError.message}`);
  }

  await removeContaAttachments(removedAttachmentIds);
  await uploadContaImages(id, images);

  const detail = await getContaRecordById(id);

  const sheetRow: ContaSheetRow = {
    contaCode: existing.conta_code,
    firmaIsmi: form.firmaIsmi,
    marka: form.marka,
    uzunluk: form.uzunluk,
    adet: form.adet,
    renk: form.renk,
    gorselUrlList: detail.imageUrls,
    gorselLinkleri: detail.imageUrls.join("\n"),
    createdAt: existing.created_at as string,
    supabaseId: id,
  };

  const sheetsResult = await syncContaToGoogleSheets(sheetRow);

  await supabase.from("conta_sync_log").insert({
    conta_record_id: id,
    target: "google_sheets",
    status: sheetsResult.synced ? "success" : "failed",
    error_message: sheetsResult.error ?? null,
    synced_at: sheetsResult.synced ? new Date().toISOString() : null,
  });

  return {
    id,
    contaCode: existing.conta_code,
    imageUrls: detail.imageUrls,
    sheetsSynced: sheetsResult.synced,
    sheetsError: sheetsResult.error,
  };
}

export async function deleteContaRecord(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: attachments } = await supabase
    .from("conta_attachments")
    .select("file_path")
    .eq("conta_record_id", id);

  if (attachments?.length) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(attachments.map((item) => item.file_path));
  }

  const { error } = await supabase.from("conta_records").delete().eq("id", id);

  if (error) {
    throw new Error(`Conta kaydı silinemedi: ${error.message}`);
  }
}
