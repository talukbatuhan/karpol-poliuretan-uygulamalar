import Link from "next/link";

interface AppHeaderProps {
  title: string;
  active: "is-takip" | "firmalar";
}

export function AppHeader({ title, active }: AppHeaderProps) {
  return (
    <header className="border-b border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Karpol
            </p>
            <h1 className="mt-1 text-xl font-semibold uppercase tracking-wide text-charcoal md:text-2xl">
              {title}
            </h1>
          </div>
          <nav className="flex gap-2">
            <Link
              href="/"
              className={`border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                active === "is-takip"
                  ? "border-black bg-navy text-white"
                  : "border-black bg-white text-charcoal hover:bg-slate-100"
              }`}
            >
              İş Takip
            </Link>
            <Link
              href="/firmalar"
              className={`border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                active === "firmalar"
                  ? "border-black bg-navy text-white"
                  : "border-black bg-white text-charcoal hover:bg-slate-100"
              }`}
            >
              Firmalar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
