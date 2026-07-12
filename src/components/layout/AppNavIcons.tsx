import type { ReactNode } from "react";

import type { AppNavKey } from "@/lib/constants/app-links";

type IconProps = {
  className?: string;
};

function IconFrame({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function HomeNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-7h4v7" />
    </IconFrame>
  );
}

export function IsTakipNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M7 3h10v18H7z" />
      <path d="M10 7h4M10 11h4M10 15h3" />
      <path d="M5 6h2M5 12h2M5 18h2" />
    </IconFrame>
  );
}

export function FirmalarNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
    </IconFrame>
  );
}

export function ContaTakipNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" />
    </IconFrame>
  );
}

export function NotlarNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M15 3v5h5" />
      <path d="M9 12h6M9 16h4" />
    </IconFrame>
  );
}

export function AdresYaziciNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M7 8V4h10v4" />
      <path d="M5 8h14v9H5z" />
      <path d="M8 17v3h8v-3" />
      <path d="M8 12h8" />
    </IconFrame>
  );
}

export function EAlisverisNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 5h2l2.2 10h9.3L20 8H8" />
      <circle cx="10" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </IconFrame>
  );
}

export function TeknikResimNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v7h-7z" />
      <path d="M4 13h7v7H4z" />
      <path d="M14 14l6 6M20 14l-6 6" />
    </IconFrame>
  );
}

export function KullanicilarNavIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 20c0-2.5-1.5-4.5-4-5" />
    </IconFrame>
  );
}

const NAV_ICONS: Record<
  AppNavKey | "home",
  (props: IconProps) => ReactNode
> = {
  home: HomeNavIcon,
  dashboard: HomeNavIcon,
  "is-takip": IsTakipNavIcon,
  firmalar: FirmalarNavIcon,
  "conta-takip": ContaTakipNavIcon,
  notlar: NotlarNavIcon,
  "adres-yazici": AdresYaziciNavIcon,
  "e-alisveris": EAlisverisNavIcon,
  "teknik-resim": TeknikResimNavIcon,
  kullanicilar: KullanicilarNavIcon,
};

export function AppNavIcon({
  name,
  className = "h-5 w-5",
}: {
  name: AppNavKey | "home";
  className?: string;
}) {
  const Icon = NAV_ICONS[name];
  return <Icon className={className} />;
}
