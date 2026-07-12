"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { AccessProvider } from "@/components/auth/AccessProvider";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getActiveAppKey } from "@/lib/constants/app-links";

const STORAGE_KEY = "karpol-sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within AppShell");
  }
  return context;
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeKey = getActiveAppKey(pathname);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((current) => !current);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <AccessProvider>
      <SidebarContext.Provider
        value={{ collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile }}
      >
        <div className="flex min-h-svh bg-slate-50">
          {mobileOpen && (
            <button
              type="button"
              aria-label="Menüyü kapat"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={closeMobile}
            />
          )}

          <AppSidebar activeKey={activeKey} />

          <div className="flex min-h-svh min-w-0 flex-1 flex-col">
            <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </SidebarContext.Provider>
    </AccessProvider>
  );
}
