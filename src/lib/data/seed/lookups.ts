import type {
  LookupEntity,
  LookupType,
  UnitEntity,
} from "@/types/lookup";

/**
 * Türkiye'nin 81 ili.
 * Mevcut 8 şehrin UUID'leri eski seed / migration ile uyumlu tutulur;
 * diğer iller plaka koduna göre üretilir (…00000001XXXX).
 */
const EXISTING_CITY_IDS: Record<string, string> = {
  istanbul: "c1000000-0000-4000-8000-000000000001",
  ankara: "c1000000-0000-4000-8000-000000000002",
  izmir: "c1000000-0000-4000-8000-000000000003",
  bursa: "c1000000-0000-4000-8000-000000000004",
  kocaeli: "c1000000-0000-4000-8000-000000000005",
  antalya: "c1000000-0000-4000-8000-000000000006",
  gaziantep: "c1000000-0000-4000-8000-000000000007",
  konya: "c1000000-0000-4000-8000-000000000008",
};

function cityId(slug: string, plate: number): string {
  return (
    EXISTING_CITY_IDS[slug] ??
    `c1000000-0000-4000-8000-00000001${String(plate).padStart(4, "0")}`
  );
}

const TURKEY_CITIES: Array<{ plate: number; slug: string; label: string }> = [
  { plate: 1, slug: "adana", label: "Adana" },
  { plate: 2, slug: "adiyaman", label: "Adıyaman" },
  { plate: 3, slug: "afyonkarahisar", label: "Afyonkarahisar" },
  { plate: 4, slug: "agri", label: "Ağrı" },
  { plate: 5, slug: "amasya", label: "Amasya" },
  { plate: 6, slug: "ankara", label: "Ankara" },
  { plate: 7, slug: "antalya", label: "Antalya" },
  { plate: 8, slug: "artvin", label: "Artvin" },
  { plate: 9, slug: "aydin", label: "Aydın" },
  { plate: 10, slug: "balikesir", label: "Balıkesir" },
  { plate: 11, slug: "bilecik", label: "Bilecik" },
  { plate: 12, slug: "bingol", label: "Bingöl" },
  { plate: 13, slug: "bitlis", label: "Bitlis" },
  { plate: 14, slug: "bolu", label: "Bolu" },
  { plate: 15, slug: "burdur", label: "Burdur" },
  { plate: 16, slug: "bursa", label: "Bursa" },
  { plate: 17, slug: "canakkale", label: "Çanakkale" },
  { plate: 18, slug: "cankiri", label: "Çankırı" },
  { plate: 19, slug: "corum", label: "Çorum" },
  { plate: 20, slug: "denizli", label: "Denizli" },
  { plate: 21, slug: "diyarbakir", label: "Diyarbakır" },
  { plate: 22, slug: "edirne", label: "Edirne" },
  { plate: 23, slug: "elazig", label: "Elazığ" },
  { plate: 24, slug: "erzincan", label: "Erzincan" },
  { plate: 25, slug: "erzurum", label: "Erzurum" },
  { plate: 26, slug: "eskisehir", label: "Eskişehir" },
  { plate: 27, slug: "gaziantep", label: "Gaziantep" },
  { plate: 28, slug: "giresun", label: "Giresun" },
  { plate: 29, slug: "gumushane", label: "Gümüşhane" },
  { plate: 30, slug: "hakkari", label: "Hakkâri" },
  { plate: 31, slug: "hatay", label: "Hatay" },
  { plate: 32, slug: "isparta", label: "Isparta" },
  { plate: 33, slug: "mersin", label: "Mersin" },
  { plate: 34, slug: "istanbul", label: "İstanbul" },
  { plate: 35, slug: "izmir", label: "İzmir" },
  { plate: 36, slug: "kars", label: "Kars" },
  { plate: 37, slug: "kastamonu", label: "Kastamonu" },
  { plate: 38, slug: "kayseri", label: "Kayseri" },
  { plate: 39, slug: "kirklareli", label: "Kırklareli" },
  { plate: 40, slug: "kirsehir", label: "Kırşehir" },
  { plate: 41, slug: "kocaeli", label: "Kocaeli" },
  { plate: 42, slug: "konya", label: "Konya" },
  { plate: 43, slug: "kutahya", label: "Kütahya" },
  { plate: 44, slug: "malatya", label: "Malatya" },
  { plate: 45, slug: "manisa", label: "Manisa" },
  { plate: 46, slug: "kahramanmaras", label: "Kahramanmaraş" },
  { plate: 47, slug: "mardin", label: "Mardin" },
  { plate: 48, slug: "mugla", label: "Muğla" },
  { plate: 49, slug: "mus", label: "Muş" },
  { plate: 50, slug: "nevsehir", label: "Nevşehir" },
  { plate: 51, slug: "nigde", label: "Niğde" },
  { plate: 52, slug: "ordu", label: "Ordu" },
  { plate: 53, slug: "rize", label: "Rize" },
  { plate: 54, slug: "sakarya", label: "Sakarya" },
  { plate: 55, slug: "samsun", label: "Samsun" },
  { plate: 56, slug: "siirt", label: "Siirt" },
  { plate: 57, slug: "sinop", label: "Sinop" },
  { plate: 58, slug: "sivas", label: "Sivas" },
  { plate: 59, slug: "tekirdag", label: "Tekirdağ" },
  { plate: 60, slug: "tokat", label: "Tokat" },
  { plate: 61, slug: "trabzon", label: "Trabzon" },
  { plate: 62, slug: "tunceli", label: "Tunceli" },
  { plate: 63, slug: "sanliurfa", label: "Şanlıurfa" },
  { plate: 64, slug: "usak", label: "Uşak" },
  { plate: 65, slug: "van", label: "Van" },
  { plate: 66, slug: "yozgat", label: "Yozgat" },
  { plate: 67, slug: "zonguldak", label: "Zonguldak" },
  { plate: 68, slug: "aksaray", label: "Aksaray" },
  { plate: 69, slug: "bayburt", label: "Bayburt" },
  { plate: 70, slug: "karaman", label: "Karaman" },
  { plate: 71, slug: "kirikkale", label: "Kırıkkale" },
  { plate: 72, slug: "batman", label: "Batman" },
  { plate: 73, slug: "sirnak", label: "Şırnak" },
  { plate: 74, slug: "bartin", label: "Bartın" },
  { plate: 75, slug: "ardahan", label: "Ardahan" },
  { plate: 76, slug: "igdir", label: "Iğdır" },
  { plate: 77, slug: "yalova", label: "Yalova" },
  { plate: 78, slug: "karabuk", label: "Karabük" },
  { plate: 79, slug: "kilis", label: "Kilis" },
  { plate: 80, slug: "osmaniye", label: "Osmaniye" },
  { plate: 81, slug: "duzce", label: "Düzce" },
];

export const SEED_CITIES: LookupEntity[] = TURKEY_CITIES.map((city) => ({
  id: cityId(city.slug, city.plate),
  slug: city.slug,
  label: city.label,
  isActive: true,
}));

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
