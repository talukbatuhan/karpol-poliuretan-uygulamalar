"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormSection } from "@/components/form/FormSection";
import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { SharpImageUploadZone } from "@/components/form/SharpImageUploadZone";
import { SharpSearchableSelect } from "@/components/form/SharpSearchableSelect";
import { getTodayDateString } from "@/lib/utils/date";
import { workOrderFormResolver } from "@/lib/validations/work-order-form";
import type { LookupOption } from "@/types/lookup";
import type { WorkOrderFormValues } from "@/types/work-order";
import {
  revokeAttachments,
  type WorkOrderAttachment,
} from "@/types/attachment";

interface LookupData {
  companies: LookupOption[];
  jobTypes: LookupOption[];
  personnel: LookupOption[];
  cities: LookupOption[];
  cargoCompanies: LookupOption[];
  units: LookupOption[];
}

const EMPTY_LOOKUPS: LookupData = {
  companies: [],
  jobTypes: [],
  personnel: [],
  cities: [],
  cargoCompanies: [],
  units: [],
};

function getDefaultValues(): Partial<WorkOrderFormValues> {
  return {
    tarih: getTodayDateString(),
    sehirId: "",
    talepEdenFirmaId: "",
    uygulayiciFirmaId: "",
    isTuruId: "",
    isAciklamasi: "",
    birimId: "",
    planlananTeslimTarihi: "",
    kargoFirmasiId: "",
    talebiOlusturanPersonelId: "",
    sorumluPersonelId: "",
    notlar: "",
  };
}

