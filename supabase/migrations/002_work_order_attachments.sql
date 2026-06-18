-- İş kaydı görsel ekleri (ürün ve teknik görseller)

create type attachment_category as enum ('product', 'technical');

create table if not exists work_order_attachments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  category attachment_category not null,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_work_order_attachments_order
  on work_order_attachments(work_order_id);

create index if not exists idx_work_order_attachments_category
  on work_order_attachments(work_order_id, category);
