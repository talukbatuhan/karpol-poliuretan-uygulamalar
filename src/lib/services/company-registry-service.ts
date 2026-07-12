import { createAdminClient } from "@/lib/supabase/admin";
import type { CompanyFormInput } from "@/lib/validations/company-form";
import type { Company, CompanyStatus, CompanyType } from "@/types/company";

interface CompanyRegistryRow {
  id: string;
  company_code: string;
  legal_name: string;
  short_name: string;
  company_type: CompanyType;
  contact_person: string | null;
  phone: string | null;
  mobile_phone: string | null;
  email: string | null;
  website: string | null;
  city_id: string | null;
  district: string | null;
  address: string | null;
  status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: CompanyRegistryRow): Company {
  return {
    id: row.id,
    companyCode: row.company_code,
    legalName: row.legal_name,
    shortName: row.short_name,
    companyType: row.company_type,
    contactPerson: row.contact_person ?? "",
    phone: row.phone ?? "",
    mobilePhone: row.mobile_phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    cityId: row.city_id ?? "",
    district: row.district ?? "",
    address: row.address ?? "",
    status: row.status,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function generateCompanyCode(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("company_registry")
    .select("company_code")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Firma kodu okunamadı: ${error.message}`);
  }

  let maxNumber = 0;
  for (const row of data ?? []) {
    const match = String(row.company_code).match(/^FR-(\d+)$/);
    if (match) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
    }
  }

  return `FR-${String(maxNumber + 1).padStart(4, "0")}`;
}

export async function listCompanyCards(): Promise<Company[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("company_registry")
    .select("*")
    .order("short_name", { ascending: true });

  if (error) {
    throw new Error(`Firma kartları okunamadı: ${error.message}`);
  }

  return ((data ?? []) as CompanyRegistryRow[]).map(mapRow);
}

export async function listActiveCompanyCardOptions(): Promise<
  { value: string; label: string }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("company_registry")
    .select("id, short_name, legal_name")
    .eq("status", "active")
    .order("short_name", { ascending: true });

  if (error) {
    throw new Error(`Firma kartları okunamadı: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    value: row.id as string,
    label: (row.short_name as string) || (row.legal_name as string),
  }));
}

export async function createCompanyCard(
  values: CompanyFormInput,
): Promise<Company> {
  const supabase = createAdminClient();
  const companyCode = await generateCompanyCode();

  const { data, error } = await supabase
    .from("company_registry")
    .insert({
      company_code: companyCode,
      legal_name: values.legalName,
      short_name: values.shortName,
      company_type: values.companyType,
      contact_person: values.contactPerson || null,
      phone: values.phone || null,
      mobile_phone: values.mobilePhone || null,
      email: values.email || null,
      website: values.website || null,
      city_id: values.cityId || null,
      district: values.district || null,
      address: values.address || null,
      status: values.status,
      notes: values.notes || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Firma kartı oluşturulamadı");
  }

  return mapRow(data as CompanyRegistryRow);
}

export async function updateCompanyCard(
  id: string,
  values: CompanyFormInput,
): Promise<Company> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("company_registry")
    .update({
      legal_name: values.legalName,
      short_name: values.shortName,
      company_type: values.companyType,
      contact_person: values.contactPerson || null,
      phone: values.phone || null,
      mobile_phone: values.mobilePhone || null,
      email: values.email || null,
      website: values.website || null,
      city_id: values.cityId || null,
      district: values.district || null,
      address: values.address || null,
      status: values.status,
      notes: values.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Firma kartı güncellenemedi");
  }

  return mapRow(data as CompanyRegistryRow);
}

export async function deleteCompanyCard(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("company_registry")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Firma kartı silinemedi: ${error.message}`);
  }
}
