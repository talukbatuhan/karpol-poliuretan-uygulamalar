import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { resolveIsAdmin } from "@/lib/auth/access";
import { isConfiguredAdminEmail } from "@/lib/auth/admin-emails";

export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;

  if (isConfiguredAdminEmail(user.email)) {
    return user;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    return null;
  }

  if (resolveIsAdmin({ email: user.email, role: profile?.role })) {
    return user;
  }

  return null;
}

export async function isAdminUser(): Promise<boolean> {
  const admin = await requireAdmin();
  return admin !== null;
}
