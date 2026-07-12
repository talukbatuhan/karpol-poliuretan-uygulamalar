"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FormSection } from "@/components/form/FormSection";
import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { SharpImageUploadZone } from "@/components/form/SharpImageUploadZone";
import { contaFormResolver } from "@/lib/validations/conta-form";
import {
  revokeAttachments,
  type WorkOrderAttachment,
} from "@/types/attachment";
import type { ContaFormValues, ContaImage } from "@/types/conta";

function getDefaultValues(): Partial<ContaFormValues> {
  return {
    firmaIsmi: "",
    marka: "",
    uzunluk: "",
    renk: "",
  };
}

/** Varsayılan [] her render'da yeni referans üretir → useEffect döngüsü */
const EMPTY_EXISTING_IMAGES: ContaImage[] = [];

interface ContaFormProps {
  mode?: "create" | "edit";
  recordId?: string;
  initialValues?: ContaFormValues;
  contaCode?: string;
  existingImages?: ContaImage[];
  onSaved?: (payload: { id: string; contaCode: string }) => void;
  onCancel?: () => void;
}

export function ContaForm({
  mode = "create",
  recordId,
  initialValues,
  contaCode,
  existingImages = EMPTY_EXISTING_IMAGES,
  onSaved,
  onCancel,
}: ContaFormProps) {
  const isEdit = mode === "edit";
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastContaCode, setLastContaCode] = useState<string | null>(null);
  const [nextContaCode, setNextContaCode] = useState("CT-0001");
  const [sheetsWarning, setSheetsWarning] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<WorkOrderAttachment[]>([]);
  const [keptImages, setKeptImages] = useState<ContaImage[]>(existingImages);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContaFormValues>({
    resolver: contaFormResolver,
    defaultValues: initialValues ?? getDefaultValues(),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const loadNextCode = async () => {
    try {
      const response = await fetch("/api/conta/next-code");
      const data = await response.json();
      if (response.ok && data.nextCode) {
        setNextContaCode(data.nextCode);
      }
    } catch {
      // Supabase henüz yapılandırılmamışsa varsayılan kod gösterilir
    }
  };

  useEffect(() => {
    if (!isEdit) {
      void loadNextCode();
    }
  }, [isEdit]);

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  useEffect(() => {
    setKeptImages(existingImages);
    setRemovedAttachmentIds([]);
  }, [existingImages]);

  const removeExistingImage = (imageId: string) => {
    setKeptImages((current) => current.filter((image) => image.id !== imageId));
    setRemovedAttachmentIds((current) =>
      current.includes(imageId) ? current : [...current, imageId],
    );
  };

  const onSubmit = async (data: ContaFormValues) => {
    setSubmitError(null);
    setSheetsWarning(null);
    setSubmitSuccess(false);

    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify(
        isEdit ? { ...data, removedAttachmentIds } : data,
      ),
    );
    attachments.forEach((attachment) => {
      formData.append("images", attachment.file);
    });

    try {
      const response = await fetch(
        isEdit && recordId ? `/api/conta/${recordId}` : "/api/conta",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error ?? "Kayıt sırasında hata oluştu");
        return;
      }

      setLastContaCode(result.contaCode);
      setSubmitSuccess(true);

      if (!result.sheetsSynced && result.sheetsWarning) {
        setSheetsWarning(result.sheetsWarning);
      } else {
        setSheetsWarning(null);
      }

      revokeAttachments(attachments);
      setAttachments([]);
      if (!isEdit) {
        reset(getDefaultValues());
        await loadNextCode();
      }
      onSaved?.({ id: result.id, contaCode: result.contaCode });
    } catch {
      setSubmitError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    }
  };

  const displayCode = isEdit ? (contaCode ?? "—") : nextContaCode;

  return (
    <div className="border border-black bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-black px-4 py-4 md:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
          {isEdit ? "Conta Kaydını Düzenle" : "Yeni Conta Kaydı"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-black bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-charcoal hover:bg-slate-100"
          >
            İptal
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6"
        noValidate
      >
        <FormSection title="Kimlik Bilgileri">
          <SharpField label="Conta ID" htmlFor="contaId">
            <input
              id="contaId"
              type="text"
              readOnly
              value={displayCode}
              className={`${sharpInputClassName} bg-slate-50 font-medium`}
            />
          </SharpField>

          <SharpField
            label="Firma İsmi"
            htmlFor="firmaIsmi"
            error={errors.firmaIsmi?.message}
            required
          >
            <input
              id="firmaIsmi"
              type="text"
              placeholder="Firma adını yazın"
              className={sharpInputClassName}
              {...register("firmaIsmi")}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Ürün Bilgileri">
          <SharpField
            label="Markası"
            htmlFor="marka"
            error={errors.marka?.message}
            required
          >
            <input
              id="marka"
              type="text"
              placeholder="Marka adı"
              className={sharpInputClassName}
              {...register("marka")}
            />
          </SharpField>

          <SharpField
            label="Uzunluk"
            htmlFor="uzunluk"
            error={errors.uzunluk?.message}
            required
          >
            <input
              id="uzunluk"
              type="text"
              placeholder="örn. 120 mm"
              className={sharpInputClassName}
              {...register("uzunluk")}
            />
          </SharpField>

          <SharpField
            label="Adet"
            htmlFor="adet"
            error={errors.adet?.message}
            required
          >
            <input
              id="adet"
              type="number"
              min={1}
              step={1}
              placeholder="0"
              className={sharpInputClassName}
              {...register("adet", { valueAsNumber: true })}
            />
          </SharpField>

          <SharpField
            label="Renk"
            htmlFor="renk"
            error={errors.renk?.message}
            required
          >
            <input
              id="renk"
              type="text"
              placeholder="örn. Siyah"
              className={sharpInputClassName}
              {...register("renk")}
            />
          </SharpField>
        </FormSection>

        <FormSection title="Görsel Dosyalar" layout="stack">
          {isEdit && keptImages.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Mevcut görseller
              </p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {keptImages.map((image) => (
                  <li key={image.id} className="relative border border-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt="Conta görseli"
                      className="aspect-square w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      className="absolute right-1 top-1 border border-black bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SharpImageUploadZone
            id="contaGorselleri"
            label={isEdit ? "Yeni görseller ekle" : "Conta Görselleri"}
            hint="Birden fazla görsel yükleyebilirsiniz"
            category="product"
            attachments={attachments}
            onChange={setAttachments}
          />
        </FormSection>

        <div className="col-span-full border-t border-black pt-4">
          {submitError && (
            <p
              className="mb-4 border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </p>
          )}

          {submitSuccess && lastContaCode && (
            <p
              className="mb-4 border border-navy bg-slate-100 px-3 py-2 text-sm text-navy"
              role="status"
            >
              Conta kaydı {isEdit ? "güncellendi" : "kaydedildi"}. ID:{" "}
              <span className="font-semibold">{lastContaCode}</span>
            </p>
          )}

          {sheetsWarning && (
            <p
              className="mb-4 border border-amber-600 bg-amber-50 px-3 py-2 text-sm text-amber-800"
              role="status"
            >
              {sheetsWarning}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isEdit
                ? "Güncelleniyor..."
                : "Kaydediliyor..."
              : isEdit
                ? "Güncelle"
                : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
