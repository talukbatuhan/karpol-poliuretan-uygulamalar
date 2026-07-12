export type AppNavKey =
  | "dashboard"
  | "is-takip"
  | "firmalar"
  | "conta-takip"
  | "notlar"
  | "adres-yazici"
  | "e-alisveris"
  | "teknik-resim"
  | "kullanicilar";

/** Kullanıcıya atanabilir uygulama anahtarları (admin paneli hariç) */
export type ManagedAppKey = Exclude<AppNavKey, "dashboard" | "kullanicilar">;

export interface AppLink {
  key: AppNavKey;
  href: string;
  label: string;
}

export const APP_LINKS: AppLink[] = [
  { key: "is-takip", href: "/is-takip", label: "İş Takip" },
  { key: "firmalar", href: "/firmalar", label: "Firma Kartları" },
  { key: "conta-takip", href: "/conta-takip", label: "Conta Takip" },
  { key: "notlar", href: "/notlar", label: "Notlar" },
  { key: "adres-yazici", href: "/adres-yazici", label: "Adres Yazıcı" },
  { key: "e-alisveris", href: "/e-alisveris", label: "E-Alışveriş" },
  { key: "teknik-resim", href: "/teknik-resim", label: "Teknik Resim" },
];

export const ADMIN_APP_LINKS: AppLink[] = [
  {
    key: "kullanicilar",
    href: "/kullanicilar",
    label: "Kullanıcı Yönetimi",
  },
];

export const MANAGED_APP_KEYS: ManagedAppKey[] = APP_LINKS.map(
  (app) => app.key as ManagedAppKey,
);

export const ALL_NAV_LINKS: AppLink[] = [...APP_LINKS, ...ADMIN_APP_LINKS];

export function getActiveAppKey(pathname: string): AppNavKey | undefined {
  if (pathname === "/") return undefined;

  for (const app of ALL_NAV_LINKS) {
    if (pathname === app.href || pathname.startsWith(`${app.href}/`)) {
      return app.key;
    }
  }

  return undefined;
}

export function isManagedAppKey(value: string): value is ManagedAppKey {
  return MANAGED_APP_KEYS.includes(value as ManagedAppKey);
}
