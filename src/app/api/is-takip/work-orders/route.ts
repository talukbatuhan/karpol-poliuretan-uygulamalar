import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { createWorkOrder } from "@/lib/services/work-order-service";
import { workOrderFormSchema } from "@/lib/validations/work-order-form";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = workOrderFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let birimLabel = "";
    if (parsed.data.birimId) {
      const supabase = createAdminClient();
      const { data: unit } = await supabase
        .from("units")
        .select("symbol")
        .eq("id", parsed.data.birimId)
        .maybeSingle();
      birimLabel = unit?.symbol ?? "";
    }

    const result = await createWorkOrder(parsed.data, {
      userId: user.id,
      userEmail: user.email ?? "—",
      userName: user.user_metadata?.full_name as string | undefined,
    }, birimLabel);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İş kaydı oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
