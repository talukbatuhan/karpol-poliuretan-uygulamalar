-- Firma Kartları (company_registry) RLS + İş Takip metin firma alanları

alter table company_registry enable row level security;

drop policy if exists "company_registry_select" on company_registry;
create policy "company_registry_select"
  on company_registry for select to authenticated using (true);

drop policy if exists "company_registry_insert" on company_registry;
create policy "company_registry_insert"
  on company_registry for insert to authenticated with check (true);

drop policy if exists "company_registry_update" on company_registry;
create policy "company_registry_update"
  on company_registry for update to authenticated using (true) with check (true);

drop policy if exists "company_registry_delete" on company_registry;
create policy "company_registry_delete"
  on company_registry for delete to authenticated using (true);

alter table work_orders
  add column if not exists talep_eden_firma text,
  add column if not exists uygulayici_firma text;

update work_orders wo
set talep_eden_firma = c.name
from companies c
where wo.talep_eden_firma_id = c.id
  and (wo.talep_eden_firma is null or wo.talep_eden_firma = '');

update work_orders wo
set uygulayici_firma = c.name
from companies c
where wo.uygulayici_firma_id = c.id
  and (wo.uygulayici_firma is null or wo.uygulayici_firma = '');

alter table work_orders
  alter column talep_eden_firma_id drop not null;

alter table work_orders
  alter column uygulayici_firma_id drop not null;
