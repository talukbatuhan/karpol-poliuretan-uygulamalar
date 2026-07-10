import Link from "next/link";

type ToolChromeProps = {
  title: string;
  backLabel?: string;
  backHref?: string;
};

/** Site header bağımlılığı olmayan basit üst çubuk. */
export function ToolChrome({
  title,
  backLabel = "Tüm araçlar",
  backHref = "/teknik-resim",
}: ToolChromeProps) {
  return (
    <div className="relative z-30 flex shrink-0 items-center gap-3 border-b border-navy-800 bg-navy-950 px-4 py-3 md:px-6">
      <Link
        href={backHref}
        className="min-w-0 shrink-0 font-mono text-xs uppercase tracking-widest text-gold-300 transition-colors hover:text-gold-500"
      >
        ← {backLabel}
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-center font-display text-sm font-bold uppercase tracking-wide text-ivory-50 md:text-base">
        {title}
      </h1>
      <div className="w-16 shrink-0" aria-hidden />
    </div>
  );
}
