import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth/require-admin";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const isAdmin = await isAdminUser();

  return NextResponse.json({
    email: user.email,
    isAdmin,
  });
}
