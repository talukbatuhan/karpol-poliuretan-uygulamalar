import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { APP_LINKS } from "@/lib/constants/app-links";

export default function Home() {
  return (
    <>
      <PageHeader title="Ana Sayfa" />
      <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Hoş geldiniz
        </p>
        <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide text-charcoal md:text-3xl">
          Karpol Yönetim Paneli
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Tüm uygulamalara sol menüden hızlıca erişebilirsiniz. Günlük iş
          takibinden kişisel alışveriş kayıtlarına kadar her modül burada.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {APP_LINKS.map((app) => (
            <Link
              key={app.key}
              href={app.href}
              className="border border-black bg-white p-4 transition-shadow hover:shadow-[4px_4px_0_0_#0a1628]"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal">
                {app.label}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{app.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
