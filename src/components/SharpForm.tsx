"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormSection } from "@/components/form/FormSection";
import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { SharpImageUploadZone } from "@/components/form/SharpImageUploadZone";
import { SharpSearchableSelect } from "@/components/form/SharpSearchableSelect";
import { getTodayDateString } from "@/lib/utils/date";
import { compressImageFile } from "@/lib/utils/compress-image";
import { openWorkOrderWhatsApp } from "@/lib/whatsapp/build-wa-me-url";
import { buildWorkOrderWhatsAppDraft } from "@/lib/whatsapp/build-work-order-draft";
import { buildWorkOrderWhatsAppMessage } from "@/lib/whatsapp/build-work-order-message";
import type { WorkOrderWhatsAppDraft } from "@/lib/whatsapp/types";
import { workOrderFormResolver } from "@/lib/validations/work-order-form";
import type { LookupOption } from "@/types/lookup";
import type { WorkOrderFormValues } from "@/types/work-order";
import {
  revokeAttachments,
  type WorkOrderAttachment,
} from "@/types/attachment";

interface LookupData {
  jobTypes: LookupOption[];
  personnel: LookupOption[];
  cities: LookupOption[];
  cargoCompanies: LookupOption[];
  units: LookupOption[];
}

const EMPTY_LOOKUPS: LookupData = {
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
    talepEdenFirma: "",
    uygulayiciFirma: "",
    talepEdenFirmaKartId: "",
    uygulayiciFirmaKartId: "",
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
  const [firmaKartlariOptions, setFirmaKartlariOptions] = useState<
    LookupOption[]
  >([]);
  const [useFirmaKartlari, setUseFirmaKartlari] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [whatsappDraft, setWhatsappDraft] =
    useState<WorkOrderWhatsAppDraft | null>(null);
  const [createdWorkOrderId, setCreatedWorkOrderId] = useState<string | null>(
    null,
  );
  const [whatsappHint, setWhatsappHint] = useState<string | null>(null);
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

  const loadFirmaKartlari = useCallback(async () => {
    try {
      const response = await fetch("/api/firmalar/options", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setFirmaKartlariOptions([]);
        return;
      }
      setFirmaKartlariOptions(data.options ?? []);
    } catch {
      setFirmaKartlariOptions([]);
    }
  }, []);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    if (useFirmaKartlari) {
      void loadFirmaKartlari();
    }
  }, [useFirmaKartlari, loadFirmaKartlari]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderFormValues>({
    resolver: workOrderFormResolver,
    defaultValues: getDefaultValues(),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const handleFirmaKartlariToggle = (checked: boolean) => {
    setUseFirmaKartlari(checked);
    setValue("talepEdenFirma", "");
    setValue("uygulayiciFirma", "");
    setValue("talepEdenFirmaKartId", "");
    setValue("uygulayiciFirmaKartId", "");
  };

  const onSubmit = async (data: WorkOrderFormValues) => {
    setSubmitSuccess(null);
    setWhatsappDraft(null);
    setCreatedWorkOrderId(null);
    setWhatsappHint(null);

    try {
      const productAttachments = attachments.filter(
        (item) => item.category === "product",
      );
      const technicalAttachments = attachments.filter(
        (item) => item.category === "technical",
      );

      const [compressedProduct, compressedTechnical] = await Promise.all([
        Promise.all(productAttachments.map((item) => compressImageFile(item.file))),
        Promise.all(
          technicalAttachments.map((item) => compressImageFile(item.file)),
        ),
      ]);

      const formData = new FormData();
      formData.append("payload", JSON.stringify(data));
      for (const file of compressedProduct) {
        formData.append("productImages", file);
      }
      for (const file of compressedTechnical) {
        formData.append("technicalImages", file);
      }

      const response = await fetch("/api/is-takip/work-orders", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setLookupsError(result.error ?? "Kayıt oluşturulamadı");
        return;
      }

      const draft = buildWorkOrderWhatsAppDraft(data, lookups, {
        productUrls: result.result?.productUrls ?? [],
        technicalUrls: result.result?.technicalUrls ?? [],
      });
      setSubmitSuccess("İş kaydı başarıyla oluşturuldu.");
      setCreatedWorkOrderId(result.result?.id ?? null);
      if (draft) {
        setWhatsappDraft(draft);
      } else {
        setWhatsappHint(
          "Sorumlu personelin telefonu tanımlı değil. Ayarlar → Personel’den WhatsApp telefonu ekleyin.",
        );
      }

      revokeAttachments(attachments);
      setAttachments([]);
      reset(getDefaultValues());
      setUseFirmaKartlari(false);
      setLookupsError(null);
    } catch {
      setLookupsError("Kayıt oluşturulamadı");
    }
  };

  const handleWhatsAppSend = () => {
    if (!whatsappDraft) return;
    const message = buildWorkOrderWhatsAppMessage(whatsappDraft);
    openWorkOrderWhatsApp(whatsappDraft.phone, message);

    if (createdWorkOrderId) {
      void fetch(`/api/is-takip/work-orders/${createdWorkOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappSent: true }),
      });
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black px-4 py-4 md:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
          Yeni İş Kaydı
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-charcoal">
          <input
            type="checkbox"
            checked={useFirmaKartlari}
            onChange={(event) => handleFirmaKartlariToggle(event.target.checked)}
            className="h-4 w-4 border border-black accent-navy"
          />
          <span className="font-medium uppercase tracking-wide">
            Firma kartlarından seç
          </span>
        </label>
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
            htmlFor="talepEdenFirma"
            error={errors.talepEdenFirma?.message}
            required
          >
            {useFirmaKartlari ? (
              <Controller
                name="talepEdenFirmaKartId"
                control={control}
                render={({ field }) => (
                  <SharpSearchableSelect
                    id="talepEdenFirma"
                    options={firmaKartlariOptions}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      const option = firmaKartlariOptions.find(
                        (item) => item.value === value,
                      );
                      setValue("talepEdenFirma", option?.label ?? "", {
                        shouldValidate: true,
                      });
                    }}
                    onBlur={field.onBlur}
                    placeholder="Firma kartı seçin"
                    aria-invalid={!!errors.talepEdenFirma}
                  />
                )}
              />
            ) : (
              <input
                id="talepEdenFirma"
                type="text"
                placeholder="Firma adını yazın"
                className={sharpInputClassName}
                {...register("talepEdenFirma")}
              />
            )}
          </SharpField>

          <SharpField
            label="Uygulayıcı Firma"
            htmlFor="uygulayiciFirma"
            error={errors.uygulayiciFirma?.message}
            required
          >
            {useFirmaKartlari ? (
              <Controller
                name="uygulayiciFirmaKartId"
                control={control}
                render={({ field }) => (
                  <SharpSearchableSelect
                    id="uygulayiciFirma"
                    options={firmaKartlariOptions}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      const option = firmaKartlariOptions.find(
                        (item) => item.value === value,
                      );
                      setValue("uygulayiciFirma", option?.label ?? "", {
                        shouldValidate: true,
                      });
                    }}
                    onBlur={field.onBlur}
                    placeholder="Firma kartı seçin"
                    aria-invalid={!!errors.uygulayiciFirma}
                  />
                )}
              />
            ) : (
              <input
                id="uygulayiciFirma"
                type="text"
                placeholder="Firma adını yazın"
                className={sharpInputClassName}
                {...register("uygulayiciFirma")}
              />
            )}
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

          {whatsappHint && (
            <p
              className="mb-3 border border-amber-700 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              role="status"
            >
              {whatsappHint}
            </p>
          )}

          {whatsappDraft && (
            <button
              type="button"
              onClick={handleWhatsAppSend}
              className="mb-3 w-full border border-black bg-white px-4 py-3 text-sm font-medium uppercase tracking-wide text-charcoal transition-colors hover:bg-slate-100"
            >
              WhatsApp&apos;tan Gönder
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Sıkıştırılıyor / kaydediliyor..."
              : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
