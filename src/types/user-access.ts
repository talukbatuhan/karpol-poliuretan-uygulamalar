import type { ManagedAppKey } from "@/lib/constants/app-links";
import { MANAGED_APP_KEYS } from "@/lib/constants/app-links";

export type UserRole = "admin" | "viewer";

export interface UserAccessProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  allowedApps: ManagedAppKey[];
  isActive: boolean;
  isAdmin: boolean;
}

export interface ManagedUserRecord extends UserAccessProfile {
  createdAt: string;
  updatedAt: string;
}
