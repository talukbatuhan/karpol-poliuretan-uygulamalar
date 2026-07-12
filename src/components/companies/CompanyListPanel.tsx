import type { LookupOption } from "@/types/lookup";
import type { Company, CompanyStatus, CompanyType } from "@/types/company";
import {
  getCompanyStatusLabel,
  getCompanyTypeLabel,
} from "@/types/company";

import { sharpInputClassName } from "@/components/form/SharpField";

interface CompanyListPanelProps {
  companies: Company[];
  cityOptions: LookupOption[];
  companyTypeOptions: { value: CompanyType; label: string }[];
  selectedId: string | null;
  search: string;
  cityFilter: string;
  statusFilter: "" | CompanyStatus;
  typeFilter: "" | CompanyType;
  getCityLabel: (cityId: string) => string;
  onSearchChange: (value: string) => void;
  onCityFilterChange: (value: string) => void;
  onStatusFilterChange: (value: "" | CompanyStatus) => void;
  onTypeFilterChange: (value: "" | CompanyType) => void;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  canManage?: boolean;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR");
}

export function CompanyListPanel({
  companies,
  cityOptions,
  companyTypeOptions,
  selectedId,
  search,
  cityFilter,
  statusFilter,
  typeFilter,
  getCityLabel,
  onSearchChange,
  onCityFilterChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onSelect,
  onCreateNew,
  canManage = false,
}: CompanyListPanelProps) {
  return (
    <div className="flex h-full flex-col border border-black bg-white">
      <div className="border-b border-black px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
            Firma Kartları
          </h2>
          {canManage && (
            <button
              type="button"
              onClick={onCreateNew}
              className="border border-black bg-navy px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white hover:bg-navy-light"
            >
              + Yeni Kart
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 border-b border-black p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Firma adına göre ara..."
          className={sharpInputClassName}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            value={cityFilter}
            onChange={(event) => onCityFilterChange(event.target.value)}
            className={sharpInputClassName}
          >
            <option value="">Tüm şehirler</option>
            {cityOptions.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(event) =>
              onTypeFilterChange(event.target.value as "" | CompanyType)
            }
            className={sharpInputClassName}
          >
            <option value="">Tüm firma türleri</option>
            {companyTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as "" | CompanyStatus)
            }
            className={sharpInputClassName}
          >
            <option value="">Tüm durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {companies.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Kriterlere uygun firma bulunamadı.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-black bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Firma Adı
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:table-cell">
                  Şehir
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 lg:table-cell">
                  Firma Türü
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 lg:table-cell">
                  Yetkili
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 xl:table-cell">
                  Telefon
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  onClick={() => onSelect(company.id)}
                  className={`cursor-pointer border-b border-slate-200 transition-colors hover:bg-slate-50 ${
                    selectedId === company.id ? "bg-slate-100" : ""
                  }`}
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-charcoal">{company.shortName}</p>
                    <p className="mt-0.5 text-xs text-slate-500 md:hidden">
                      {getCityLabel(company.cityId)} ·{" "}
                      {formatDate(company.createdAt)}
                    </p>
                  </td>
                  <td className="hidden px-3 py-3 text-slate-600 md:table-cell">
                    {getCityLabel(company.cityId)}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-600 lg:table-cell">
                    {getCompanyTypeLabel(company.companyType)}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-600 lg:table-cell">
                    {company.contactPerson || "—"}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-600 xl:table-cell">
                    {company.phone || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        company.status === "active"
                          ? "border-navy text-navy"
                          : "border-slate-400 text-slate-500"
                      }`}
                    >
                      {getCompanyStatusLabel(company.status)}
                    </span>
                    <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                      {formatDate(company.createdAt)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
