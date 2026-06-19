-- Conta görselleri için storage bucket
insert into storage.buckets (id, name, public)
values ('conta-images', 'conta-images', true)
on conflict (id) do nothing;

-- Herkese okuma (public bucket)
drop policy if exists "conta_images_public_read" on storage.objects;
create policy "conta_images_public_read"
on storage.objects for select
using (bucket_id = 'conta-images');

drop policy if exists "conta_images_service_insert" on storage.objects;
create policy "conta_images_service_insert"
on storage.objects for insert
with check (bucket_id = 'conta-images');

-- Google Sheets senkron logu
create table if not exists conta_sync_log (
  id uuid primary key default gen_random_uuid(),
  conta_record_id uuid not null references conta_records(id) on delete cascade,
  target text not null default 'google_sheets',
  status text not null check (status in ('pending', 'success', 'failed')),
  error_message text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_conta_sync_log_record
  on conta_sync_log(conta_record_id);

create index if not exists idx_conta_sync_log_status
  on conta_sync_log(status);
