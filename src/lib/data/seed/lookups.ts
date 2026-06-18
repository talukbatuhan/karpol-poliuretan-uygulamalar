import type {
  LookupEntity,
  LookupType,
  UnitEntity,
} from "@/types/lookup";

/**
 * Test aşaması seed verileri.
 * UUID'ler supabase/migrations ile eşleşir; admin paneli aktif olunca
 * lookup-repository Supabase sorgularına yönlendirilebilir.
 */
export const SEED_CITIES: LookupEntity[] = [
  { id: "c1000000-0000-4000-8000-000000000001", slug: "istanbul", label: "İstanbul", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000002", slug: "ankara", label: "Ankara", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000003", slug: "izmir", label: "İzmir", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000004", slug: "bursa", label: "Bursa", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000005", slug: "kocaeli", label: "Kocaeli", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000006", slug: "antalya", label: "Antalya", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000007", slug: "gaziantep", label: "Gaziantep", isActive: true },
  { id: "c1000000-0000-4000-8000-000000000008", slug: "konya", label: "Konya", isActive: true },
];

export const SEED_COMPANIES: LookupEntity[] = [
  { id: "a2000000-0000-4000-8000-000000000001", slug: "karpol-as", label: "Karpol A.Ş.", isActive: true },
  { id: "a2000000-0000-4000-8000-000000000002", slug: "delta-endustri", label: "Delta Endüstri Ltd.", isActive: true },
  { id: "a2000000-0000-4000-8000-000000000003", slug: "nova-makine", label: "Nova Makine San.", isActive: true },
  { id: "a2000000-0000-4000-8000-000000000004", slug: "zenit-lojistik", label: "Zenit Lojistik", isActive: true },
  { id: "a2000000-0000-4000-8000-000000000005", slug: "atlas-metal", label: "Atlas Metal Tic.", isActive: true },
  { id: "a2000000-0000-4000-8000-000000000006", slug: "vizyon-teknik", label: "Vizyon Teknik Hiz.", isActive: true },
];

export const SEED_CARGO_COMPANIES: LookupEntity[] = [
  { id: "b3000000-0000-4000-8000-000000000001", slug: "yurtici", label: "Yurtiçi Kargo", isActive: true },
  { id: "b3000000-0000-4000-8000-000000000002", slug: "aras", label: "Aras Kargo", isActive: true },
  { id: "b3000000-0000-4000-8000-000000000003", slug: "mng", label: "MNG Kargo", isActive: true },
  { id: "b3000000-0000-4000-8000-000000000004", slug: "ptt", label: "PTT Kargo", isActive: true },
  { id: "b3000000-0000-4000-8000-000000000005", slug: "surat", label: "Sürat Kargo", isActive: true },
];

export const SEED_PERSONNEL: LookupEntity[] = [
  { id: "d4000000-0000-4000-8000-000000000001", slug: "ahmet-yilmaz", label: "Ahmet Yılmaz", isActive: true },
  { id: "d4000000-0000-4000-8000-000000000002", slug: "elif-kaya", label: "Elif Kaya", isActive: true },
  { id: "d4000000-0000-4000-8000-000000000003", slug: "mehmet-demir", label: "Mehmet Demir", isActive: true },
  { id: "d4000000-0000-4000-8000-000000000004", slug: "zeynep-celik", label: "Zeynep Çelik", isActive: true },
  { id: "d4000000-0000-4000-8000-000000000005", slug: "can-ozturk", label: "Can Öztürk", isActive: true },
];

export const SEED_JOB_TYPES: LookupEntity[] = [
  { id: "e5000000-0000-4000-8000-000000000001", slug: "uretim", label: "Üretim", isActive: true },
  { id: "e5000000-0000-4000-8000-000000000002", slug: "montaj", label: "Montaj", isActive: true },
  { id: "e5000000-0000-4000-8000-000000000003", slug: "bakim", label: "Bakım", isActive: true },
  { id: "e5000000-0000-4000-8000-000000000004", slug: "kalite-kontrol", label: "Kalite Kontrol", isActive: true },
  { id: "e5000000-0000-4000-8000-000000000005", slug: "lojistik", label: "Lojistik", isActive: true },
  { id: "e5000000-0000-4000-8000-000000000006", slug: "satinalma", label: "Satın Alma", isActive: true },
];

export const SEED_UNITS: UnitEntity[] = [
  { id: "f6000000-0000-4000-8000-000000000001", slug: "adet", label: "Adet", symbol: "adet", isActive: true },
  { id: "f6000000-0000-4000-8000-000000000002", slug: "kg", label: "Kilogram", symbol: "kg", isActive: true },
  { id: "f6000000-0000-4000-8000-000000000003", slug: "lt", label: "Litre", symbol: "lt", isActive: true },
  { id: "f6000000-0000-4000-8000-000000000004", slug: "ml", label: "Mililitre", symbol: "ml", isActive: true },
  { id: "f6000000-0000-4000-8000-000000000005", slug: "m", label: "Metre", symbol: "m", isActive: true },
  { id: "f6000000-0000-4000-8000-000000000006", slug: "m2", label: "Metrekare", symbol: "m²", isActive: true },
  { id: "f6000000-0000-4000-8000-000000000007", slug: "paket", label: "Paket", symbol: "paket", isActive: true },
];

const SEED_REGISTRY: Record<LookupType, LookupEntity[]> = {
  cities: SEED_CITIES,
  companies: SEED_COMPANIES,
  cargo_companies: SEED_CARGO_COMPANIES,
  personnel: SEED_PERSONNEL,
  job_types: SEED_JOB_TYPES,
  units: SEED_UNITS,
};

export function getSeedEntities(type: LookupType): LookupEntity[] {
  return SEED_REGISTRY[type].filter((entity) => entity.isActive);
}

export function getSeedUnits(): UnitEntity[] {
  return SEED_UNITS.filter((unit) => unit.isActive);
}
