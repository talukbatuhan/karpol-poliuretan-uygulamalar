"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { canAccessApp } from "@/lib/auth/access";
import {
  ADMIN_APP_LINKS,
  APP_LINKS,
  type AppLink,
  type AppNavKey,
  type ManagedAppKey,
} from "@/lib/constants/app-links";

interface AccessContextValue {
  isLoading: boolean;
  isAdmin: boolean;
  email: string | null;
  allowedApps: ManagedAppKey[];
  visibleApps: AppLink[];
  canAccess: (appKey: AppNavKey | undefined) => boolean;
  refresh: () => Promise<void>;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return context;
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [allowedApps, setAllowedApps] = useState<ManagedAppKey[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setIsAdmin(false);
        setEmail(null);
        setAllowedApps([]);
        return;
      }

      setIsAdmin(Boolean(data.isAdmin));
      setEmail(data.email ?? null);
      setAllowedApps((data.allowedApps ?? []) as ManagedAppKey[]);
    } catch {
      setIsAdmin(false);
      setEmail(null);
      setAllowedApps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const profile = useMemo(
    () => ({
      id: "current",
      email,
      fullName: null,
      role: isAdmin ? ("admin" as const) : ("viewer" as const),
      allowedApps,
      isActive: true,
      isAdmin,
    }),
    [allowedApps, email, isAdmin],
  );

  const visibleApps = useMemo(() => {
    const apps = APP_LINKS.filter((app) => canAccessApp(profile, app.key));
    if (isAdmin) {
      return [...apps, ...ADMIN_APP_LINKS];
    }
    return apps;
  }, [isAdmin, profile]);

  const value = useMemo<AccessContextValue>(
    () => ({
      isLoading,
      isAdmin,
      email,
      allowedApps,
      visibleApps,
      canAccess: (appKey) => canAccessApp(profile, appKey),
      refresh,
    }),
    [allowedApps, email, isAdmin, isLoading, profile, refresh, visibleApps],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}
