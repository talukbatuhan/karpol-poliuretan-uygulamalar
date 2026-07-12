import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "work-order-images";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const shortCode = code?.trim();

  if (!shortCode || !/^[a-zA-Z0-9]{4,32}$/.test(shortCode)) {
    return NextResponse.json({ error: "Geçersiz link" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("work_order_attachments")
    .select("file_path")
    .eq("short_code", shortCode)
    .maybeSingle();

  if (error || !data?.file_path) {
    return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 404 });
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.file_path);

  return NextResponse.redirect(publicUrlData.publicUrl, 302);
}
