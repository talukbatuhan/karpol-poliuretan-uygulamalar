import {
  getSeedEntities,
  getSeedUnits,
} from "@/lib/data/seed/lookups";
import type { LookupEntity, LookupOption, LookupType, UnitEntity } from "@/types/lookup";
import { entityToOption } from "@/types/lookup";

/**
 * Lookup verilerine erişim katmanı.
 * Şimdilik seed veri döner; admin paneli sonrası Supabase sorgularına geçirilebilir.
 */
export async function fetchLookupEntities(type: LookupType): Promise<LookupEntity[]> {
  return getSeedEntities(type);
}

export async function fetchLookupOptions(type: LookupType): Promise<LookupOption[]> {
  const entities = await fetchLookupEntities(type);
  return entities.map(entityToOption);
}

export async function fetchUnitEntities(): Promise<UnitEntity[]> {
  return getSeedUnits();
}

export async function fetchUnitOptions(): Promise<LookupOption[]> {
  const units = await fetchUnitEntities();
  return units.map((unit) => ({
    value: unit.id,
    label: `${unit.label} (${unit.symbol})`,
  }));
}

/** Senkron erişim — client form bileşenleri için */
export function getLookupOptions(type: LookupType): LookupOption[] {
  return getSeedEntities(type).map(entityToOption);
}

export function getUnitOptions(): LookupOption[] {
  return getSeedUnits().map((unit) => ({
    value: unit.id,
    label: `${unit.label} (${unit.symbol})`,
  }));
}

export function getLookupIds(type: LookupType): string[] {
  return getSeedEntities(type).map((entity) => entity.id);
}
