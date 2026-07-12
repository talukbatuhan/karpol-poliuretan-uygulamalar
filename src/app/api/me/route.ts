import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getCurrentAccessProfile } from "@/lib/services/user-access-service";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const profile = await getCurrentAccessProfile();
    if (!profile) {
      return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
    }

    if (!profile.isActive) {
      return NextResponse.json({ error: "Hesap pasif" }, { status: 403 });
    }

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      isAdmin: profile.isAdmin,
      allowedApps: profile.allowedApps,
      isActive: profile.isActive,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profil alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
