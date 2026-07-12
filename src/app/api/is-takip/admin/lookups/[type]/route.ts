import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createWorkOrderLookup,
  listWorkOrderLookups,
} from "@/lib/services/work-order-lookup-service";
import { isWorkOrderLookupType } from "@/types/work-order-lookup";

interface RouteContext {
  params: Promise<{ type: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { type } = await context.params;
    if (!isWorkOrderLookupType(type)) {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }

    const items = await listWorkOrderLookups(type, false);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Liste alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { type } = await context.params;
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

    const item = await createWorkOrderLookup(type, {
      label: body.label,
      phone: body.phone,
      isActive: body.isActive,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kayıt oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}