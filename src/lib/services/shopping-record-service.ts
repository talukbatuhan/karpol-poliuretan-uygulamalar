import { createAdminClient } from "@/lib/supabase/admin";
import { parseShoppingPrice } from "@/lib/validations/shopping-record-form";
import type { ShoppingRecordFormValues } from "@/lib/validations/shopping-record-form";
import type {
  ShoppingRecord,
  ShoppingRecordDetail,
  ShoppingRecordFile,
} from "@/types/shopping-record";

const STORAGE_BUCKET = "shopping-files";
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

interface ShoppingRecordRow {
  id: string;
  user_id: string;
  product_name: string;
  store: string;
  price: number | null;
  purchase_date: string;
  category: string;
  notes: string;
  created_at: string;
  updated_at: string;
  shopping_record_files?: {
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
  }[];
}

function getPublicUrl(filePath: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

function mapFile(row: {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
}): ShoppingRecordFile {
  return {
    id: row.id,
    fileName: row.file_name,
    url: getPublicUrl(row.file_path),
    mimeType: row.mime_type,
  };
}

function mapRecord(row: ShoppingRecordRow): ShoppingRecord {
  const files = row.shopping_record_files ?? [];
  const cover = files.find((file) => file.mime_type.startsWith("image/")) ?? files[0];

  return {
    id: row.id,
    productName: row.product_name,
    store: row.store,
    price: row.price,
    purchaseDate: row.purchase_date,
    category: row.category,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fileCount: files.length,
    coverFileUrl: cover ? getPublicUrl(cover.file_path) : null,
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function uploadRecordFiles(
  userId: string,
  recordId: string,
  files: File[],
): Promise<void> {
  if (files.length === 0) return;

  const supabase = createAdminClient();

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`Desteklenmeyen dosya türü: ${file.name}`);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${userId}/${recordId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Dosya yüklenemedi: ${uploadError.message}`);
    }

    const { error: attachmentError } = await supabase
      .from("shopping_record_files")
      .insert({
        record_id: recordId,
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type,
        file_size: file.size,
      });

    if (attachmentError) {
      throw new Error(`Dosya meta verisi kaydedilemedi: ${attachmentError.message}`);
    }
  }
}

async function removeRecordFiles(fileIds: string[], userId: string): Promise<void> {
  if (fileIds.length === 0) return;

  const supabase = createAdminClient();

  const { data: files, error } = await supabase
    .from("shopping_record_files")
    .select("id, file_path, record_id")
    .in("id", fileIds);

  if (error) {
    throw new Error(`Dosyalar okunamadı: ${error.message}`);
  }

  if (!files?.length) return;

  const recordIds = [...new Set(files.map((file) => file.record_id))];
  const { data: records } = await supabase
    .from("shopping_records")
    .select("id")
    .in("id", recordIds)
    .eq("user_id", userId);

  const ownedRecordIds = new Set(records?.map((record) => record.id) ?? []);
  const ownedFiles = files.filter((file) => ownedRecordIds.has(file.record_id));

  if (ownedFiles.length === 0) return;

  await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(ownedFiles.map((file) => file.file_path));

  const { error: deleteError } = await supabase
    .from("shopping_record_files")
    .delete()
    .in(
      "id",
      ownedFiles.map((file) => file.id),
    );

  if (deleteError) {
    throw new Error(`Dosyalar silinemedi: ${deleteError.message}`);
  }
}

export async function listShoppingRecords(
  userId: string,
  search = "",
): Promise<ShoppingRecord[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("shopping_records")
    .select(
      "id, user_id, product_name, store, price, purchase_date, category, notes, created_at, updated_at, shopping_record_files(id, file_name, file_path, mime_type)",
    )
    .eq("user_id", userId)
    .order("purchase_date", { ascending: false });

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    const pattern = `%${escapeIlike(trimmedSearch)}%`;
    query = query.or(
      `product_name.ilike.${pattern},store.ilike.${pattern},category.ilike.${pattern},notes.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Kayıtlar okunamadı: ${error.message}`);
  }

  return (data as ShoppingRecordRow[]).map(mapRecord);
}

export async function getShoppingRecordById(
  userId: string,
  id: string,
): Promise<ShoppingRecordDetail> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("shopping_records")
    .select(
      "id, user_id, product_name, store, price, purchase_date, category, notes, created_at, updated_at, shopping_record_files(id, file_name, file_path, mime_type)",
    )
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kayıt bulunamadı");
  }

  const row = data as ShoppingRecordRow;

  return {
    ...mapRecord(row),
    files: (row.shopping_record_files ?? []).map(mapFile),
  };
}

export async function createShoppingRecord(
  userId: string,
  form: ShoppingRecordFormValues,
  files: File[] = [],
): Promise<ShoppingRecordDetail> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("shopping_records")
    .insert({
      user_id: userId,
      product_name: form.productName,
      store: form.store ?? "",
      price: parseShoppingPrice(form.price ?? ""),
      purchase_date: form.purchaseDate,
      category: form.category ?? "",
      notes: form.notes ?? "",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kayıt oluşturulamadı");
  }

  await uploadRecordFiles(userId, data.id, files);
  return getShoppingRecordById(userId, data.id);
}

export async function updateShoppingRecord(
  userId: string,
  id: string,
  form: ShoppingRecordFormValues,
  files: File[] = [],
  removedFileIds: string[] = [],
): Promise<ShoppingRecordDetail> {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("shopping_records")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (existingError || !existing) {
    throw new Error("Kayıt bulunamadı");
  }

  const { error } = await supabase
    .from("shopping_records")
    .update({
      product_name: form.productName,
      store: form.store ?? "",
      price: parseShoppingPrice(form.price ?? ""),
      purchase_date: form.purchaseDate,
      category: form.category ?? "",
      notes: form.notes ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message ?? "Kayıt güncellenemedi");
  }

  await removeRecordFiles(removedFileIds, userId);
  await uploadRecordFiles(userId, id, files);

  return getShoppingRecordById(userId, id);
}

export async function deleteShoppingRecord(
  userId: string,
  id: string,
): Promise<void> {
  const supabase = createAdminClient();

  const { data: record, error: recordError } = await supabase
    .from("shopping_records")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (recordError || !record) {
    throw new Error("Kayıt bulunamadı");
  }

  const { data: files } = await supabase
    .from("shopping_record_files")
    .select("file_path")
    .eq("record_id", id);

  if (files?.length) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(files.map((file) => file.file_path));
  }

  const { error } = await supabase
    .from("shopping_records")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Kayıt silinemedi: ${error.message}`);
  }
}
