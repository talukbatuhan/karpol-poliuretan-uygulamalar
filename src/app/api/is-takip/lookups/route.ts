import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { listWorkOrderLookups } from "@/lib/services/work-order-lookup-service";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LookupOption } from "@/types/lookup";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const [companies, jobTypes, personnel] = await Promise.all([
      listWorkOrderLookups("companies"),
      listWorkOrderLookups("job_types"),
      listWorkOrderLookups("personnel"),
    ]);

    const supabase = createAdminClient();

    const [citiesRes, cargoRes, unitsRes] = await Promise.all([
      supabase.from("cities").select("id, name").eq("is_active", true).order("name"),
      supabase
        .from("cargo_companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase.from("units").select("id, name, symbol").eq("is_active", true).order("name"),
    ]);

    const toOptions = (rows: { id: string; name: string }[]): LookupOption[] =>
      rows.map((row) => ({ value: row.id, label: row.name }));

    const cities = toOptions(citiesRes.data ?? []);
    const cargoCompanies = toOptions(cargoRes.data ?? []);
    const units: LookupOption[] = (unitsRes.data ?? []).map(
      (unit: { id: string; name: string; symbol: string }) => ({
        value: unit.id,
        label: `${unit.name} (${unit.symbol})`,
      }),
    );

    return NextResponse.json({
      companies: companies.map((item) => ({ value: item.id, label: item.label })),
      jobTypes: jobTypes.map((item) => ({ value: item.id, label: item.label })),
      personnel: personnel.map((item) => ({
        value: item.id,
        label: item.phone ? `${item.label} (${item.phone})` : item.label,
      })),
      cities,
      cargoCompanies,
      units,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lookup verileri alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
