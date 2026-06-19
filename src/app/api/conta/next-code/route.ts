import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getNextContaCode } from "@/lib/services/conta-service";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const nextCode = await getNextContaCode();
    return NextResponse.json({ nextCode });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conta kodu alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
