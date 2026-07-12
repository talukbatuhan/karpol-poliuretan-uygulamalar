import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const optionalId = z.string();
const requiredId = z.string().min(1, "Seçim zorunludur");
const requiredText = z.string().trim().min(1, "Bu alan zorunludur");

export const workOrderFormSchema = z.object({
  tarih: z.string().min(1, "Tarih gereklidir"),
  sehirId: optionalId,
  talepEdenFirma: requiredText,
  uygulayiciFirma: requiredText,
  talepEdenFirmaKartId: optionalId,
  uygulayiciFirmaKartId: optionalId,
  isTuruId: requiredId,
  isAciklamasi: optionalId,
  miktar: z
    .number({ error: "Miktar gereklidir" })
    .positive("Miktar pozitif olmalıdır"),
  birimId: optionalId,
  planlananTeslimTarihi: optionalId,
  kargoFirmasiId: optionalId,
  talebiOlusturanPersonelId: optionalId,
  sorumluPersonelId: requiredId,
  notlar: optionalId,
});

export const workOrderFormResolver = zodResolver(workOrderFormSchema);
