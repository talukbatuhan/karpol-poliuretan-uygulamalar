import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teknik Resim Araçları | Karpol",
  description: "Parametrik CAD stüdyoları ve teknik çizim uygulamaları",
};

const STUDIO_TOOLS = [
  {
    href: "/teknik-resim/silim-lastigi",
    title: "Silim Lastiği Tasarım Stüdyosu",
    description:
      "Parametre paneli, teknik çizim önizleme ve PNG/PDF dışa aktarma.",
    badge: "Teknik resim",
  },
  {
    href: "/teknik-resim/kaucuk-titresim-takozlari",
    title: "Kauçuk Titreşim Takozu Tasarım Stüdyosu",
    description:
      "Takoz tipi seçimi, parametre paneli, teknik çizim önizleme ve PNG/PDF dışa aktarma.",
    badge: "Teknik resim",
  },
  {
    href: "/teknik-resim/koruk",
    title: "Körük Tasarım Stüdyosu",
    description:
      "Parametrik körük (boğum) teknik resmi; ağız çapları, boğum sayısı/yüksekliği ve PNG/PDF dışa aktarma.",
    badge: "Teknik resim",
  },
] as const;

export default function TeknikResimPage() {
  return (
    <div className="min-h-full bg-ivory-50 p-6 md:p-10">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-navy-950 md:text-4xl">
          Mühendislik Araçları
        </h1>
        <p className="mt-2 text-sm text-navy-800/80">
          Teknik çizim uygulamaları — tek merkezden erişin.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {STUDIO_TOOLS.map((tool) => (
          <article
            key={tool.href}
            className="flex flex-col border border-navy-800 bg-ivory-50 p-8"
          >
            <span className="mb-4 inline-block w-fit border border-navy-800 bg-navy-950 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-300">
              {tool.badge}
            </span>
            <h2 className="font-display text-2xl font-bold text-navy-950">
              {tool.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-800/80">
              {tool.description}
            </p>
            <Link
              href={tool.href}
              className="mt-6 inline-block w-fit border border-gold-500 px-5 py-2 font-mono text-xs uppercase tracking-widest text-navy-950 transition-colors hover:bg-gold-500"
            >
              Uygulamayı aç →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
