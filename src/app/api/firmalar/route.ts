import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { requireUser } from "@/lib/auth/require-user";
import {
  createCompanyCard,
  listCompanyCards,
} from "@/lib/services/company-registry-service";
import { companyFormSchema } from "@/lib/validations/company-form";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const records = await listCompanyCards();
    return NextResponse.json({ records });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Firma kartları alınamadı";
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
    const parsed = companyFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const record = await createCompanyCard(parsed.data);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Firma kartı oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
