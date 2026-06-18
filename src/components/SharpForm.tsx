"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import {
  taskFormResolver,
} from "@/lib/validations/task-form";
import type { TaskFormValues } from "@/types/task-form";

const defaultValues: Partial<TaskFormValues> = {
  tarih: "",
  firmaIsmi: "",
  sehir: "",
  yapilacakIs: "",
  yapacakSirket: "",
  kargoTeslimTarihi: "",
  kargoFirmasi: "",
  isEmriVeren: "",
  isEmriAlan: "",
  notlar: "",
};

export function SharpForm() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: taskFormResolver,
    defaultValues,
  });

  const onSubmit = (data: TaskFormValues) => {
    console.log("Form verisi:", data);
    setSubmitSuccess(true);
    reset(defaultValues);
  };

  return (
    <div className="border border-black bg-white">
      <div className="border-b border-black px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
          Yeni İş Kaydı
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2"
        noValidate
      >
        <SharpField label="Tarih" htmlFor="tarih" error={errors.tarih?.message}>
          <input
            id="tarih"
            type="date"
            className={sharpInputClassName}
            {...register("tarih")}
          />
        </SharpField>

        <SharpField
          label="Firma İsmi"
          htmlFor="firmaIsmi"
          error={errors.firmaIsmi?.message}
        >
          <input
            id="firmaIsmi"
            type="text"
            placeholder="Firma adı"
            className={sharpInputClassName}
            {...register("firmaIsmi")}
          />
        </SharpField>

        <SharpField label="Şehir" htmlFor="sehir" error={errors.sehir?.message}>
          <input
            id="sehir"
            type="text"
            placeholder="Şehir"
            className={sharpInputClassName}
            {...register("sehir")}
          />
        </SharpField>

        <SharpField
          label="Yapılacak İş"
          htmlFor="yapilacakIs"
          error={errors.yapilacakIs?.message}
        >
          <input
            id="yapilacakIs"
            type="text"
            placeholder="Yapılacak iş tanımı"
            className={sharpInputClassName}
            {...register("yapilacakIs")}
          />
        </SharpField>

        <SharpField
          label="Yapacak Şirket"
          htmlFor="yapacakSirket"
          error={errors.yapacakSirket?.message}
        >
          <input
            id="yapacakSirket"
            type="text"
            placeholder="Yapacak şirket"
            className={sharpInputClassName}
            {...register("yapacakSirket")}
          />
        </SharpField>

        <SharpField label="Adet" htmlFor="adet" error={errors.adet?.message}>
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
          label="Miktar"
          htmlFor="miktar"
          error={errors.miktar?.message}
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

        <SharpField
          label="Kargo Teslim Tarihi"
          htmlFor="kargoTeslimTarihi"
          error={errors.kargoTeslimTarihi?.message}
        >
          <input
            id="kargoTeslimTarihi"
            type="date"
            className={sharpInputClassName}
            {...register("kargoTeslimTarihi")}
          />
        </SharpField>

        <SharpField
          label="Kargo Firması"
          htmlFor="kargoFirmasi"
          error={errors.kargoFirmasi?.message}
        >
          <input
            id="kargoFirmasi"
            type="text"
            placeholder="Kargo firması"
            className={sharpInputClassName}
            {...register("kargoFirmasi")}
          />
        </SharpField>

        <SharpField
          label="İş Emri Veren"
          htmlFor="isEmriVeren"
          error={errors.isEmriVeren?.message}
        >
          <input
            id="isEmriVeren"
            type="text"
            placeholder="İş emri veren"
            className={sharpInputClassName}
            {...register("isEmriVeren")}
          />
        </SharpField>

        <SharpField
          label="İş Emri Alan"
          htmlFor="isEmriAlan"
          error={errors.isEmriAlan?.message}
        >
          <input
            id="isEmriAlan"
            type="text"
            placeholder="İş emri alan"
            className={sharpInputClassName}
            {...register("isEmriAlan")}
          />
        </SharpField>

        <SharpField
          label="Notlar"
          htmlFor="notlar"
          error={errors.notlar?.message}
          fullWidth
        >
          <textarea
            id="notlar"
            rows={4}
            placeholder="Ek notlar..."
            className={`${sharpInputClassName} resize-y`}
            {...register("notlar")}
          />
        </SharpField>

        <div className="md:col-span-2">
          {submitSuccess && (
            <p
              className="mb-4 border border-navy bg-slate-100 px-3 py-2 text-sm text-navy"
              role="status"
            >
              Kayıt başarıyla alındı. (Supabase entegrasyonu bir sonraki adımda
              bağlanacak.)
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
