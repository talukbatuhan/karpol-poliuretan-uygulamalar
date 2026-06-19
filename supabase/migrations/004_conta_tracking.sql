-- Conta Takip modülü

create table if not exists conta_records (
  id uuid primary key default gen_random_uuid(),
  conta_code text not null unique,
  firma_ismi text not null,
  marka text not null,
  uzunluk text not null,
  adet integer not null check (adet > 0),
  renk text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conta_records_code on conta_records(conta_code);
create index if not exists idx_conta_records_firma on conta_records(firma_ismi);

create type conta_attachment_category as enum ('product');

create table if not exists conta_attachments (
  id uuid primary key default gen_random_uuid(),
  conta_record_id uuid not null references conta_records(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_conta_attachments_record
  on conta_attachments(conta_record_id);
