import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import {
  createWorkOrder,
  listWorkOrders,
} from "@/lib/services/work-order-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { getAppBaseUrl } from "@/lib/utils/short-link";
import { workOrderFormSchema } from "@/lib/validations/work-order-form";
import type { AttachmentCategory } from "@/types/attachment";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const records = await listWorkOrders();
    return NextResponse.json({ records });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İş emirleri alınamadı";
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

    let payloadJson: unknown;
    try {
      payloadJson = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json(
        { error: "Geçersiz JSON gövdesi" },
        { status: 400 },
      );
    }

    const parsed = workOrderFormSchema.safeParse(payloadJson);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const productFiles = getUploadedFiles(formData, "productImages");
    const technicalFiles = getUploadedFiles(formData, "technicalImages");

    const images = [
      ...productFiles.map((file) => ({
        file,
        category: "product" as AttachmentCategory,
      })),
      ...technicalFiles.map((file) => ({
        file,
        category: "technical" as AttachmentCategory,
      })),
    ];

    const result = await createWorkOrder(
      parsed.data,
      {
        userId: user.id,
        appBaseUrl: getAppBaseUrl(request),
      },
      images,
    );

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İş kaydı oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
