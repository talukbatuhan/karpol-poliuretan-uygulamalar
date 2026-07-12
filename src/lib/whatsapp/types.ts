/** Client-side WhatsApp mesajı için iş emri özeti. */
export interface WorkOrderWhatsAppDraft {
  phone: string;
  talepEdenFirma: string;
  uygulayiciFirma: string;
  isTuru: string;
  talebiOlusturan: string;
  sorumluPersonel: string;
  isAciklamasi: string;
  miktarText: string;
  tarih: string;
  planlananTeslim: string;
  notlar: string;
  sehir: string;
  kargoFirmasi: string;
  productUrls: string[];
  technicalUrls: string[];
}
