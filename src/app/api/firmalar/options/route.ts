import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { listActiveCompanyCardOptions } from "@/lib/services/company-registry-service";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const options = await listActiveCompanyCardOptions();
    return NextResponse.json({ options });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Firma kartları alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
