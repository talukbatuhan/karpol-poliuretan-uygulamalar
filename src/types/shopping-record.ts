export interface ShoppingRecordFile {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
}

export interface ShoppingRecord {
  id: string;
  productName: string;
  store: string;
  price: number | null;
  purchaseDate: string;
  category: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  coverFileUrl: string | null;
}

export interface ShoppingRecordDetail extends ShoppingRecord {
  files: ShoppingRecordFile[];
}

export interface PendingShoppingFile {
  id: string;
  file: File;
  previewUrl: string | null;
}

export function createPendingFile(file: File): PendingShoppingFile {
  const isImage = file.type.startsWith("image/");
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: isImage ? URL.createObjectURL(file) : null,
  };
}

export function formatShoppingPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
}

export function formatShoppingDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
