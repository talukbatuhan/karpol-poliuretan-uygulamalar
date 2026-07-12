import type { LookupOption } from "@/types/lookup";
import type { WorkOrderFormValues } from "@/types/work-order";
import type { WorkOrderWhatsAppDraft } from "@/lib/whatsapp/types";

function findOption(
  options: LookupOption[],
  id: string | undefined,
): LookupOption | undefined {
  if (!id) return undefined;
  return options.find((option) => option.value === id);
}

/** Dropdown etiketinden telefon parantezini temizler. */
function cleanLabel(option?: LookupOption): string {
  if (!option) return "—";
  if (option.phone) {
    const suffix = ` (${option.phone})`;
    if (option.label.endsWith(suffix)) {
      return option.label.slice(0, -suffix.length).trim() || "—";
    }
  }
  return option.label.trim() || "—";
}

export interface WorkOrderLookupLists {
  jobTypes: LookupOption[];
  personnel: LookupOption[];
  cities: LookupOption[];
  cargoCompanies: LookupOption[];
  units: LookupOption[];
}

/** Form + lookup listelerinden WhatsApp draft'ı üretir. */
export function buildWorkOrderWhatsAppDraft(
  values: WorkOrderFormValues,
  lookups: WorkOrderLookupLists,
  imageUrls?: { productUrls?: string[]; technicalUrls?: string[] },
): WorkOrderWhatsAppDraft | null {
  const responsible = findOption(lookups.personnel, values.sorumluPersonelId);
  const phone = responsible?.phone?.trim();
  if (!phone) return null;

  const unit = findOption(lookups.units, values.birimId);
  const miktarText = unit
    ? `${values.miktar} ${cleanLabel(unit)}`
    : String(values.miktar);

  return {
    phone,
    talepEdenFirma: values.talepEdenFirma.trim() || "—",
    uygulayiciFirma: values.uygulayiciFirma.trim() || "—",
    isTuru: cleanLabel(findOption(lookups.jobTypes, values.isTuruId)),
    talebiOlusturan: cleanLabel(
      findOption(lookups.personnel, values.talebiOlusturanPersonelId),
    ),
    sorumluPersonel: cleanLabel(responsible),
    isAciklamasi: values.isAciklamasi?.trim() || "—",
    miktarText,
    tarih: values.tarih,
    planlananTeslim: values.planlananTeslimTarihi?.trim() || "—",
    notlar: values.notlar?.trim() || "—",
    sehir: cleanLabel(findOption(lookups.cities, values.sehirId)),
    kargoFirmasi: cleanLabel(
      findOption(lookups.cargoCompanies, values.kargoFirmasiId),
    ),
    productUrls: imageUrls?.productUrls ?? [],
    technicalUrls: imageUrls?.technicalUrls ?? [],
  };
}
