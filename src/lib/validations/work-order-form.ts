import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getLookupIds } from "@/lib/data/lookup-repository";

function asEnumValues(ids: string[]): [string, ...string[]] {
  return ids as [string, ...string[]];
}

function optionalLookup(ids: string[]) {
  return z
    .string()
    .refine((value) => value === "" || ids.includes(value), {
      message: "Geçersiz seçim",
    });
}

const cityIds = getLookupIds("cities");
const companyIds = getLookupIds("companies");
const cargoIds = getLookupIds("cargo_companies");
const personnelIds = getLookupIds("personnel");
const jobTypeIds = getLookupIds("job_types");
const unitIds = getLookupIds("units");

export const workOrderFormSchema = z.object({
  tarih: z.string().min(1, "Tarih gereklidir"),
  sehirId: optionalLookup(cityIds),
  talepEdenFirmaId: z.enum(asEnumValues(companyIds), {
    error: "Talep eden firma seçiniz",
  }),
  uygulayiciFirmaId: z.enum(asEnumValues(companyIds), {
    error: "Uygulayıcı firma seçiniz",
  }),
  isTuruId: z.enum(asEnumValues(jobTypeIds), {
    error: "İş türü seçiniz",
  }),
  isAciklamasi: z.string().optional(),
  miktar: z
    .number({ error: "Miktar gereklidir" })
    .positive("Miktar pozitif olmalıdır"),
  birimId: optionalLookup(unitIds),
  planlananTeslimTarihi: z.string().optional(),
  kargoFirmasiId: optionalLookup(cargoIds),
  talebiOlusturanPersonelId: optionalLookup(personnelIds),
  sorumluPersonelId: z.enum(asEnumValues(personnelIds), {
    error: "Sorumlu personel seçiniz",
  }),
  notlar: z.string().optional(),
});

export const workOrderFormResolver = zodResolver(workOrderFormSchema);
