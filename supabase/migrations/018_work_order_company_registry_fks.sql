-- İş emirlerine Firma Kartları FK bağları

alter table work_orders
  add column if not exists talep_eden_company_registry_id uuid
    references company_registry(id) on delete set null,
  add column if not exists uygulayici_company_registry_id uuid
    references company_registry(id) on delete set null;

create index if not exists idx_work_orders_talep_eden_registry
  on work_orders(talep_eden_company_registry_id);

create index if not exists idx_work_orders_uygulayici_registry
  on work_orders(uygulayici_company_registry_id);
