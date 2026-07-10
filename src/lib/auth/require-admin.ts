import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()) ??
    [];

  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return user;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return user;
  }

  return null;
}

export async function isAdminUser(): Promise<boolean> {
  const admin = await requireAdmin();
  return admin !== null;
}
