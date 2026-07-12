/** Admin panelinden yönetilebilir lookup kayıtları için temel entity tipi */
export interface LookupEntity {
  id: string;
  slug: string;
  label: string;
  isActive: boolean;
}

export interface UnitEntity extends LookupEntity {
  symbol: string;
}

/** Form dropdown'larında kullanılan sadeleştirilmiş seçenek */
export interface LookupOption {
  value: string;
  label: string;
  /** Personel için WhatsApp wa.me bağlantısı */
  phone?: string | null;
}

export type LookupType =
  | "cities"
  | "companies"
  | "cargo_companies"
  | "personnel"
  | "job_types"
  | "units";

export function entityToOption(entity: LookupEntity): LookupOption {
  return { value: entity.id, label: entity.label };
}
