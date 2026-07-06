import { z } from "zod";

export const shoppingRecordFormSchema = z.object({
  productName: z.string().trim().min(1, "Ürün adı zorunludur"),
  store: z.string().trim().optional().default(""),
  price: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => value === "" || !Number.isNaN(Number.parseFloat(value.replace(",", "."))),
      "Geçerli bir fiyat girin",
    ),
  purchaseDate: z.string().min(1, "Alışveriş tarihi zorunludur"),
  category: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
});

export type ShoppingRecordFormValues = z.infer<typeof shoppingRecordFormSchema>;

export function parseShoppingPrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}
