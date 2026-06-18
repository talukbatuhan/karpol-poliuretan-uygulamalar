-- İş Takip Paneli — ilişkisel veritabanı şeması
-- Supabase SQL Editor veya migration ile çalıştırılabilir.

create extension if not exists "pgcrypto";

-- ─── Lookup tabloları (admin panelinden yönetilebilir) ───────────────────────

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

-- ─── Ana iş kaydı tablosu ────────────────────────────────────────────────────

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_work_orders_tarih on work_orders(tarih desc);
create index if not exists idx_work_orders_talep_eden on work_orders(talep_eden_firma_id);
create index if not exists idx_work_orders_uygulayici on work_orders(uygulayici_firma_id);
create index if not exists idx_work_orders_sorumlu on work_orders(sorumlu_personel_id);
create index if not exists idx_work_orders_is_turu on work_orders(is_turu_id);

-- ─── Seed verileri (uygulama seed dosyası ile eşleşir) ───────────────────────

insert into cities (id, slug, name) values
  ('c1000000-0000-4000-8000-000000000001', 'istanbul', 'İstanbul'),
  ('c1000000-0000-4000-8000-000000000002', 'ankara', 'Ankara'),
  ('c1000000-0000-4000-8000-000000000003', 'izmir', 'İzmir'),
  ('c1000000-0000-4000-8000-000000000004', 'bursa', 'Bursa'),
  ('c1000000-0000-4000-8000-000000000005', 'kocaeli', 'Kocaeli'),
  ('c1000000-0000-4000-8000-000000000006', 'antalya', 'Antalya'),
  ('c1000000-0000-4000-8000-000000000007', 'gaziantep', 'Gaziantep'),
  ('c1000000-0000-4000-8000-000000000008', 'konya', 'Konya')
on conflict (id) do nothing;

insert into companies (id, slug, name) values
  ('a2000000-0000-4000-8000-000000000001', 'karpol-as', 'Karpol A.Ş.'),
  ('a2000000-0000-4000-8000-000000000002', 'delta-endustri', 'Delta Endüstri Ltd.'),
  ('a2000000-0000-4000-8000-000000000003', 'nova-makine', 'Nova Makine San.'),
  ('a2000000-0000-4000-8000-000000000004', 'zenit-lojistik', 'Zenit Lojistik'),
  ('a2000000-0000-4000-8000-000000000005', 'atlas-metal', 'Atlas Metal Tic.'),
  ('a2000000-0000-4000-8000-000000000006', 'vizyon-teknik', 'Vizyon Teknik Hiz.')
on conflict (id) do nothing;

insert into cargo_companies (id, slug, name) values
  ('b3000000-0000-4000-8000-000000000001', 'yurtici', 'Yurtiçi Kargo'),
  ('b3000000-0000-4000-8000-000000000002', 'aras', 'Aras Kargo'),
  ('b3000000-0000-4000-8000-000000000003', 'mng', 'MNG Kargo'),
  ('b3000000-0000-4000-8000-000000000004', 'ptt', 'PTT Kargo'),
  ('b3000000-0000-4000-8000-000000000005', 'surat', 'Sürat Kargo')
on conflict (id) do nothing;

insert into personnel (id, slug, full_name) values
  ('d4000000-0000-4000-8000-000000000001', 'ahmet-yilmaz', 'Ahmet Yılmaz'),
  ('d4000000-0000-4000-8000-000000000002', 'elif-kaya', 'Elif Kaya'),
  ('d4000000-0000-4000-8000-000000000003', 'mehmet-demir', 'Mehmet Demir'),
  ('d4000000-0000-4000-8000-000000000004', 'zeynep-celik', 'Zeynep Çelik'),
  ('d4000000-0000-4000-8000-000000000005', 'can-ozturk', 'Can Öztürk')
on conflict (id) do nothing;

insert into job_types (id, slug, name) values
  ('e5000000-0000-4000-8000-000000000001', 'uretim', 'Üretim'),
  ('e5000000-0000-4000-8000-000000000002', 'montaj', 'Montaj'),
  ('e5000000-0000-4000-8000-000000000003', 'bakim', 'Bakım'),
  ('e5000000-0000-4000-8000-000000000004', 'kalite-kontrol', 'Kalite Kontrol'),
  ('e5000000-0000-4000-8000-000000000005', 'lojistik', 'Lojistik'),
  ('e5000000-0000-4000-8000-000000000006', 'satinalma', 'Satın Alma')
on conflict (id) do nothing;

insert into units (id, slug, name, symbol) values
  ('f6000000-0000-4000-8000-000000000001', 'adet', 'Adet', 'adet'),
  ('f6000000-0000-4000-8000-000000000002', 'kg', 'Kilogram', 'kg'),
  ('f6000000-0000-4000-8000-000000000003', 'lt', 'Litre', 'lt'),
  ('f6000000-0000-4000-8000-000000000004', 'ml', 'Mililitre', 'ml'),
  ('f6000000-0000-4000-8000-000000000005', 'm', 'Metre', 'm'),
  ('f6000000-0000-4000-8000-000000000006', 'm2', 'Metrekare', 'm²'),
  ('f6000000-0000-4000-8000-000000000007', 'paket', 'Paket', 'paket')
on conflict (id) do nothing;
