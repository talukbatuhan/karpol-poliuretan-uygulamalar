import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { isManagedAppKey, type ManagedAppKey } from "@/lib/constants/app-links";
import {
  deleteManagedUser,
  updateManagedUser,
} from "@/lib/services/user-access-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  fullName: z.string().optional(),
  role: z.enum(["admin", "viewer"]).optional(),
  allowedApps: z
    .array(z.string())
    .transform((apps) =>
      apps.filter((app): app is ManagedAppKey => isManagedAppKey(app)),
    )
    .optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const password =
      parsed.data.password && parsed.data.password.length > 0
        ? parsed.data.password
        : undefined;

    const user = await updateManagedUser(id, {
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      allowedApps: parsed.data.allowedApps,
      isActive: parsed.data.isActive,
      password,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kullanıcı güncellenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { id } = await context.params;
    await deleteManagedUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kullanıcı silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
