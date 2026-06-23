# Parohia Mea

Scaffold inițial bazat pe `SPEC-FUNCTIONALA-BUILD.md`.

## Ce am creat acum

- Structura inițială de proiect în folderul `parohia-mea`
- Script de preluare calendar zilnic din sursa Patriarhiei
- Structură monorepo pentru web + mobile
- Migrații Supabase (schema + RLS + seed)
- Fișiere JSON generate pentru utilizare în seed/backend

## Structură

- `scripts/` - utilitare de bootstrap/import date
- `data/calendar/` - date calendar normalizate pe zile
- `apps/web/` - Next.js admin web (rute MVP din specificație)
- `apps/mobile/` - Expo app mobilă (tabs + profil parohie)
- `supabase/migrations/` - schema SQL, RLS și seed liturgic
- `docs/` - documentație de implementare

## Comenzi principale

```bash
npm run fetch:calendar
npm run seed:calendar:sql
npm run dev:web
npm run dev:mobile
```

## Environment variables (web)

Creează `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Import calendar Patriarhia

Rulează:

```bash
npm run fetch:calendar
```

Scriptul:

1. descarcă pagina [calendar.patriarhia.ro](https://calendar.patriarhia.ro/#august)
2. extrage obiectul JS `copData.calendarData`
3. normalizează intrările pe zile pentru fiecare lună
4. scrie două fișiere:
   - `data/calendar/patriarhia-calendar-data.json` (structura originală pe luni)
   - `data/calendar/patriarhia-calendar-flat.json` (listă flat, o intrare pe zi)

## Seed Supabase din calendar

```bash
npm run seed:calendar:sql
```

Generează migration SQL pentru `sarbatori_globale` pe baza datelor din:

- [calendar.patriarhia.ro](https://calendar.patriarhia.ro/#august)
