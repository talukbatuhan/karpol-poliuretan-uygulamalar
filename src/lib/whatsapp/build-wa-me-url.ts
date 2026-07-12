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

/**
 * WhatsApp'ı açar.
 * features'lı window.open bazı Chrome/mobil tarayıcılarda sessizce engellenir;
 * popup engellenirse aynı sekmede açılır.
 */
export function openWorkOrderWhatsApp(phone: string, message: string): void {
  const url = buildWaMeUrl(phone, message);

  // 3. argüman (noopener,noreferrer) kullanma — sık engellenir
  const popup = window.open(url, "_blank");
  if (popup) {
    try {
      popup.opener = null;
    } catch {
      // ignore
    }
    return;
  }

  // Popup engelli → aynı sekme (en güvenilir)
  window.location.assign(url);
}
