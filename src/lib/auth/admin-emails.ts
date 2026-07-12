/** Her zaman admin — env'den bağımsız sabit süper yönetici */
export const SUPER_ADMIN_EMAIL = "karpoldenizli@gmail.com";

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}

export function getEnvAdminEmails(): string[] {
  return (
    process.env.ADMIN_EMAILS?.split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean) ?? []
  );
}

export function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  if (isSuperAdminEmail(normalized)) return true;
  return getEnvAdminEmails().includes(normalized);
}
