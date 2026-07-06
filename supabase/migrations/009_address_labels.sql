-- Adres etiketi kayıtları

create table if not exists address_labels (
  id uuid primary key default gen_random_uuid(),
  company_title text not null,
  sender text not null,
  receiver text not null,
  created_at timestamptz not null default now()
);

create index if not exists address_labels_company_title_idx
  on address_labels (company_title);

create index if not exists address_labels_created_at_idx
  on address_labels (created_at desc);

alter table address_labels enable row level security;

create policy "address_labels_select"
  on address_labels for select
  to anon, authenticated
  using (true);

create policy "address_labels_insert"
  on address_labels for insert
  to anon, authenticated
  with check (true);
