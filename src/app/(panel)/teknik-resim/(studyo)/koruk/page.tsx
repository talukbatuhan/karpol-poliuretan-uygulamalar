import { LegacyToolEmbed } from "@/components/tools/LegacyToolEmbed";
import { ToolChrome } from "@/components/tools/ToolChrome";

export const metadata = {
  title: "Körük Tasarımı Teknik Resim | Karpol",
  description:
    "Parametrik körük (boğum) teknik resmi, ağız çapları, boğum ayarları ve PNG/PDF dışa aktarma.",
};

export default function KorukPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
      <ToolChrome title="Körük Tasarım Stüdyosu" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
        <LegacyToolEmbed title="Körük Tasarımı" src="/legacy/koruk.html" />
      </div>
    </div>
  );
}
