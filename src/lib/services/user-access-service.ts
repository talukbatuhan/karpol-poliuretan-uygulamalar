import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import {
  buildAccessProfile,
  parseAllowedApps,
} from "@/lib/auth/access";
import { isConfiguredAdminEmail, normalizeEmail } from "@/lib/auth/admin-emails";
import type { ManagedAppKey } from "@/lib/constants/app-links";
import { MANAGED_APP_KEYS } from "@/lib/constants/app-links";
import type { ManagedUserRecord, UserAccessProfile, UserRole } from "@/types/user-access";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  allowed_apps: string[] | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export async function getCurrentAccessProfile(): Promise<UserAccessProfile | null> {
  const user = await requireUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, allowed_apps, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? profile?.email ?? null;

  // Profil yoksa oluştur (ilk giriş)
  if (!profile) {
    const admin = createAdminClient();
    const role: UserRole = isConfiguredAdminEmail(email) ? "admin" : "viewer";
    const allowedApps = role === "admin" ? [...MANAGED_APP_KEYS] : [];

    await admin.from("profiles").upsert({
      id: user.id,
      email: normalizeEmail(email) || null,
      role,
      allowed_apps: allowedApps,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    return buildAccessProfile({
      id: user.id,
      email,
      role,
      allowedApps,
      isActive: true,
    });
  }

  return buildAccessProfile({
    id: user.id,
    email,
    fullName: profile.full_name,
    role: profile.role,
    allowedApps: profile.allowed_apps,
    isActive: profile.is_active,
  });
}

export async function listManagedUsers(): Promise<ManagedUserRecord[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, role, allowed_apps, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Kullanıcılar okunamadı: ${error.message}`);
  }

  const rows = (data ?? []) as ProfileRow[];

  // Auth kullanıcılarından e-posta tamamla
  const { data: authData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const emailById = new Map(
    (authData?.users ?? []).map((user) => [user.id, user.email ?? null]),
  );

  return rows.map((row) => {
    const email = row.email || emailById.get(row.id) || null;
    const access = buildAccessProfile({
      id: row.id,
      email,
      fullName: row.full_name,
      role: row.role,
      allowedApps: row.allowed_apps,
      isActive: row.is_active,
    });

    return {
      ...access,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export interface CreateManagedUserInput {
  email: string;
  password: string;
  fullName?: string;
  role: UserRole;
  allowedApps: ManagedAppKey[];
  isActive?: boolean;
}

export async function createManagedUser(
  input: CreateManagedUserInput,
): Promise<ManagedUserRecord> {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("E-posta zorunludur");
  if (!input.password || input.password.length < 6) {
    throw new Error("Şifre en az 6 karakter olmalıdır");
  }

  const role: UserRole =
    input.role === "admin" || isConfiguredAdminEmail(email) ? "admin" : "viewer";
  const allowedApps =
    role === "admin" ? [...MANAGED_APP_KEYS] : parseAllowedApps(input.allowedApps);

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName?.trim() || null,
    },
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Kullanıcı oluşturulamadı");
  }

  const now = new Date().toISOString();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert({
      id: created.user.id,
      email,
      full_name: input.fullName?.trim() || null,
      role,
      allowed_apps: allowedApps,
      is_active: input.isActive !== false,
      updated_at: now,
    })
    .select("id, email, full_name, role, allowed_apps, is_active, created_at, updated_at")
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profil oluşturulamadı");
  }

  const access = buildAccessProfile({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    allowedApps: profile.allowed_apps,
    isActive: profile.is_active,
  });

  return {
    ...access,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export interface UpdateManagedUserInput {
  fullName?: string;
  role?: UserRole;
  allowedApps?: ManagedAppKey[];
  isActive?: boolean;
  password?: string;
}

export async function updateManagedUser(
  id: string,
  input: UpdateManagedUserInput,
): Promise<ManagedUserRecord> {
  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("profiles")
    .select("id, email, full_name, role, allowed_apps, is_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    throw new Error(existingError?.message ?? "Kullanıcı bulunamadı");
  }

  const email = existing.email as string | null;
  let role: UserRole =
    input.role === "admin"
      ? "admin"
      : input.role === "viewer"
        ? "viewer"
        : existing.role === "admin"
          ? "admin"
          : "viewer";

  if (isConfiguredAdminEmail(email)) {
    role = "admin";
  }

  const allowedApps =
    role === "admin"
      ? [...MANAGED_APP_KEYS]
      : input.allowedApps
        ? parseAllowedApps(input.allowedApps)
        : parseAllowedApps(existing.allowed_apps);

  if (input.password) {
    if (input.password.length < 6) {
      throw new Error("Şifre en az 6 karakter olmalıdır");
    }
    const { error: passwordError } = await admin.auth.admin.updateUserById(id, {
      password: input.password,
    });
    if (passwordError) {
      throw new Error(passwordError.message);
    }
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .update({
      full_name:
        input.fullName !== undefined
          ? input.fullName.trim() || null
          : existing.full_name,
      role,
      allowed_apps: allowedApps,
      is_active:
        input.isActive !== undefined ? input.isActive : existing.is_active,
      email: normalizeEmail(email) || email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, email, full_name, role, allowed_apps, is_active, created_at, updated_at")
    .single();

  if (error || !profile) {
    throw new Error(error?.message ?? "Kullanıcı güncellenemedi");
  }

  const access = buildAccessProfile({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    allowedApps: profile.allowed_apps,
    isActive: profile.is_active,
  });

  return {
    ...access,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function deleteManagedUser(id: string): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .maybeSingle();

  if (isConfiguredAdminEmail(existing?.email)) {
    throw new Error("Süper admin hesabı silinemez");
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    throw new Error(error.message);
  }
}
