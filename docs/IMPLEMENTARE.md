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

## Observații tehnice

- Pentru MVP, legătura `parohii` cu userul admin poate începe cu email (cum e în spec), apoi migrare pe `auth_user_id`.
- Pentru calendar combinat, varianta API/JS este mai simplă inițial decât RPC.
- Datele liturgice din Patriarhie trebuie considerate sursă externă; rulează importul periodic și verifică modificările.
