import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteWorkOrderLookup,
  updateWorkOrderLookup,
} from "@/lib/services/work-order-lookup-service";
import { isWorkOrderLookupType } from "@/types/work-order-lookup";

interface RouteContext {
  params: Promise<{ type: string; id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { type, id } = await context.params;
    if (!isWorkOrderLookupType(type)) {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }

    const body = (await request.json()) as {
      label?: string;
      phone?: string;
      isActive?: boolean;
    };

    if (!body.label?.trim()) {
      return NextResponse.json({ error: "Ad zorunludur" }, { status: 400 });
    }

    const item = await updateWorkOrderLookup(type, id, {
      label: body.label,
      phone: body.phone,
      isActive: body.isActive,
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kayıt güncellenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { type, id } = await context.params;
    if (!isWorkOrderLookupType(type)) {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }

    await deleteWorkOrderLookup(type, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kayıt silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
