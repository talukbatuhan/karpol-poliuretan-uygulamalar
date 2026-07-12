"use client";

import Link from "next/link";

import { useAccess } from "@/components/auth/AccessProvider";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Home() {
  const { visibleApps, isLoading } = useAccess();

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
            Size açık uygulamalara sol menüden veya aşağıdaki kartlardan
            erişebilirsiniz.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {isLoading ? (
              <p className="text-sm text-slate-500">Yükleniyor...</p>
            ) : visibleApps.length === 0 ? (
              <p className="col-span-full border border-black bg-white px-4 py-3 text-sm text-slate-600">
                Henüz size atanmış bir uygulama yok. Yöneticinizle iletişime
                geçin.
              </p>
            ) : (
              visibleApps.map((app) => (
                <Link
                  key={app.key}
                  href={app.href}
                  className="border border-black bg-white px-4 py-3.5 transition-shadow hover:shadow-[4px_4px_0_0_#0a1628]"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal">
                    {app.label}
                  </h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
