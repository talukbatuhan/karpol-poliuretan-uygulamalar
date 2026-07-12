-- İş emri görselleri için public storage bucket
insert into storage.buckets (id, name, public)
values ('work-order-images', 'work-order-images', true)
on conflict (id) do nothing;

drop policy if exists "work_order_images_public_read" on storage.objects;
create policy "work_order_images_public_read"
on storage.objects for select
using (bucket_id = 'work-order-images');

drop policy if exists "work_order_images_service_insert" on storage.objects;
create policy "work_order_images_service_insert"
on storage.objects for insert
with check (bucket_id = 'work-order-images');

drop policy if exists "work_order_images_service_delete" on storage.objects;
create policy "work_order_images_service_delete"
on storage.objects for delete
using (bucket_id = 'work-order-images');
