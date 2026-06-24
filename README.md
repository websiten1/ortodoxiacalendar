# Ortodoxia

MVP construit conform `docs/SPEC-FUNCTIONALA-BUILD.md`. Toate cele 8 etape din `docs/IMPLEMENTARE.md` (schema, admin web, app mobilă, auth, calendar combinat, push) sunt implementate în cod. Ce rămâne sunt pașii legați de cont (Supabase, Apple/Google) descriși mai jos — nu pot fi automatizați fără credențialele tale.

## Structură

- `scripts/` — utilitare de bootstrap/import date liturgice
- `data/calendar/` — date calendar normalizate pe zile (din Patriarhia)
- `apps/web/` — Next.js admin web (toate ecranele din Partea 1 a spec.)
- `apps/mobile/` — Expo app mobilă (toate ecranele din Partea 2 a spec.)
- `supabase/migrations/` — schema SQL, RLS, storage, seed liturgic
- `supabase/functions/send-event-notifications/` — Edge Function push (Partea 3.5)
- `docs/` — specificație + plan de implementare

## 1. Creează proiectul Supabase

1. [supabase.com](https://supabase.com) → New project.
2. Activează autentificarea **Email (magic link)** și **Phone (SMS OTP)** din Auth → Providers (Phone necesită un provider SMS, ex. Twilio — configurează-l acolo).
3. Instalează CLI-ul și conectează proiectul:

   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <project-ref>
   ```

4. Aplică toate migrațiile (schema, RLS, storage, seed):

   ```bash
   supabase db push
   ```

## 2. Variabile de mediu

**Web** — `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Mobile** — `apps/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

(vezi și `.env.example` în fiecare folder)

## 3. Deploy Edge Function pentru notificări push

```bash
supabase functions deploy send-event-notifications
```

Funcția folosește `SUPABASE_URL` și `SUPABASE_SERVICE_ROLE_KEY`, disponibile automat în mediul Edge Functions — nu trebuie setate manual.

## 4. Rulează aplicațiile

```bash
npm install
npm run dev:web      # admin web pe http://localhost:3000
npm run dev:mobile   # Expo — apasă "i" pentru iOS Simulator sau scanează QR cu Expo Go
```

## 5. Push notifications pe device real (opțional pentru testare locală)

Expo Go poate primi notificări de test, dar pentru build-uri de producție ai nevoie de:

- Cont [EAS](https://expo.dev) + `eas build:configure` (generează `projectId` în `app.json` → `extra.eas.projectId`, folosit de `apps/mobile/lib/push.ts`)
- Certificat push Apple (APNs) pentru iOS, configurat automat de EAS la primul build
- Cheie FCM pentru Android, configurată automat de EAS

## 6. Import / refresh calendar liturgic

```bash
npm run fetch:calendar       # descarcă de pe calendar.patriarhia.ro
npm run seed:calendar:sql    # regenerează migrația de seed din JSON
supabase db push             # aplică noul seed
```

**Limitare cunoscută:** seed-ul curent setează `data_stil_vechi = data_stil_nou` (nu există încă o sursă separată pentru stilul vechi calendaristic) — de rezolvat înainte de a activa parohii cu stil vechi.

## 7. Verificare manuală preoți

La MVP, activarea unei parohii (`status: in_asteptare_verificare → activ`) se face manual, direct din Supabase Table Editor sau SQL Editor, după ce confirmi telefonic/prin email identitatea preotului.
