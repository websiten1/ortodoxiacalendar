alter table public.sarbatori_globale
  add column if not exists subtitlu text,
  add column if not exists sinaxar_text text,
  add column if not exists zi_libera boolean not null default false;
