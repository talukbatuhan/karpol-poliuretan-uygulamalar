-- Firma kayıt defteri (genişletilmiş şirket profili)

create type company_type as enum (
  'musteri',
  'tedarikci',
  'nakliye',
  'is_ortagi',
  'diger'
);

create type company_status as enum ('active', 'inactive');

create table if not exists company_registry (
  id uuid primary key default gen_random_uuid(),
  company_code text not null unique,
  legal_name text not null,
  short_name text not null,
  company_type company_type not null,
  contact_person text,
  phone text,
  mobile_phone text,
  email text,
  website text,
  city_id uuid references cities(id) on delete set null,
  district text,
  address text,
  status company_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_company_registry_short_name
  on company_registry(short_name);

create index if not exists idx_company_registry_city
  on company_registry(city_id);

create index if not exists idx_company_registry_status
  on company_registry(status);

create index if not exists idx_company_registry_type
  on company_registry(company_type);
