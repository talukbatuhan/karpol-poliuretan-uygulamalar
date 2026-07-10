-- İş takip: admin özelleştirme, WhatsApp ve profil desteği

create extension if not exists "pgcrypto";

-- ─── Lookup tabloları ─────────────────────────────────────────────────────────

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cargo_companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists personnel (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  symbol text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table personnel add column if not exists phone text;

-- ─── Kullanıcı profilleri (admin) ───────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── İş kayıtları ───────────────────────────────────────────────────────────

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  tarih date not null default current_date,
  city_id uuid references cities(id) on delete set null,
  talep_eden_firma_id uuid not null references companies(id),
  uygulayici_firma_id uuid not null references companies(id),
  is_turu_id uuid not null references job_types(id),
  is_aciklamasi text,
  miktar numeric(12, 3) not null check (miktar > 0),
  birim_id uuid references units(id) on delete set null,
  planlanan_teslim_tarihi date,
  kargo_firmasi_id uuid references cargo_companies(id) on delete set null,
  talebi_olusturan_personel_id uuid references personnel(id) on delete set null,
  sorumlu_personel_id uuid not null references personnel(id),
  notlar text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table work_orders add column if not exists created_by_user_id uuid references auth.users(id) on delete set null;
alter table work_orders add column if not exists whatsapp_sent_at timestamptz;

create index if not exists idx_work_orders_tarih on work_orders(tarih desc);
create index if not exists idx_work_orders_sorumlu on work_orders(sorumlu_personel_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table companies enable row level security;
alter table job_types enable row level security;
alter table personnel enable row level security;
alter table work_orders enable row level security;
alter table profiles enable row level security;

drop policy if exists "companies_select" on companies;
create policy "companies_select" on companies for select to authenticated using (is_active = true);

drop policy if exists "job_types_select" on job_types;
create policy "job_types_select" on job_types for select to authenticated using (is_active = true);

drop policy if exists "personnel_select" on personnel;
create policy "personnel_select" on personnel for select to authenticated using (is_active = true);

drop policy if exists "work_orders_select" on work_orders;
create policy "work_orders_select" on work_orders for select to authenticated using (true);

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles for select to authenticated using (id = auth.uid());

-- Seed (minimal)
insert into companies (id, slug, name) values
  ('a2000000-0000-4000-8000-000000000001', 'karpol-as', 'Karpol A.Ş.')
on conflict (id) do nothing;

insert into job_types (id, slug, name) values
  ('e5000000-0000-4000-8000-000000000001', 'uretim', 'Üretim')
on conflict (id) do nothing;

insert into personnel (id, slug, full_name, phone) values
  ('d4000000-0000-4000-8000-000000000001', 'ornek-personel', 'Örnek Personel', '905551234567')
on conflict (id) do nothing;

insert into units (id, slug, name, symbol) values
  ('f6000000-0000-4000-8000-000000000001', 'adet', 'Adet', 'adet')
on conflict (id) do nothing;
