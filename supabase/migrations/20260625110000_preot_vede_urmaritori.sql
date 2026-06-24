create policy "Preotul vede urmaririle propriei parohii" on public.urmariri
  for select
  using (
    parohie_id in (select id from public.parohii where auth.uid() = auth_user_id)
  );
