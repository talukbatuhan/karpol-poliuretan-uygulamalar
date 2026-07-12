"use client";

import Link from "next/link";

import { useAccess } from "@/components/auth/AccessProvider";
import { AuthActions } from "@/components/layout/AuthActions";
import { useSidebar } from "@/components/layout/AppShell";
import { AppNavIcon } from "@/components/layout/AppNavIcons";
import type { AppNavKey } from "@/lib/constants/app-links";

interface AppSidebarProps {
  activeKey?: AppNavKey;
}

function navItemClass(active: boolean, compact: boolean): string {
  const base =
    "flex items-center gap-2.5 border text-xs font-semibold uppercase tracking-wide transition-colors";
  const state = active
    ? "border-black bg-navy text-white"
    : "border-transparent text-charcoal hover:border-black hover:bg-slate-50";
  const size = compact ? "justify-center px-0 py-2.5" : "px-3 py-2.5";
  return `${base} ${state} ${size}`;
}

export function AppSidebar({ activeKey }: AppSidebarProps) {
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar();
  const { visibleApps, isLoading } = useAccess();
  const compact = collapsed && !mobileOpen;
  const expanded = !collapsed || mobileOpen;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-svh flex-col border-r border-black bg-white transition-[width,transform] duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } w-60 ${compact ? "lg:w-14" : "lg:w-52"}`}
    >
      <div
        className={`flex h-14 shrink-0 items-center border-b border-black ${
          compact ? "justify-center px-1.5" : "justify-between gap-2 px-3"
        }`}
      >
        {expanded && (
          <Link href="/" className="min-w-0" onClick={closeMobile}>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Karpol
            </p>
            <h1 className="truncate text-sm font-semibold uppercase tracking-wide text-charcoal">
              Panel
            </h1>
          </Link>
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          className="hidden h-8 w-8 shrink-0 items-center justify-center border border-black bg-white text-sm text-charcoal hover:bg-slate-100 lg:inline-flex"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {expanded && (
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Uygulamalar
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link
              href="/"
              title="Ana Sayfa"
              onClick={closeMobile}
              className={navItemClass(activeKey === undefined, compact)}
            >
              <AppNavIcon name="home" />
              {expanded ? <span>Ana Sayfa</span> : null}
            </Link>
          </li>

          {!isLoading &&
            visibleApps.map((app) => (
              <li key={app.key}>
                <Link
                  href={app.href}
                  title={app.label}
                  onClick={closeMobile}
                  className={navItemClass(activeKey === app.key, compact)}
                >
                  <AppNavIcon name={app.key} />
                  {expanded ? <span>{app.label}</span> : null}
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      {expanded && (
        <div className="shrink-0 border-t border-black px-3 py-2.5">
          <AuthActions />
        </div>
      )}
    </aside>
  );
}