export function SharpForm() {
  const [lookups, setLookups] = useState<LookupData>(EMPTY_LOOKUPS);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [whatsappInfo, setWhatsappInfo] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<WorkOrderAttachment[]>([]);

  const loadLookups = useCallback(async () => {
    setLookupsLoading(true);
    setLookupsError(null);

    try {
      const response = await fetch("/api/is-takip/lookups", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setLookupsError(data.error ?? "Form listeleri yüklenemedi");
        setLookups(EMPTY_LOOKUPS);
        return;
      }

      setLookups({
        companies: data.companies ?? [],
        jobTypes: data.jobTypes ?? [],
        personnel: data.personnel ?? [],
        cities: data.cities ?? [],
        cargoCompanies: data.cargoCompanies ?? [],
        units: data.units ?? [],
      });
    } catch {
      setLookupsError("Form listeleri yüklenemedi");
      setLookups(EMPTY_LOOKUPS);
    } finally {
      setLookupsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderFormValues>({
    resolver: workOrderFormResolver,
    defaultValues: getDefaultValues(),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: WorkOrderFormValues) => {
    setSubmitSuccess(null);
    setWhatsappInfo(null);
    setWhatsappUrl(null);

    try {
      const response = await fetch("/api/is-takip/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setLookupsError(result.error ?? "Kayıt oluşturulamadı");
        return;
      }

      const { whatsappSent, whatsappError, whatsappUrl: waUrl } =
        result.result ?? {};

      setSubmitSuccess("İş kaydı başarıyla oluşturuldu.");
      if (whatsappSent) {
        setWhatsappInfo("Sorumlu personele WhatsApp mesajı gönderildi.");
      } else if (whatsappError) {
        setWhatsappInfo(whatsappError);
        if (waUrl) setWhatsappUrl(waUrl);
      }

      revokeAttachments(attachments);
      setAttachments([]);
      reset(getDefaultValues());
      setLookupsError(null);
    } catch {
      setLookupsError("Kayıt oluşturulamadı");
    }
  };

  if (lookupsLoading) {
    return (
      <div className="border border-black bg-white p-6 text-sm text-slate-500">
        Form yükleniyor...
      </div>
    );
  }

  return (
    <div className="border border-black bg-white">
      <div className="border-b border-black px-4 py-4 md:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
          Yeni İş Kaydı
        </h2>
      </div>

      <form
        onSubmit={handleSubmit((data) => void onSubmit(data))}
        className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6"
        noValidate
      >
        {lookupsError && (
          <p
            className="col-span-full border-l-2 border-red-700 pl-2 text-sm text-red-700"
            role="alert"
          >
            {lookupsError}
          </p>
        )}

        <FormSection title="Genel Bilgiler">
          <SharpField label="Tarih" htmlFor="tarih" error={errors.tarih?.message}>
            <input
              id="tarih"
              type="date"
              readOnly
              className={`${sharpInputClassName} bg-slate-50`}
              {...register("tarih")}
            />
          </SharpField>

          <SharpField label="Şehir" htmlFor="sehirId" error={errors.sehirId?.message}>
            <Controller
              name="sehirId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="sehirId"
                  options={lookups.cities}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.sehirId}
                />
              )}
            />
          </SharpField>

          <SharpField
            label="Talep Eden Firma"
            htmlFor="talepEdenFirmaId"
            error={errors.talepEdenFirmaId?.message}
            required
          >
            <Controller
              name="talepEdenFirmaId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="talepEdenFirmaId"
                  options={lookups.companies}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.talepEdenFirmaId}
                />
              )}
            />
          </SharpField>

          <SharpField
            label="Uygulayıcı Firma"
            htmlFor="uygulayiciFirmaId"
            error={errors.uygulayiciFirmaId?.message}
            required
          >
            <Controller
              name="uygulayiciFirmaId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="uygulayiciFirmaId"
                  options={lookups.companies}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.uygulayiciFirmaId}
                />
              )}
            />
          </SharpField>

          <SharpField
            label="İş Türü"
            htmlFor="isTuruId"
            error={errors.isTuruId?.message}
            required
          >
            <Controller
              name="isTuruId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="isTuruId"
                  options={lookups.jobTypes}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.isTuruId}
                />
              )}
            />
          </SharpField>

          <SharpField
            label="İş Açıklaması"
            htmlFor="isAciklamasi"
            error={errors.isAciklamasi?.message}
            fullWidth
          >
            <input
              id="isAciklamasi"
              type="text"
              placeholder="İş tanımı ve detayları"
              className={sharpInputClassName}
              {...register("isAciklamasi")}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Üretim / Sipariş Bilgileri">
          <SharpField
            label="Miktar"
            htmlFor="miktar"
            error={errors.miktar?.message}
            required
          >
            <input
              id="miktar"
              type="number"
              min={0}
              step="any"
              placeholder="0"
              className={sharpInputClassName}
              {...register("miktar", { valueAsNumber: true })}
            />
          </SharpField>

          <SharpField label="Birim" htmlFor="birimId" error={errors.birimId?.message}>
            <Controller
              name="birimId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="birimId"
                  options={lookups.units}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.birimId}
                />
              )}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Lojistik Bilgileri">
          <SharpField
            label="Planlanan Teslim Tarihi"
            htmlFor="planlananTeslimTarihi"
            error={errors.planlananTeslimTarihi?.message}
          >
            <input
              id="planlananTeslimTarihi"
              type="date"
              className={sharpInputClassName}
              {...register("planlananTeslimTarihi")}
            />
          </SharpField>

          <SharpField
            label="Kargo Firması"
            htmlFor="kargoFirmasiId"
            error={errors.kargoFirmasiId?.message}
          >
            <Controller
              name="kargoFirmasiId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="kargoFirmasiId"
                  options={lookups.cargoCompanies}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.kargoFirmasiId}
                />
              )}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Sorumluluk Bilgileri">
          <SharpField
            label="Talebi Oluşturan Personel"
            htmlFor="talebiOlusturanPersonelId"
            error={errors.talebiOlusturanPersonelId?.message}
          >
            <Controller
              name="talebiOlusturanPersonelId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="talebiOlusturanPersonelId"
                  options={lookups.personnel}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.talebiOlusturanPersonelId}
                />
              )}
            />
          </SharpField>

          <SharpField
            label="Sorumlu Personel"
            htmlFor="sorumluPersonelId"
            error={errors.sorumluPersonelId?.message}
            required
          >
            <Controller
              name="sorumluPersonelId"
              control={control}
              render={({ field }) => (
                <SharpSearchableSelect
                  id="sorumluPersonelId"
                  options={lookups.personnel}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.sorumluPersonelId}
                />
              )}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Görsel Dosyalar" layout="stack">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SharpImageUploadZone
              id="urunGorselleri"
              label="Ürün Görselleri"
              hint="Ürün fotoğrafları ve referans görselleri"
              category="product"
              attachments={attachments}
              onChange={setAttachments}
            />
            <SharpImageUploadZone
              id="teknikGorseller"
              label="Teknik Görseller"
              hint="Teknik çizimler, şemalar ve ölçü görselleri"
              category="technical"
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>
        </FormSection>

        <FormSection title="Ek Bilgiler">
          <SharpField
            label="Notlar"
            htmlFor="notlar"
            error={errors.notlar?.message}
            fullWidth
          >
            <textarea
              id="notlar"
              rows={4}
              placeholder="Ek notlar ve açıklamalar..."
              className={`${sharpInputClassName} resize-y`}
              {...register("notlar")}
            />
          </SharpField>
        </FormSection>

        <div className="col-span-full border-t border-black pt-4">
          {submitSuccess && (
            <p
              className="mb-3 border border-navy bg-slate-100 px-3 py-2 text-sm text-navy"
              role="status"
            >
              {submitSuccess}
            </p>
          )}

          {whatsappInfo && (
            <p
              className={`mb-3 border px-3 py-2 text-sm ${
                whatsappInfo.includes("gönderildi")
                  ? "border-green-700 bg-green-50 text-green-800"
                  : "border-amber-700 bg-amber-50 text-amber-900"
              }`}
            >
              {whatsappInfo}
              {whatsappUrl && (
                <>
                  {" "}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    WhatsApp ile gönder
                  </a>
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet ve Bildir"}
          </button>
        </div>
      </form>
    </div>
  );
}
