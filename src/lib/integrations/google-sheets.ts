export interface ContaSheetRow {
  contaCode: string;
  firmaIsmi: string;
  marka: string;
  uzunluk: string;
  adet: number;
  renk: string;
  gorselUrlList: string[];
  /** Apps Script yedek alanı — satır satır URL */
  gorselLinkleri?: string;
  createdAt: string;
  supabaseId: string;
}

export interface WorkOrderSheetCreatePayload {
  action: "create";
  workOrderId: string;
  sheetName: string;
  tarih: string;
  tarihLabel: string;
  sehir: string;
  talepEdenFirma: string;
  uygulayiciFirma: string;
  isTuru: string;
  isAciklamasi: string;
  miktar: number;
  birim: string;
  planlananTeslimTarihi: string;
  sorumluPersonel: string;
  durum: string;
  createdAt: string;
}

export interface WorkOrderSheetCompletePayload {
  action: "complete";
  workOrderId: string;
  sheetName: string;
  tarih: string;
}

type SheetsSyncResult = {
  synced: boolean;
  error?: string;
  gorselCount?: number;
};

async function postToSheetsWebhook(
  webhookUrl: string,
  body: unknown,
): Promise<SheetsSyncResult> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "follow",
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      synced: false,
      error: `Sheets yanıt hatası (${response.status}): ${text}`,
    };
  }

  const trimmed = text.trimStart();
  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    text.includes("TypeError:") ||
    text.includes("ReferenceError:")
  ) {
    const match = text.match(/<div[^>]*>([^<]+)<\/div>\s*<\/body>/i);
    return {
      synced: false,
      error: `Google Apps Script hatası: ${match?.[1]?.trim() ?? "Bilinmeyen script hatası"}`,
    };
  }

  let parsed: { success?: boolean; gorselCount?: number; error?: string };
  try {
    parsed = JSON.parse(text) as {
      success?: boolean;
      gorselCount?: number;
      error?: string;
    };
  } catch {
    return {
      synced: false,
      error: `Sheets geçersiz yanıt: ${text.slice(0, 200)}`,
    };
  }

  if (!parsed.success) {
    return {
      synced: false,
      error: parsed.error ?? "Sheets success:false döndü",
    };
  }

  return {
    synced: true,
    gorselCount:
      typeof parsed.gorselCount === "number" ? parsed.gorselCount : undefined,
  };
}

/**
 * Google Apps Script web app URL'sine satır gönderir.
 * GOOGLE_SHEETS_WEBHOOK_URL tanımlı değilse atlanır.
 */
export async function syncContaToGoogleSheets(
  row: ContaSheetRow,
): Promise<SheetsSyncResult> {
  try {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      return {
        synced: false,
        error: "GOOGLE_SHEETS_WEBHOOK_URL tanımlı değil",
      };
    }

    return await postToSheetsWebhook(webhookUrl, row);
  } catch (error) {
    return {
      synced: false,
      error: error instanceof Error ? error.message : "Bilinmeyen Sheets hatası",
    };
  }
}

/**
 * İş emri satırını günlük sayfaya yazar / durum günceller.
 * GOOGLE_SHEETS_IS_EMRI_WEBHOOK_URL tanımlı değilse atlanır.
 */
export async function syncWorkOrderToGoogleSheets(
  payload: WorkOrderSheetCreatePayload | WorkOrderSheetCompletePayload,
): Promise<SheetsSyncResult> {
  try {
    const webhookUrl = process.env.GOOGLE_SHEETS_IS_EMRI_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      return {
        synced: false,
        error: "GOOGLE_SHEETS_IS_EMRI_WEBHOOK_URL tanımlı değil",
      };
    }

    return await postToSheetsWebhook(webhookUrl, payload);
  } catch (error) {
    return {
      synced: false,
      error: error instanceof Error ? error.message : "Bilinmeyen Sheets hatası",
    };
  }
}

/** İş emri tarihinden sayfa adı: dd.MM.yyyy */
export function workOrderSheetNameFromTarih(tarih: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(tarih);
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}`;
  }

  const date = new Date(tarih);
  if (Number.isNaN(date.getTime())) {
    return tarih;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
