export type CompanyType =
  | "musteri"
  | "tedarikci"
  | "nakliye"
  | "is_ortagi"
  | "diger";

export type CompanyStatus = "active" | "inactive";

export interface Company {
  id: string;
  companyCode: string;
  legalName: string;
  shortName: string;
  companyType: CompanyType;
  contactPerson: string;
  phone: string;
  mobilePhone: string;
  email: string;
  website: string;
  cityId: string;
  district: string;
  address: string;
  status: CompanyStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanyFormValues = Omit<
  Company,
  "id" | "companyCode" | "createdAt" | "updatedAt"
>;

export const COMPANY_TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: "musteri", label: "Müşteri" },
  { value: "tedarikci", label: "Tedarikçi" },
  { value: "nakliye", label: "Nakliye Firması" },
  { value: "is_ortagi", label: "İş Ortağı" },
  { value: "diger", label: "Diğer" },
];

export const COMPANY_STATUS_OPTIONS: { value: CompanyStatus; label: string }[] =
  [
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Pasif" },
  ];

export function getCompanyTypeLabel(type: CompanyType): string {
  return COMPANY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getCompanyStatusLabel(status: CompanyStatus): string {
  return (
    COMPANY_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}
