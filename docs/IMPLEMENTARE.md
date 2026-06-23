# Plan implementare (MVP)

Sursă: `SPEC-FUNCTIONALA-BUILD.md`.

## Ordine recomandată

1. Schema SQL + RLS în Supabase
2. Seed sărbători globale (folosind datele generate în `data/calendar/`)
3. Admin web (`/`, `/login`, `/inregistrare`, `/dashboard`)
4. Program recurent + Evenimente + Profil parohie
5. App mobilă Expo: Descoperă + Profil parohie (fără auth)
6. Auth Phone OTP + Urmărire parohii
7. Calendarul meu (combinat global + local)
8. Push notifications (Edge Function + Expo)

## Status (2026-06-24)

Toate cele 8 etape de mai sus sunt implementate în cod:

- Schema + RLS + bucket de storage pentru logo-uri în `supabase/migrations/`.
- Admin web complet: login, înregistrare, dashboard, program, evenimente, profil (cu upload logo), urmăritori, setări cont.
- App mobilă completă: onboarding, Descoperă (căutare + urmărire), profil parohie, autentificare Phone OTP contextuală, Calendarul meu (combinat global+local, infinite scroll, filtru pe parohie), Setări (parohiile mele, notificări, delogare).
- Înregistrare push token Expo la urmărire/activare notificări.
- Edge Function `send-event-notifications` (Deno) apelată din admin web la creare eveniment / la apăsarea „Trimite notificare”.

Nimic din ce e mai sus nu a fost rulat încă pe un proiect Supabase real — vezi `README.md` pentru pașii de deploy (creare proiect, `supabase db push`, env vars, EAS).

## Observații tehnice

- Legătura `parohii` ↔ `auth.users` folosește `auth_user_id`, populat la primul login; până atunci, RLS permite acces după `email` (vezi `20260623213000_parohii_auth_flow_policies.sql`).
- Calendarul combinat e calculat în JS (`apps/mobile/lib/calendar.ts`), nu printr-un RPC Postgres — mai simplu de depanat la MVP, cum recomandă specificația.
- Datele liturgice din Patriarhie sunt sursă externă provizorie; `data_stil_vechi` e identic cu `data_stil_nou` în seed-ul curent (nu există încă o sursă/algoritm separat pentru stilul vechi) — de rezolvat înainte de a activa parohii cu stil vechi în producție.
- Rulează `npm run fetch:calendar && npm run seed:calendar:sql` periodic pentru a reîmprospăta sărbătorile globale.
