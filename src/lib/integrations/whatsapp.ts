import { normalizePhone } from "@/lib/utils/slug";

export interface WorkOrderWhatsAppPayload {
  toPhone: string | null;
  assignerName: string;
  assignerEmail: string;
  talepEdenFirma: string;
  uygulayiciFirma: string;
  isTuru: string;
  talebiOlusturan: string;
  sorumluPersonel: string;
  isAciklamasi: string;
  miktar: number;
  birimLabel: string;
  planlananTeslim: string;
  notlar: string;
  tarih: string;
}

export interface WhatsAppSendResult {
  sent: boolean;
  error?: string;
  waUrl?: string;
}

function buildMessage(payload: WorkOrderWhatsAppPayload): string {
  const miktarText = payload.birimLabel
    ? `${payload.miktar} ${payload.birimLabel}`
    : String(payload.miktar);

  return [
    "*YENİ İŞ EMRİ*",
    "",
    `*İş Emrini Veren:* ${payload.assignerName}`,
    `*E-posta:* ${payload.assignerEmail}`,
    "",
    `*Talep Eden Firma:* ${payload.talepEdenFirma}`,
    `*Uygulayıcı Firma:* ${payload.uygulayiciFirma}`,
    `*İş Türü:* ${payload.isTuru}`,
    `*Talebi Oluşturan Personel:* ${payload.talebiOlusturan}`,
    `*Sorumlu Personel:* ${payload.sorumluPersonel}`,
    "",
    `*İş Açıklaması:* ${payload.isAciklamasi}`,
    `*Miktar:* ${miktarText}`,
    `*Tarih:* ${payload.tarih}`,
    `*Planlanan Teslim:* ${payload.planlananTeslim}`,
    "",
    `*Notlar:* ${payload.notlar}`,
  ].join("\n");
}

function buildWaUrl(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export async function sendWorkOrderWhatsApp(
  payload: WorkOrderWhatsAppPayload,
): Promise<WhatsAppSendResult> {
  const message = buildMessage(payload);

  if (!payload.toPhone?.trim()) {
    return {
      sent: false,
      error: "Sorumlu personelin telefon numarası tanımlı değil.",
    };
  }

  const waUrl = buildWaUrl(payload.toPhone, message);
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      sent: false,
      error:
        "WhatsApp API yapılandırılmamış. WHATSAPP_ACCESS_TOKEN ve WHATSAPP_PHONE_NUMBER_ID .env dosyasına ekleyin.",
      waUrl,
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizePhone(payload.toPhone),
          type: "text",
          text: { body: message },
        }),
      },
    );

    const data = (await response.json()) as {
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        sent: false,
        error: data.error?.message ?? "WhatsApp mesajı gönderilemedi",
        waUrl,
      };
    }

    return { sent: true, waUrl };
  } catch (error) {
    return {
      sent: false,
      error:
        error instanceof Error ? error.message : "WhatsApp bağlantı hatası",
      waUrl,
    };
  }
}
