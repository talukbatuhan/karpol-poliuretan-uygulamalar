import { LegacyToolEmbed } from "@/components/tools/LegacyToolEmbed";
import { ToolChrome } from "@/components/tools/ToolChrome";

export const metadata = {
  title: "Kauçuk Titreşim Takozları Teknik Resim | Karpol",
  description:
    "Takoz tipi seçimi, parametre paneli, teknik çizim önizleme ve PNG/PDF dışa aktarma.",
};

export default function KaucukTitresimTakozlariPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
      <ToolChrome title="Kauçuk Titreşim Takozu Tasarım Stüdyosu" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
        <LegacyToolEmbed
          title="Kauçuk Titreşim Takozu"
          src="/legacy/kaucuk-titresim-takozlari.html"
        />
      </div>
    </div>
  );
}
