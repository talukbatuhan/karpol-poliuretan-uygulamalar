import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { requireUser } from "@/lib/auth/require-user";
import {
  deleteWorkOrder,
  getWorkOrderById,
  markWorkOrderWhatsAppSent,
  updateWorkOrderCompletionStatus,
} from "@/lib/services/work-order-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const patchSchema = z.union([
  z.object({
    completionStatus: z.enum(["incomplete", "completed"]),
  }),
  z.object({
    whatsappSent: z.literal(true),
  }),
]);

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const record = await getWorkOrderById(id);
    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İş emri alınamadı";
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
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz istek gövdesi" },
        { status: 400 },
      );
    }

    if ("whatsappSent" in parsed.data) {
      const record = await markWorkOrderWhatsAppSent(id);
      return NextResponse.json({ record });
    }

    const record = await updateWorkOrderCompletionStatus(
      id,
      parsed.data.completionStatus,
    );
    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İş emri güncellenemedi";
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
    await deleteWorkOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İş emri silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
