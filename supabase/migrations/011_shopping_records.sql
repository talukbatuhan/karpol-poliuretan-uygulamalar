-- Kişisel alışveriş kayıtları

create table if not exists shopping_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  store text not null default '',
  price numeric(12,2),
  purchase_date date not null,
  category text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shopping_records_user on shopping_records(user_id);
create index if not exists idx_shopping_records_purchase_date on shopping_records(purchase_date desc);

create table if not exists shopping_record_files (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references shopping_records(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_shopping_record_files_record on shopping_record_files(record_id);

alter table shopping_records enable row level security;
alter table shopping_record_files enable row level security;

create policy "shopping_records_select" on shopping_records for select to authenticated using (user_id = auth.uid());
create policy "shopping_records_insert" on shopping_records for insert to authenticated with check (user_id = auth.uid());
create policy "shopping_records_update" on shopping_records for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "shopping_records_delete" on shopping_records for delete to authenticated using (user_id = auth.uid());

create policy "shopping_files_select" on shopping_record_files for select to authenticated
  using (exists (select 1 from shopping_records r where r.id = record_id and r.user_id = auth.uid()));

create policy "shopping_files_insert" on shopping_record_files for insert to authenticated
  with check (exists (select 1 from shopping_records r where r.id = record_id and r.user_id = auth.uid()));

create policy "shopping_files_delete" on shopping_record_files for delete to authenticated
  using (exists (select 1 from shopping_records r where r.id = record_id and r.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('shopping-files', 'shopping-files', true)
on conflict (id) do nothing;

drop policy if exists "shopping_files_storage_read" on storage.objects;
create policy "shopping_files_storage_read" on storage.objects for select using (bucket_id = 'shopping-files');

drop policy if exists "shopping_files_storage_insert" on storage.objects;
create policy "shopping_files_storage_insert" on storage.objects for insert with check (bucket_id = 'shopping-files');

drop policy if exists "shopping_files_storage_delete" on storage.objects;
create policy "shopping_files_storage_delete" on storage.objects for delete using (bucket_id = 'shopping-files');
