import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getLookupIds } from "@/lib/data/lookup-repository";
import {
  COMPANY_STATUS_OPTIONS,
  COMPANY_TYPE_OPTIONS,
} from "@/types/company";

const cityIds = getLookupIds("cities");
const companyTypes = COMPANY_TYPE_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];
const companyStatuses = COMPANY_STATUS_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];

export const companyFormSchema = z.object({
  legalName: z.string().min(1, "Firma ünvanı gereklidir"),
  shortName: z.string().min(1, "Kısa firma adı gereklidir"),
  companyType: z.enum(companyTypes, { error: "Firma türü seçiniz" }),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  email: z
    .string()
    .email("Geçerli bir e-posta giriniz")
    .optional()
    .or(z.literal("")),
  website: z.string().optional(),
  cityId: z
    .string()
    .refine((value) => value === "" || cityIds.includes(value), {
      message: "Şehir seçiniz",
    }),
  district: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(companyStatuses, { error: "Durum seçiniz" }),
  notes: z.string().optional(),
});

export const companyFormResolver = zodResolver(companyFormSchema);

export type CompanyFormInput = z.infer<typeof companyFormSchema>;
