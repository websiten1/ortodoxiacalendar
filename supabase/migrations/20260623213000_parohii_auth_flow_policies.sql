create policy "Inscriere publica parohie" on public.parohii
  for insert
  to anon, authenticated
  with check (
    status = 'in_asteptare_verificare'
    and auth_user_id is null
  );

create policy "Preotul isi vede parohia dupa email" on public.parohii
  for select
  to authenticated
  using (auth.jwt() ->> 'email' = email);

create policy "Preotul isi revendica parohia dupa email" on public.parohii
  for update
  to authenticated
  using (
    auth_user_id is null
    and auth.jwt() ->> 'email' = email
  )
  with check (auth_user_id = auth.uid());
