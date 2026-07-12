-- İş emri tamamlanma durumu
alter table work_orders
  add column if not exists completion_status text;

update work_orders
set completion_status = 'incomplete'
where completion_status is null;

alter table work_orders
  alter column completion_status set default 'incomplete';

alter table work_orders
  alter column completion_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'work_orders_completion_status_check'
  ) then
    alter table work_orders
      add constraint work_orders_completion_status_check
      check (completion_status in ('incomplete', 'completed'));
  end if;
end $$;

create index if not exists idx_work_orders_completion_status
  on work_orders (completion_status);
