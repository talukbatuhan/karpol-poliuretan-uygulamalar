import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteCompanyCard,
  updateCompanyCard,
} from "@/lib/services/company-registry-service";
import { companyFormSchema } from "@/lib/validations/company-form";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = companyFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const record = await updateCompanyCard(id, parsed.data);
    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Firma kartı güncellenemedi";
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
    await deleteCompanyCard(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Firma kartı silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
