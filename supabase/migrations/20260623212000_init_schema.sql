create extension if not exists pgcrypto;

create table if not exists public.parohii (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  email text not null unique,
  preot_nume text not null,
  preot_telefon text not null,
  nume text not null,
  hram text not null,
  data_hram date,
  stil text not null check (stil in ('vechi', 'nou')),
  adresa text not null,
  localitate text not null,
  judet text not null,
  tara text not null default 'România',
  descriere text,
  contact_telefon_public text,
  contact_email_public text,
  logo_url text,
  status text not null default 'in_asteptare_verificare'
    check (status in ('in_asteptare_verificare', 'activ', 'suspendat')),
  created_at timestamptz not null default now()
);

create table if not exists public.program_recurent (
  id uuid primary key default gen_random_uuid(),
  parohie_id uuid not null references public.parohii(id) on delete cascade,
  titlu text not null,
  zi_saptamana text not null
    check (zi_saptamana in ('luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica')),
  ora time not null,
  activ boolean not null default true
);

create table if not exists public.evenimente_locale (
  id uuid primary key default gen_random_uuid(),
  parohie_id uuid not null references public.parohii(id) on delete cascade,
  titlu text not null,
  descriere text,
  data date not null,
  ora time,
  tip text not null check (tip in ('liturgic', 'social', 'anunt')),
  notificare_trimisa boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sarbatori_globale (
  id uuid primary key default gen_random_uuid(),
  data_stil_nou date not null,
  data_stil_vechi date not null,
  nume_sarbatoare text not null,
  tip text not null
    check (tip in ('cruce_rosie', 'sfant_obisnuit', 'post_incepe', 'post_se_termina')),
  an integer not null
);

create table if not exists public.urmariri (
  utilizator_id uuid not null references auth.users(id) on delete cascade,
  parohie_id uuid not null references public.parohii(id) on delete cascade,
  notificari_activate boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (utilizator_id, parohie_id)
);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  utilizator_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  created_at timestamptz not null default now()
);

alter table public.parohii enable row level security;
alter table public.program_recurent enable row level security;
alter table public.evenimente_locale enable row level security;
alter table public.sarbatori_globale enable row level security;
alter table public.urmariri enable row level security;
alter table public.push_tokens enable row level security;

create policy "Parohii active sunt publice" on public.parohii
  for select using (status = 'activ' or auth.uid() = auth_user_id);

create policy "Preotul isi editeaza propria parohie" on public.parohii
  for all using (auth.uid() = auth_user_id);

create policy "Program vizibil public" on public.program_recurent
  for select using (true);

create policy "Preotul editeaza programul propriu" on public.program_recurent
  for all using (
    parohie_id in (
      select id from public.parohii where auth.uid() = auth_user_id
    )
  );

create policy "Evenimente vizibile public" on public.evenimente_locale
  for select using (true);

create policy "Preotul editeaza evenimentele proprii" on public.evenimente_locale
  for all using (
    parohie_id in (
      select id from public.parohii where auth.uid() = auth_user_id
    )
  );

create policy "Sarbatori globale vizibile tuturor" on public.sarbatori_globale
  for select using (true);

create policy "Userul isi gestioneaza propriile urmariri" on public.urmariri
  for all using (auth.uid() = utilizator_id);

create policy "Userul isi gestioneaza propriul push token" on public.push_tokens
  for all using (auth.uid() = utilizator_id);
