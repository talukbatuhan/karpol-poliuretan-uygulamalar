import { SEED_COMPANY_REGISTRY } from "@/lib/data/seed/companies";
import type { CompanyFormInput } from "@/lib/validations/company-form";
import type { Company } from "@/types/company";

export function getSeedCompanies(): Company[] {
  return [...SEED_COMPANY_REGISTRY];
}

export function generateCompanyCode(companies: Company[]): string {
  const maxNumber = companies.reduce((max, company) => {
    const match = company.companyCode.match(/^FR-(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number.parseInt(match[1], 10));
  }, 0);

  return `FR-${String(maxNumber + 1).padStart(4, "0")}`;
}

export function createCompanyRecord(
  values: CompanyFormInput,
  companies: Company[],
): Company {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    companyCode: generateCompanyCode(companies),
    legalName: values.legalName,
    shortName: values.shortName,
    companyType: values.companyType as Company["companyType"],
    contactPerson: values.contactPerson ?? "",
    phone: values.phone ?? "",
    mobilePhone: values.mobilePhone ?? "",
    email: values.email ?? "",
    website: values.website ?? "",
    cityId: values.cityId,
    district: values.district ?? "",
    address: values.address ?? "",
    status: values.status as Company["status"],
    notes: values.notes ?? "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateCompanyRecord(
  existing: Company,
  values: CompanyFormInput,
): Company {
  return {
    ...existing,
    legalName: values.legalName,
    shortName: values.shortName,
    companyType: values.companyType as Company["companyType"],
    contactPerson: values.contactPerson ?? "",
    phone: values.phone ?? "",
    mobilePhone: values.mobilePhone ?? "",
    email: values.email ?? "",
    website: values.website ?? "",
    cityId: values.cityId,
    district: values.district ?? "",
    address: values.address ?? "",
    status: values.status as Company["status"],
    notes: values.notes ?? "",
    updatedAt: new Date().toISOString(),
  };
}

export function deleteCompanyRecord(
  companies: Company[],
  companyId: string,
): Company[] {
  return companies.filter((company) => company.id !== companyId);
}
