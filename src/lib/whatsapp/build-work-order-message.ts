import type { WorkOrderWhatsAppDraft } from "@/lib/whatsapp/types";

function formatUrlBlock(title: string, urls: string[]): string[] {
  if (urls.length === 0) return [];
  return [
    title,
    ...urls.map((url, index) => `${index + 1}) ${url}`),
    "",
  ];
}

/**
 * WhatsApp mesaj şablonu — metni buradan kolayca değiştirin.
 * Görseller kısa /g/... linkleri olarak eklenir (önizleme için metin önce gelir).
 */
export function buildWorkOrderWhatsAppMessage(
  data: WorkOrderWhatsAppDraft,
): string {
  // Linkleri en alta koy; üstte yalnızca iş emri metni olsun.
  const lines = [
    "*YENİ İŞ EMRİ*",
    "",
    `*Talep Eden Firma:* ${data.talepEdenFirma}`,
    `*Uygulayıcı Firma:* ${data.uygulayiciFirma}`,
    `*İş Türü:* ${data.isTuru}`,
    `*Şehir:* ${data.sehir}`,
    "",
    `*Talebi Oluşturan:* ${data.talebiOlusturan}`,
    `*Sorumlu Personel:* ${data.sorumluPersonel}`,
    "",
    `*İş Açıklaması:* ${data.isAciklamasi}`,
    `*Miktar:* ${data.miktarText}`,
    `*Tarih:* ${data.tarih}`,
    `*Planlanan Teslim:* ${data.planlananTeslim}`,
    `*Kargo:* ${data.kargoFirmasi}`,
    "",
    `*Notlar:* ${data.notlar}`,
    "",
    "—",
    "",
    ...formatUrlBlock("*Ürün görselleri:*", data.productUrls),
    ...formatUrlBlock("*Teknik görseller:*", data.technicalUrls),
  ];

  return lines.join("\n").trim();
}
