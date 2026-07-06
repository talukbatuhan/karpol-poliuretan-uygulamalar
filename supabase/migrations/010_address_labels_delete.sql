create policy "address_labels_delete"
  on address_labels for delete
  to anon, authenticated
  using (true);
