"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormSection } from "@/components/form/FormSection";
import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { SharpSearchableSelect } from "@/components/form/SharpSearchableSelect";
import {
  companyFormResolver,
  type CompanyFormInput,
} from "@/lib/validations/company-form";
import type { LookupOption } from "@/types/lookup";
import type { Company } from "@/types/company";
import {
  COMPANY_STATUS_OPTIONS,
  COMPANY_TYPE_OPTIONS,
} from "@/types/company";

interface CompanyDetailCardProps {
  company: Company | null;
  isCreating: boolean;
  canManage?: boolean;
  cityOptions: LookupOption[];
  companyTypeOptions: LookupOption[];
  onSave: (values: CompanyFormInput) => void;
  onCancelCreate: () => void;
  onDelete: () => void;
}

function getFormDefaults(company: Company | null): CompanyFormInput {
  if (!company) {
    return {
      legalName: "",
      shortName: "",
      companyType: "musteri",
      contactPerson: "",
      phone: "",
      mobilePhone: "",
      email: "",
      website: "",
      cityId: "",
      district: "",
      address: "",
      status: "active",
      notes: "",
    };
  }

  return {
    legalName: company.legalName,
    shortName: company.shortName,
    companyType: company.companyType,
    contactPerson: company.contactPerson,
    phone: company.phone,
    mobilePhone: company.mobilePhone,
    email: company.email,
    website: company.website,
    cityId: company.cityId,
    district: company.district,
    address: company.address,
    status: company.status,
    notes: company.notes,
  };
}

export function CompanyDetailCard({
  company,
  isCreating,
  canManage = false,
  cityOptions,
  companyTypeOptions,
  onSave,
  onCancelCreate,
  onDelete,
}: CompanyDetailCardProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyFormInput>({
    resolver: companyFormResolver,
    defaultValues: getFormDefaults(company),
  });

  useEffect(() => {
    reset(getFormDefaults(company));
  }, [company, isCreating, reset]);

  if (!company && !isCreating) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center border border-black bg-white p-8 text-center">
        <div>
          <p className="text-sm font-medium text-charcoal">Firma Kartı</p>
          <p className="mt-2 text-sm text-slate-500">
            Listeden bir firma seçin veya yeni firma ekleyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black bg-white">
      <div className="border-b border-black px-4 py-4 md:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
              {isCreating ? "Yeni Firma" : "Firma Kartı"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Firma Kodu:{" "}
              <span className="font-medium text-charcoal">
                {isCreating ? "Otomatik oluşturulacak" : company?.companyCode}
              </span>
            </p>
          </div>
          {isCreating && (
            <button
              type="button"
              onClick={onCancelCreate}
              className="border border-black bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-charcoal hover:bg-slate-100"
            >
              İptal
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSave)}
        className="grid grid-cols-1 gap-4 p-4 md:p-6"
        noValidate
      >
        <FormSection title="Temel Bilgiler">
          <SharpField
            label="Firma Ünvanı"
            htmlFor="legalName"
            error={errors.legalName?.message}
            required
          >
            <input
              id="legalName"
              type="text"
              className={sharpInputClassName}
              {...register("legalName")}
            />
          </SharpField>

          <SharpField
            label="Kısa Firma Adı"
            htmlFor="shortName"
            error={errors.shortName?.message}
            required
          >
            <input
              id="shortName"
              type="text"
              className={sharpInputClassName}
              {...register("shortName")}
            />
          </SharpField>

          <SharpField
            label="Firma Türü"
            htmlFor="companyType"
            error={errors.companyType?.message}
            required
          >
            <Controller
              name="companyType"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="companyType"
                  options={companyTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Firma türü seçiniz"
                  aria-invalid={!!errors.companyType}
                />
              )}
            />
          </SharpField>
        </FormSection>

        <FormSection title="İletişim Bilgileri">
          <SharpField
            label="Yetkili Ad Soyad"
            htmlFor="contactPerson"
            error={errors.contactPerson?.message}
          >
            <input
              id="contactPerson"
              type="text"
              className={sharpInputClassName}
              {...register("contactPerson")}
            />
          </SharpField>

          <SharpField label="Telefon" htmlFor="phone" error={errors.phone?.message}>
            <input
              id="phone"
              type="tel"
              className={sharpInputClassName}
              {...register("phone")}
            />
          </SharpField>

          <SharpField
            label="Cep Telefonu"
            htmlFor="mobilePhone"
            error={errors.mobilePhone?.message}
          >
            <input
              id="mobilePhone"
              type="tel"
              className={sharpInputClassName}
              {...register("mobilePhone")}
            />
          </SharpField>

          <SharpField label="E-Posta" htmlFor="email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              className={sharpInputClassName}
              {...register("email")}
            />
          </SharpField>

          <SharpField
            label="Web Sitesi"
            htmlFor="website"
            error={errors.website?.message}
            fullWidth
          >
            <input
              id="website"
              type="url"
              placeholder="https://"
              className={sharpInputClassName}
              {...register("website")}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Adres Bilgileri">
          <SharpField label="Şehir" htmlFor="cityId" error={errors.cityId?.message}>
            <Controller
              name="cityId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="cityId"
                  options={cityOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.cityId}
                />
              )}
            />
          </SharpField>

          <SharpField label="İlçe" htmlFor="district" error={errors.district?.message}>
            <input
              id="district"
              type="text"
              className={sharpInputClassName}
              {...register("district")}
            />
          </SharpField>

          <SharpField
            label="Açık Adres"
            htmlFor="address"
            error={errors.address?.message}
            fullWidth
          >
            <textarea
              id="address"
              rows={3}
              className={`${sharpInputClassName} resize-y`}
              {...register("address")}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Durum Bilgileri">
          <SharpField label="Durum" htmlFor="status" error={errors.status?.message} required>
            <div className="flex gap-4">
              {COMPANY_STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-charcoal"
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="accent-navy"
                    {...register("status")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </SharpField>
        </FormSection>

        <FormSection title="Ek Bilgiler">
          <SharpField label="Notlar" htmlFor="notes" error={errors.notes?.message} fullWidth>
            <textarea
              id="notes"
              rows={4}
              className={`${sharpInputClassName} resize-y`}
              {...register("notes")}
            />
          </SharpField>
        </FormSection>

        <div className="col-span-full flex flex-col gap-3 border-t border-black pt-4 sm:flex-row sm:items-center sm:justify-between">
          {canManage ? (
            <>
              <button
                type="submit"
                disabled={isSubmitting || (!isCreating && !isDirty)}
                className="w-full border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
              >
                {isSubmitting
                  ? "Kaydediliyor..."
                  : isCreating
                    ? "Firmayı Kaydet"
                    : "Güncelle"}
              </button>

              {!isCreating && company && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full border border-red-700 bg-white px-4 py-3 text-sm font-medium uppercase tracking-wide text-red-700 transition-colors hover:bg-red-50 sm:w-auto"
                >
                  Firmayı Sil
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Firma kartlarını yalnızca yöneticiler düzenleyebilir.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
