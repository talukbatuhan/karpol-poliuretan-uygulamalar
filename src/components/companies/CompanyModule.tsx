"use client";

import { useMemo, useState } from "react";

import { CompanyDetailCard } from "@/components/companies/CompanyDetailCard";
import { CompanyListPanel } from "@/components/companies/CompanyListPanel";
import {
  createCompanyRecord,
  deleteCompanyRecord,
  getSeedCompanies,
  updateCompanyRecord,
} from "@/lib/data/company-repository";
import { getLookupOptions } from "@/lib/data/lookup-repository";
import type { CompanyFormInput } from "@/lib/validations/company-form";
import type { Company, CompanyStatus, CompanyType } from "@/types/company";
import { COMPANY_TYPE_OPTIONS } from "@/types/company";

function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function CompanyModule() {
  const [companies, setCompanies] = useState<Company[]>(() => getSeedCompanies());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CompanyStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | CompanyType>("");

  const cityOptions = useMemo(() => getLookupOptions("cities"), []);
  const companyTypeOptions = useMemo(
    () =>
      COMPANY_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [],
  );

  const cityLabelMap = useMemo(
    () => new Map(cityOptions.map((city) => [city.value, city.label])),
    [cityOptions],
  );

  const getCityLabel = (cityId: string) =>
    cityLabelMap.get(cityId) ?? "—";

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());

    return companies.filter((company) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(company.shortName).includes(normalizedSearch) ||
        normalizeSearch(company.legalName).includes(normalizedSearch) ||
        normalizeSearch(company.companyCode).includes(normalizedSearch);

      const matchesCity = !cityFilter || company.cityId === cityFilter;
      const matchesStatus = !statusFilter || company.status === statusFilter;
      const matchesType = !typeFilter || company.companyType === typeFilter;

      return matchesSearch && matchesCity && matchesStatus && matchesType;
    });
  }, [companies, search, cityFilter, statusFilter, typeFilter]);

  const selectedCompany =
    companies.find((company) => company.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleSave = (values: CompanyFormInput) => {
    if (isCreating) {
      const created = createCompanyRecord(values, companies);
      setCompanies((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setIsCreating(false);
      return;
    }

    if (!selectedCompany) return;

    const updated = updateCompanyRecord(selectedCompany, values);
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === updated.id ? updated : company,
      ),
    );
  };

  const handleDelete = () => {
    if (!selectedCompany) return;

    const confirmed = window.confirm(
      `"${selectedCompany.shortName}" firmasını silmek istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    setCompanies((prev) => deleteCompanyRecord(prev, selectedCompany.id));
    setSelectedId(null);
    setIsCreating(false);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,2fr)_minmax(360px,3fr)] lg:items-start">
      <CompanyListPanel
        companies={filteredCompanies}
        cityOptions={cityOptions}
        companyTypeOptions={COMPANY_TYPE_OPTIONS}
        selectedId={selectedId}
        search={search}
        cityFilter={cityFilter}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        getCityLabel={getCityLabel}
        onSearchChange={setSearch}
        onCityFilterChange={setCityFilter}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        onSelect={handleSelect}
        onCreateNew={handleCreateNew}
      />

      <CompanyDetailCard
        company={selectedCompany}
        isCreating={isCreating}
        cityOptions={cityOptions}
        companyTypeOptions={companyTypeOptions}
        onSave={handleSave}
        onCancelCreate={handleCancelCreate}
        onDelete={handleDelete}
      />
    </div>
  );
}
