import {
  isConfiguredAdminEmail,
  isSuperAdminEmail,
  normalizeEmail,
} from "@/lib/auth/admin-emails";
import {
  isManagedAppKey,
  MANAGED_APP_KEYS,
  type AppNavKey,
  type ManagedAppKey,
} from "@/lib/constants/app-links";
import type { UserAccessProfile, UserRole } from "@/types/user-access";

export function parseAllowedApps(value: unknown): ManagedAppKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ManagedAppKey => {
    return typeof item === "string" && isManagedAppKey(item);
  });
}

export function resolveIsAdmin(params: {
  email: string | null | undefined;
  role: string | null | undefined;
}): boolean {
  if (isConfiguredAdminEmail(params.email)) return true;
  return params.role === "admin";
}

export function buildAccessProfile(params: {
  id: string;
  email: string | null | undefined;
  fullName?: string | null;
  role?: string | null;
  allowedApps?: unknown;
  isActive?: boolean | null;
}): UserAccessProfile {
  const email = normalizeEmail(params.email) || params.email || null;
  const role: UserRole = params.role === "admin" ? "admin" : "viewer";
  const isAdmin = resolveIsAdmin({ email, role });

  return {
    id: params.id,
    email,
    fullName: params.fullName ?? null,
    role: isAdmin ? "admin" : role,
    allowedApps: isAdmin ? [...MANAGED_APP_KEYS] : parseAllowedApps(params.allowedApps),
    isActive: params.isActive !== false,
    isAdmin,
  };
}

/** Admin tüm uygulamalara erişir; viewer sadece allowed_apps. */
export function canAccessApp(
  profile: UserAccessProfile | null | undefined,
  appKey: AppNavKey | undefined,
): boolean {
  if (!profile || !profile.isActive) return false;
  if (!appKey || appKey === "dashboard") return true;

  if (appKey === "kullanicilar") {
    return profile.isAdmin;
  }

  if (profile.isAdmin || isSuperAdminEmail(profile.email)) {
    return true;
  }

  return profile.allowedApps.includes(appKey as ManagedAppKey);
}
