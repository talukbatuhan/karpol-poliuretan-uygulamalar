export type AppNavKey =
  | "dashboard"
  | "is-takip"
  | "firmalar"
  | "conta-takip"
  | "notlar"
  | "adres-yazici"
  | "e-alisveris"
  | "teknik-resim";

export const APP_LINKS: AppLink[] = [
  {
    key: "is-takip",
    href: "/is-takip",
    label: "İş Takip",
    description: "İş emirleri ve günlük takip kayıtları",
  },
  {
    key: "firmalar",
    href: "/firmalar",
    label: "Firmalar",
    description: "Firma kayıtları ve yönetimi",
  },
  {
    key: "conta-takip",
    href: "/conta-takip",
    label: "Conta Takip",
    description: "Conta üretim ve sipariş takibi",
  },
  {
    key: "notlar",
    href: "/notlar",
    label: "Notlar",
    description: "Hızlı not alma ve görsel ekleme",
  },
  {
    key: "adres-yazici",
    href: "/adres-yazici",
    label: "Adres Yazıcı",
    description: "Adres etiketi oluşturma ve yazdırma",
  },
  {
    key: "e-alisveris",
    href: "/e-alisveris",
    label: "E-Alışveriş",
    description: "Kişisel alışveriş kayıtları ve faturalar",
  },
  {
    key: "teknik-resim",
    href: "/teknik-resim",
    label: "Teknik Resim",
    description: "Ölçek, birim ve açı hesaplama araçları",
  },
];

export interface AppLink {
  key: AppNavKey;
  href: string;
  label: string;
  description: string;
}

export function getActiveAppKey(pathname: string): AppNavKey | undefined {
  if (pathname === "/") return undefined;

  for (const app of APP_LINKS) {
    if (pathname === app.href || pathname.startsWith(`${app.href}/`)) {
      return app.key;
    }
  }

  return undefined;
}
