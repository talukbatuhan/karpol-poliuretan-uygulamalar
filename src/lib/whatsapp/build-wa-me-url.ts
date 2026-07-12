import { normalizePhone } from "@/lib/utils/slug";

/**
 * WhatsApp Web / uygulama deep link.
 * Mesaj hazır gelir; kullanıcı yalnızca Gönder'e basar.
 */
export function buildWaMeUrl(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Alternatif format (aynı sonuç). */
export function buildWhatsAppSendUrl(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(message)}`;
}

export function openWorkOrderWhatsApp(phone: string, message: string): void {
  const url = buildWaMeUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}
