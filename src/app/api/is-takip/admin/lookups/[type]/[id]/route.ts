import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
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
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
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
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
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
