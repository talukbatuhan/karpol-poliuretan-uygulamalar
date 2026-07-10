import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";
import type {
  LookupItem,
  LookupItemInput,
  WorkOrderLookupType,
} from "@/types/work-order-lookup";

interface LookupRow {
  id: string;
  slug: string;
  name?: string;
  full_name?: string;
  phone?: string | null;
  is_active: boolean;
}

function mapRow(type: WorkOrderLookupType, row: LookupRow): LookupItem {
  return {
    id: row.id,
    slug: row.slug,
    label: type === "personnel" ? (row.full_name ?? "") : (row.name ?? ""),
    phone: type === "personnel" ? row.phone : undefined,
    isActive: row.is_active,
  };
}

function getNameColumn(type: WorkOrderLookupType): "name" | "full_name" {
  return type === "personnel" ? "full_name" : "name";
}

function getSelectColumns(type: WorkOrderLookupType): string {
  const nameColumn = getNameColumn(type);
  if (type === "personnel") {
    return `id, slug, ${nameColumn}, phone, is_active`;
  }
  return `id, slug, ${nameColumn}, is_active`;
}

export async function listWorkOrderLookups(
  type: WorkOrderLookupType,
  includeInactive = false,
): Promise<LookupItem[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from(type)
    .select(getSelectColumns(type))
    .order(type === "personnel" ? "full_name" : "name");

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Liste okunamadı: ${error.message}`);
  }

  return (data as unknown as LookupRow[]).map((row) => mapRow(type, row));
}

export async function createWorkOrderLookup(
  type: WorkOrderLookupType,
  input: LookupItemInput,
): Promise<LookupItem> {
  const supabase = createAdminClient();
  const label = input.label.trim();
  if (!label) throw new Error("Ad zorunludur");

  const baseSlug = slugify(label) || "kayit";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const payload: Record<string, unknown> = {
    slug,
    is_active: input.isActive ?? true,
  };

  if (type === "personnel") {
    payload.full_name = label;
    payload.phone = input.phone?.trim() || null;
  } else {
    payload.name = label;
  }

  const { data, error } = await supabase
    .from(type)
    .insert(payload)
    .select(getSelectColumns(type))
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kayıt oluşturulamadı");
  }

  return mapRow(type, data as unknown as LookupRow);
}

export async function updateWorkOrderLookup(
  type: WorkOrderLookupType,
  id: string,
  input: LookupItemInput,
): Promise<LookupItem> {
  const supabase = createAdminClient();
  const label = input.label.trim();
  if (!label) throw new Error("Ad zorunludur");

  const payload: Record<string, unknown> = {
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (type === "personnel") {
    payload.full_name = label;
    payload.phone = input.phone?.trim() || null;
  } else {
    payload.name = label;
  }

  const { data, error } = await supabase
    .from(type)
    .update(payload)
    .eq("id", id)
    .select(getSelectColumns(type))
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kayıt güncellenemedi");
  }

  return mapRow(type, data as unknown as LookupRow);
}

export async function deleteWorkOrderLookup(
  type: WorkOrderLookupType,
  id: string,
): Promise<void> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from(type).delete().eq("id", id).select("id");

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Bu kayıt iş emirlerinde kullanıldığı için silinemez. Önce ilgili iş kayıtlarını güncelleyin.",
      );
    }
    throw new Error(`Kayıt silinemedi: ${error.message}`);
  }

  if (!data?.length) {
    throw new Error("Kayıt bulunamadı");
  }
}

export async function getLookupLabelMap(
  type: WorkOrderLookupType,
  ids: string[],
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();

  const supabase = createAdminClient();
  const nameColumn = getNameColumn(type);

  const { data, error } = await supabase
    .from(type)
    .select(`id, ${nameColumn}`)
    .in("id", ids);

  if (error) {
    throw new Error(`Etiketler okunamadı: ${error.message}`);
  }

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const record = row as { id: string; name?: string; full_name?: string };
    map.set(record.id, type === "personnel" ? record.full_name ?? "" : record.name ?? "");
  }
  return map;
}

export async function getPersonnelPhone(personnelId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("personnel")
    .select("phone")
    .eq("id", personnelId)
    .single();

  if (error || !data) return null;
  return data.phone;
}
