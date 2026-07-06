import { createClient } from "@/lib/supabase/client";
import type { AddressLabel, AddressLabelFormData } from "@/types/address-label";

export async function fetchAddressLabels(
  search = "",
): Promise<AddressLabel[]> {
  const supabase = createClient();

  let query = supabase
    .from("address_labels")
    .select("*")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.ilike("company_title", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function saveAddressLabel(
  form: AddressLabelFormData,
): Promise<AddressLabel> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("address_labels")
    .insert({
      company_title: form.companyTitle.trim(),
      sender: form.sender.trim(),
      receiver: form.receiver.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteAddressLabel(id: string): Promise<void> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("address_labels")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    throw new Error("Kayıt silinemedi. Yetki hatası olabilir.");
  }
}
