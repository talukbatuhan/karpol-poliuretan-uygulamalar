import { LegacyToolEmbed } from "@/components/tools/LegacyToolEmbed";
import { ToolChrome } from "@/components/tools/ToolChrome";

export const metadata = {
  title: "Silim Lastiği Teknik Resim | Karpol",
  description:
    "Flanş ve silim lastiği ölçüleri, teknik çizim önizleme ve PNG/PDF dışa aktarma.",
};

export default function SilimLastigiPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
      <ToolChrome title="Silim Lastiği Tasarım Stüdyosu" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden touch-none">
        <LegacyToolEmbed
          title="Silim Lastiği"
          src="/legacy/silim-lastigi.html"
        />
      </div>
    </div>
  );
}
