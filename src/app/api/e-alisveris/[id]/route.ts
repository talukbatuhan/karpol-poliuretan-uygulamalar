import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import {
  deleteShoppingRecord,
  getShoppingRecordById,
  updateShoppingRecord,
} from "@/lib/services/shopping-record-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { shoppingRecordFormSchema } from "@/lib/validations/shopping-record-form";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const record = await getShoppingRecordById(user.id, id);

    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt bulunamadı";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");

    if (typeof payloadRaw !== "string") {
      return NextResponse.json(
        { error: "Geçersiz form verisi" },
        { status: 400 },
      );
    }

    const body = JSON.parse(payloadRaw) as {
      form?: unknown;
      removedFileIds?: string[];
    };

    const parsed = shoppingRecordFormSchema.safeParse(body.form);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const files = getUploadedFiles(formData, "files");
    const removedFileIds = Array.isArray(body.removedFileIds)
      ? body.removedFileIds.filter((item): item is string => typeof item === "string")
      : [];

    const record = await updateShoppingRecord(
      user.id,
      id,
      parsed.data,
      files,
      removedFileIds,
    );

    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt güncellenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteShoppingRecord(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
