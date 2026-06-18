import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const taskFormSchema = z.object({
  tarih: z.string().min(1, "Tarih gereklidir"),
  firmaIsmi: z.string().min(1, "Firma ismi gereklidir"),
  sehir: z.string().min(1, "Şehir gereklidir"),
  yapilacakIs: z.string().min(1, "Yapılacak iş gereklidir"),
  yapacakSirket: z.string().min(1, "Yapacak şirket gereklidir"),
  adet: z
    .number({ error: "Adet gereklidir" })
    .int("Adet tam sayı olmalıdır")
    .positive("Adet pozitif olmalıdır"),
  miktar: z
    .number({ error: "Miktar gereklidir" })
    .positive("Miktar pozitif olmalıdır"),
  kargoTeslimTarihi: z.string().min(1, "Kargo teslim tarihi gereklidir"),
  kargoFirmasi: z.string().min(1, "Kargo firması gereklidir"),
  isEmriVeren: z.string().min(1, "İş emri veren gereklidir"),
  isEmriAlan: z.string().min(1, "İş emri alan gereklidir"),
  notlar: z.string().optional(),
});

export const taskFormResolver = zodResolver(taskFormSchema);
