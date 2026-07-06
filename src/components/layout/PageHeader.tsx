"use client";

import { AuthActions } from "@/components/layout/AuthActions";
import { useSidebar } from "@/components/layout/AppShell";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-black bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleMobile}
            aria-label="Menüyü aç"
            className="shrink-0 border border-black bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal hover:bg-slate-100 lg:hidden"
          >
            Menü
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Karpol
            </p>
            <h1 className="truncate text-lg font-semibold uppercase tracking-wide text-charcoal md:text-xl">
              {title}
            </h1>
          </div>
        </div>
        <div className="hidden shrink-0 lg:block">
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
