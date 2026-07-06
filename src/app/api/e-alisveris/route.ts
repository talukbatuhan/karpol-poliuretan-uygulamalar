import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import {
  createShoppingRecord,
  listShoppingRecords,
} from "@/lib/services/shopping-record-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { shoppingRecordFormSchema } from "@/lib/validations/shopping-record-form";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") ?? "";

    const records = await listShoppingRecords(user.id, search);
    return NextResponse.json({ records });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıtlar alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const formData = await request.formData();
    const payloadRaw = formData.get("payload");

    if (typeof payloadRaw !== "string") {
      return NextResponse.json(
        { error: "Geçersiz form verisi" },
        { status: 400 },
      );
    }

    const parsed = shoppingRecordFormSchema.safeParse(JSON.parse(payloadRaw));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const files = getUploadedFiles(formData, "files");
    const record = await createShoppingRecord(user.id, parsed.data, files);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
