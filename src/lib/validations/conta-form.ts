import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const contaFormSchema = z.object({
  firmaIsmi: z.string().min(1, "Firma ismi gereklidir"),
  marka: z.string().min(1, "Marka gereklidir"),
  uzunluk: z.string().min(1, "Uzunluk gereklidir"),
  adet: z
    .number({ error: "Adet gereklidir" })
    .int("Adet tam sayı olmalıdır")
    .positive("Adet pozitif olmalıdır"),
  renk: z.string().min(1, "Renk gereklidir"),
});

export const contaFormResolver = zodResolver(contaFormSchema);
