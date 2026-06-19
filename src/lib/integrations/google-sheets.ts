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

/**
 * Google Apps Script web app URL'sine satır gönderir.
 * GOOGLE_SHEETS_WEBHOOK_URL tanımlı değilse atlanır.
 */
export async function syncContaToGoogleSheets(
  row: ContaSheetRow,
): Promise<{ synced: boolean; error?: string; gorselCount?: number }> {
  try {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      return {
        synced: false,
        error: "GOOGLE_SHEETS_WEBHOOK_URL tanımlı değil",
      };
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
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

    let parsed: { success?: boolean; gorselCount?: number };
    try {
      parsed = JSON.parse(text) as { success?: boolean; gorselCount?: number };
    } catch {
      return {
        synced: false,
        error: `Sheets geçersiz yanıt: ${text.slice(0, 200)}`,
      };
    }

    if (!parsed.success) {
      return {
        synced: false,
        error: "Sheets success:false döndü",
      };
    }

    return {
      synced: true,
      gorselCount:
        typeof parsed.gorselCount === "number" ? parsed.gorselCount : undefined,
    };
  } catch (error) {
    return {
      synced: false,
      error: error instanceof Error ? error.message : "Bilinmeyen Sheets hatası",
    };
  }
}
