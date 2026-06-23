insert into storage.buckets (id, name, public)
values ('logo-parohii', 'logo-parohii', true)
on conflict (id) do nothing;

create policy "Logo parohii sunt publice" on storage.objects
  for select
  using (bucket_id = 'logo-parohii');

create policy "Preotul isi incarca propriul logo" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'logo-parohii'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Preotul isi actualizeaza propriul logo" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'logo-parohii'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Preotul isi sterge propriul logo" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'logo-parohii'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
