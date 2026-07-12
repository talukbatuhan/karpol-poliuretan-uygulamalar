import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import {
  deleteContaRecord,
  getContaRecordById,
  updateContaRecord,
} from "@/lib/services/conta-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { contaFormSchema } from "@/lib/validations/conta-form";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const contaUpdatePayloadSchema = contaFormSchema.extend({
  removedAttachmentIds: z.array(z.string().uuid()).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const record = await getContaRecordById(id);
    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conta kaydı alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
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

    const parsed = contaUpdatePayloadSchema.safeParse(JSON.parse(payloadRaw));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const images = getUploadedFiles(formData, "images");
    const { removedAttachmentIds, ...form } = parsed.data;

    const result = await updateContaRecord(
      id,
      form,
      images,
      removedAttachmentIds ?? [],
    );

    return NextResponse.json({
      success: true,
      id: result.id,
      contaCode: result.contaCode,
      imageUrls: result.imageUrls,
      sheetsSynced: result.sheetsSynced,
      sheetsWarning: result.sheetsSynced
        ? undefined
        : result.sheetsError ??
          "Google E-Tablolar senkronu yapılandırılmamış veya başarısız oldu.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conta kaydı güncellenemedi";
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
    await deleteContaRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conta kaydı silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
