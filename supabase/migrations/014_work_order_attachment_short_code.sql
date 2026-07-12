-- Kısa WhatsApp linkleri için kod
alter table work_order_attachments
  add column if not exists short_code text;

create unique index if not exists idx_work_order_attachments_short_code
  on work_order_attachments (short_code)
  where short_code is not null;
