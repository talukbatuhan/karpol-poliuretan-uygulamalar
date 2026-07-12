import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { isManagedAppKey, type ManagedAppKey } from "@/lib/constants/app-links";
import {
  createManagedUser,
  listManagedUsers,
} from "@/lib/services/user-access-service";

const createSchema = z.object({
  email: z.string().email("Geçerli e-posta giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  fullName: z.string().optional(),
  role: z.enum(["admin", "viewer"]),
  allowedApps: z.array(z.string()).transform((apps) =>
    apps.filter((app): app is ManagedAppKey => isManagedAppKey(app)),
  ),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const users = await listManagedUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kullanıcılar alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await createManagedUser({
      email: parsed.data.email,
      password: parsed.data.password,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      allowedApps: parsed.data.allowedApps,
      isActive: parsed.data.isActive,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kullanıcı oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
