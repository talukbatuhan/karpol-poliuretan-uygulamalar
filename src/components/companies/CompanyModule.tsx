"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CompanyDetailCard } from "@/components/companies/CompanyDetailCard";
import { CompanyListPanel } from "@/components/companies/CompanyListPanel";
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CompanyStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | CompanyType>("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const cityOptions = useMemo(() => getLookupOptions("cities"), []);
  const companyTypeOptions = useMemo(
    () =>
      COMPANY_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [],
  );

  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await fetch("/api/is-takip/me");
        const data = await response.json();
        if (response.ok) {
          setIsAdmin(Boolean(data.isAdmin));
        }
      } catch {
        setIsAdmin(false);
      }
    };

    void loadMe();
  }, []);

  const cityLabelMap = useMemo(
    () => new Map(cityOptions.map((city) => [city.value, city.label])),
    [cityOptions],
  );

  const getCityLabel = (cityId: string) => cityLabelMap.get(cityId) ?? "—";

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const response = await fetch("/api/firmalar");
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error ?? "Firma kartları yüklenemedi");
        setCompanies([]);
        return;
      }

      setCompanies(data.records ?? []);
    } catch {
      setListError("Firma kartları yüklenemedi");
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

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
    setSaveError(null);
  };

  const handleCreateNew = () => {
    if (!isAdmin) return;
    setSelectedId(null);
    setIsCreating(true);
    setSaveError(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSaveError(null);
  };

  const handleSave = async (values: CompanyFormInput) => {
    setSaveError(null);

    try {
      if (isCreating) {
        const response = await fetch("/api/firmalar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await response.json();

        if (!response.ok) {
          setSaveError(data.error ?? "Firma kartı kaydedilemedi");
          return;
        }

        await loadCompanies();
        setSelectedId(data.record.id);
        setIsCreating(false);
        return;
      }

      if (!selectedCompany) return;

      const response = await fetch(`/api/firmalar/${selectedCompany.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error ?? "Firma kartı güncellenemedi");
        return;
      }

      await loadCompanies();
      setSelectedId(data.record.id);
    } catch {
      setSaveError("Sunucuya bağlanılamadı");
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    const confirmed = window.confirm(
      `"${selectedCompany.shortName}" firma kartını silmek istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    setSaveError(null);

    try {
      const response = await fetch(`/api/firmalar/${selectedCompany.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error ?? "Firma kartı silinemedi");
        return;
      }

      setSelectedId(null);
      setIsCreating(false);
      await loadCompanies();
    } catch {
      setSaveError("Firma kartı silinemedi");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {listError && (
        <p
          className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {listError}
        </p>
      )}
      {saveError && (
        <p
          className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {saveError}
        </p>
      )}
      {isLoading && (
        <p className="text-sm text-slate-500">Firma kartları yükleniyor...</p>
      )}

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
          canManage={isAdmin}
        />

        <CompanyDetailCard
          company={selectedCompany}
          isCreating={isCreating}
          canManage={isAdmin}
          cityOptions={cityOptions}
          companyTypeOptions={companyTypeOptions}
          onSave={(values) => void handleSave(values)}
          onCancelCreate={handleCancelCreate}
          onDelete={() => void handleDelete()}
        />
      </div>
    </div>
  );
}
