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

  const imageUrls: string[] = [];

  for (const image of images) {
    const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${record.id}/${Date.now()}-${safeName}`;

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
        conta_record_id: record.id,
        file_name: image.name,
        file_path: filePath,
        mime_type: image.type,
        file_size: image.size,
      });

    if (attachmentError) {
      throw new Error(`Görsel meta verisi kaydedilemedi: ${attachmentError.message}`);
    }
  }

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
