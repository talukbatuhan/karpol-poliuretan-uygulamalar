"use client";

import Link from "next/link";

import { AuthActions } from "@/components/layout/AuthActions";
import { useSidebar } from "@/components/layout/AppShell";
import { APP_LINKS, type AppNavKey } from "@/lib/constants/app-links";

interface AppSidebarProps {
  activeKey?: AppNavKey;
}

export function AppSidebar({ activeKey }: AppSidebarProps) {
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-black bg-white transition-transform duration-200 lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 ${
        mobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
      } ${collapsed ? "lg:w-16" : "lg:w-64"}`}
    >
      <div
        className={`flex items-center border-b border-black ${
          collapsed && !mobileOpen
            ? "justify-center px-2 py-4"
            : "justify-between px-4 py-4"
        }`}
      >
        {(!collapsed || mobileOpen) && (
          <Link href="/" className="min-w-0" onClick={closeMobile}>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Karpol
            </p>
            <h1 className="mt-0.5 truncate text-sm font-semibold uppercase tracking-wide text-charcoal">
              Dashboard
            </h1>
          </Link>
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          className="hidden shrink-0 border border-black bg-white px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal hover:bg-slate-100 lg:inline-flex"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {!collapsed || mobileOpen ? (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Uygulamalar
          </p>
        ) : null}
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              title="Ana Sayfa"
              onClick={closeMobile}
              className={`flex items-center border transition-colors ${
                activeKey === undefined
                  ? "border-black bg-navy text-white"
                  : "border-transparent text-charcoal hover:border-black hover:bg-slate-50"
              } ${collapsed && !mobileOpen ? "justify-center px-2 py-3" : "px-3 py-3"}`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                {collapsed && !mobileOpen ? "⌂" : "Ana Sayfa"}
              </span>
            </Link>
          </li>

          {APP_LINKS.map((app) => (
            <li key={app.key}>
              <Link
                href={app.href}
                title={app.label}
                onClick={closeMobile}
                className={`block border transition-colors ${
                  activeKey === app.key
                    ? "border-black bg-navy text-white"
                    : "border-transparent text-charcoal hover:border-black hover:bg-slate-50"
                } ${collapsed && !mobileOpen ? "px-2 py-3 text-center" : "px-3 py-3"}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {collapsed && !mobileOpen ? app.label.slice(0, 2) : app.label}
                </span>
                {(!collapsed || mobileOpen) && (
                  <span
                    className={`mt-1 block text-[11px] leading-snug ${
                      activeKey === app.key ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {app.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {(!collapsed || mobileOpen) && (
        <div className="border-t border-black px-4 py-3">
          <AuthActions />
        </div>
      )}
    </aside>
  );
}
