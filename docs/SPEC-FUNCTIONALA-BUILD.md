# Parohia Mea — Specificație Funcțională Completă (pentru build în Cursor)

*Document de implementare. Fiecare ecran, fiecare câmp, fiecare flux. Citește împreună cu REZUMAT-IDEE.md pentru context de business.*

---

# PARTEA 1 — ADMIN WEB (pentru preot)

Tehnologie: Next.js (TypeScript, App Router) + Tailwind + Supabase (Auth + DB).

## 1.1 Ecran: Landing / Login

**Rută:** `/`

Pagină publică simplă, înainte de autentificare:
- Titlu produs + un rând de descriere ("Calendarul și anunțurile parohiei tale, într-un singur loc")
- Buton **"Intră în cont"** → duce la `/login`
- Buton **"Înregistrează parohia"** → duce la `/inregistrare`

**Rută:** `/login`

- Câmp: **Email**
- Buton: **"Trimite link de autentificare"**
- La click: Supabase trimite magic link pe email (fără parolă — minimizează friction pentru preoți non-tehnici)
- Mesaj de confirmare: "Am trimis un link pe [email]. Verifică-ți inboxul."
- Link "Nu ai cont? Înregistrează parohia" → `/inregistrare`

## 1.2 Ecran: Înregistrare parohie

**Rută:** `/inregistrare`

Formular pe un singur ecran (sau wizard pe 2 pași, dacă pare lung):

**Pasul 1 — Date de identificare:**
- **Email** (text, obligatoriu) — folosit pentru login
- **Nume preot** (text, obligatoriu)
- **Telefon de contact** (text, obligatoriu) — pentru verificare

**Pasul 2 — Date parohie:**
- **Nume parohie** (text, obligatoriu) — ex. "Parohia Sfântul Nicolae"
- **Hram** (text, obligatoriu) — ex. "Sfântul Nicolae"
- **Data hramului** (selector dată, calculat automat dacă hramul e o sărbătoare cu dată fixă din lista global; altfel introdus manual)
- **Stil calendaristic** (radio: "Stil nou" / "Stil vechi") — obligatoriu
- **Adresă completă** (text, obligatoriu)
- **Localitate** (text, obligatoriu)
- **Județ / Regiune** (dropdown — lista județelor din România + opțiuni "Republica Moldova", "Italia", "SUA", "Altă țară")
- **Țară** (dropdown, implicit "România")
- **Descriere scurtă** (textarea, opțional, max ~300 caractere) — pentru profilul public

Buton: **"Trimite spre verificare"**

La trimitere:
- Se creează rândul în `parohii` cu `status = 'in_asteptare_verificare'`
- Se trimite un email automat preotului: "Cererea ta a fost înregistrată. Te vom contacta pentru verificare în maximum X zile."
- Se trimite o notificare (email, la început manual verificat de fondator) către admin-ul platformei

**Notă de implementare:** la MVP, verificarea identității preotului e un proces manual (telefon/email de confirmare făcut de fondator), nu un flux automatizat. Nu construi un sistem complex de verificare în acest pas — doar marchează clar statusul și permite fondatorului să schimbe statusul direct din baza de date sau dintr-un panou minimal de admin (vezi 1.6).

## 1.3 Dashboard parohie (după autentificare)

**Rută:** `/dashboard`

Layout cu meniu lateral (sidebar) fix:
- Acasă (dashboard)
- Programul parohiei
- Evenimente
- Profilul parohiei
- Urmăritori
- Setări cont

**Conținutul paginii Acasă:**

Card sus: status parohie
- Dacă `in_asteptare_verificare`: banner galben — "Parohia ta e în verificare. Te vom contacta la [telefon]. Poți completa profilul în acest timp, dar parohia nu va fi vizibilă public până la activare."
- Dacă `activ`: banner verde — "Parohia ta e activă și vizibilă în aplicație."
- Dacă `suspendat`: banner roșu — "Contul tău e suspendat. Contactează-ne la [email suport]."

Card statistici (3 cifre, vizibile chiar dacă mici la început, ca să arate progresul):
- Număr urmăritori
- Număr evenimente create luna curentă
- Următorul eveniment programat (titlu + dată)

Secțiune "Acțiuni rapide":
- Buton mare: **"+ Adaugă eveniment"** → modal sau pagină `/dashboard/evenimente/nou`
- Buton: **"Editează programul recurent"** → `/dashboard/program`

## 1.4 Ecran: Programul parohiei (recurent)

**Rută:** `/dashboard/program`

Listă a intrărilor de program recurent, afișate grupate pe zile ale săptămânii (Luni → Duminică).

Pentru fiecare intrare existentă, afișat ca rând/card:
- **Titlu** (ex. "Sfânta Liturghie")
- **Ziua săptămânii**
- **Ora**
- Toggle **Activ / Inactiv** (permite dezactivare temporară fără ștergere — ex. pauză de vară)
- Buton "Editează" / Buton "Șterge" (cu confirmare)

Buton sus: **"+ Adaugă intrare în program"**

**Modal/formular "Adaugă intrare în program":**
- **Titlu** (text, obligatoriu) — ex. "Vecernie", "Sfânta Liturghie", "Spovedanie"
- **Ziua săptămânii** (dropdown: Luni...Duminică)
- **Ora** (time picker)
- **Recurență** (la MVP: doar "săptămânal" — fără opțiuni complexe de tip "prima duminică din lună"; notă în cod pentru extensie ulterioară)
- Buton **Salvează**

## 1.5 Ecran: Evenimente

**Rută:** `/dashboard/evenimente`

Listă de evenimente, sortate cronologic, viitoare primele. Tab-uri sau filtru: "Viitoare" / "Trecute".

Pentru fiecare eveniment, card cu:
- Titlu
- Data + ora
- Tip (etichetă vizuală: Liturgic / Social / Anunț)
- Indicator dacă a fost trimisă notificare ("📨 Notificare trimisă" sau buton "Trimite notificare" dacă nu)
- Buton "Editează" / "Șterge"

Buton sus: **"+ Adaugă eveniment"** → `/dashboard/evenimente/nou`

**Ecran "Adaugă eveniment":**
- **Titlu** (text, obligatoriu)
- **Descriere** (textarea, opțional)
- **Data** (date picker, obligatoriu)
- **Ora** (time picker, opțional — unele evenimente sunt "toată ziua", ex. un post care începe)
- **Tip** (dropdown: Liturgic / Social / Anunț)
- Checkbox: **"Trimite notificare push urmăritorilor la salvare"** (bifat implicit)
- Buton **Salvează**

La salvare cu checkbox bifat → se declanșează trimiterea de notificări (vezi 3.5 din partea de backend).

## 1.6 Ecran: Profilul parohiei

**Rută:** `/dashboard/profil`

Formular editabil cu toate câmpurile din înregistrare (1.2, Pasul 2), plus:
- **Telefon contact public** (poate diferi de telefonul de verificare din cont)
- **Email contact public**
- **Fotografie/logo parohie** (upload, opțional — stocat în Supabase Storage)

Buton **Salvează modificările**

*Notă: schimbarea stilului calendaristic (vechi/nou) ar trebui să aibă o confirmare suplimentară ("Ești sigur? Asta schimbă toate datele sărbătorilor afișate.") pentru că afectează tot calendarul afișat.*

## 1.7 Ecran: Urmăritori

**Rută:** `/dashboard/urmaritori`

La MVP, simplu: doar cifra totală de urmăritori, afișată ca număr mare, plus un grafic minimal de evoluție în timp (opțional, poate fi lăsat pentru o iterație ulterioară dacă timpul e limitat). Nu sunt necesare detalii individuale despre urmăritori (nume, etc.) — păstrează simplu și protejează intimitatea utilizatorilor.

## 1.8 Ecran: Setări cont

**Rută:** `/dashboard/setari`

- Schimbare email de login
- Schimbare nume preot / telefon de contact (intern, pentru verificare, diferit de contactul public)
- Buton "Delogare"

---

# PARTEA 2 — APP MOBILĂ (pentru credincios)

Tehnologie: React Native + Expo (TypeScript) + NativeWind + Supabase (Auth + DB).

## 2.1 Ecran: Splash / Onboarding (prima utilizare)

La prima deschidere a aplicației:
- Logo + nume produs
- 2-3 ecrane de tip "carousel" explicativ (swipe):
  1. "Găsește parohia ta și urmărește-o"
  2. "Vezi calendarul liturgic și programul parohiei tale"
  3. "Primește notificări pentru evenimente — nu mai rata nimic"
- Buton final: **"Începe"** → duce la ecranul principal (Descoperă), fără a forța autentificare

## 2.2 Ecran: Descoperă (tab principal — fără autentificare necesară)

**Tab bar inferior** (3-4 tab-uri):
- 🔍 Descoperă
- 📅 Calendarul meu
- ⚙️ Setări

**Ecran "Descoperă":**
- Bară de căutare sus: "Caută o parohie (nume, oraș, județ)"
- Filtru rapid: dropdown/chips pentru județ sau țară
- Listă de parohii (card per parohie):
  - Nume parohie
  - Localitate + județ
  - Hram
  - Buton mic "Urmărește" / "Urmărit ✓" direct pe card (fără să intri în profil)
- Tap pe card → `Ecran Profil Parohie` (2.3)

Dacă lista e goală (nicio parohie în zona căutată): mesaj "Nu am găsit parohii pentru căutarea ta. Încearcă alt nume sau altă localitate."

## 2.3 Ecran: Profil parohie

Deschis prin tap pe un card din Descoperă, sau din "Calendarul meu".

**Header:**
- Fotografie/logo parohie (sau imagine placeholder generică, gen o iconiță de biserică)
- Nume parohie
- Hram + data hramului
- Buton mare: **"Urmărește"** (devine "Urmărit ✓ / Nu mai urmări" după apăsare)

**Secțiuni sub header (scroll):**
- **Adresă** — text + buton "Deschide în Maps"
- **Contact** — telefon (apel direct la tap) + email
- **Programul săptămânal** — listă, grupată pe zile (din `program_recurent`)
- **Evenimente viitoare** — listă scurtă (max 5), cu link "Vezi toate" → calendar filtrat pe parohia asta

Dacă utilizatorul apasă "Urmărește" și nu e autentificat → declanșează fluxul de autentificare (2.5), apoi continuă acțiunea automat după succes.

## 2.4 Ecran: Calendarul meu (tab principal)

**Necesită autentificare** (sau arată un ecran de tip "Autentifică-te ca să vezi calendarul tău" dacă nu e logat, cu buton direct spre autentificare).

**Layout:**
- Vedere de tip listă cronologică (nu calendar-grid clasic, mai simplu de construit și de citit pe mobil) — zilele viitoare, una sub alta
- Pentru fiecare zi cu conținut, un rând de dată (ex. "Duminică, 5 iulie") urmat de:
  - **Sărbătoarea/sfântul zilei** (din strat global) — text simplu, posibil cu iconiță distinctă (ex. cruce mică)
  - **Evenimentele parohiilor urmărite din ziua respectivă** (din strat local) — card cu nume parohie + titlu eveniment + oră, culoare/iconiță distinctă de cea liturgică
- Scroll infinit înainte (încarcă progresiv zilele următoare)
- Buton/filtru sus: dacă userul urmărește mai multe parohii, poate filtra calendarul să arate doar una

Dacă userul nu urmărește nicio parohie încă: mesaj central — "Nu urmărești încă nicio parohie. Caută una în tab-ul Descoperă." + buton direct spre tab Descoperă.

## 2.5 Flux: Autentificare (declanșat contextual, nu ecran separat de start)

Apare ca modal/ecran atunci când userul face o acțiune care necesită cont (Urmărește, activare notificări):

- **Câmp: Număr de telefon**
- Buton **"Trimite cod"**
- Ecran următor: **Câmp cod OTP (6 cifre)** primit prin SMS (Supabase Auth — Phone OTP)
- Buton **"Confirmă"**
- La succes → revine automat la acțiunea inițială (ex. completează "Urmărește" pe parohia pe care o vizualiza)

## 2.6 Ecran: Setări (tab)

- **Parohiile mele** — listă a parohiilor urmărite, cu toggle individual de notificări (on/off) și buton "Nu mai urmări"
- **Notificări** — toggle general (on/off pentru toate)
- **Despre** — versiune aplicație, link politică de confidențialitate
- **Delogare** (dacă e autentificat) — păstrează parohiile urmărite local sau le pierde explicit, cu avertisment clar

---

# PARTEA 3 — BACKEND / LOGICĂ (Supabase)

## 3.1 Tabele (schema SQL completă)

```sql
create table parohii (
  id uuid primary key default gen_random_uuid(),
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

create table program_recurent (
  id uuid primary key default gen_random_uuid(),
  parohie_id uuid not null references parohii(id) on delete cascade,
  titlu text not null,
  zi_saptamana text not null
    check (zi_saptamana in ('luni','marti','miercuri','joi','vineri','sambata','duminica')),
  ora time not null,
  activ boolean not null default true
);

create table evenimente_locale (
  id uuid primary key default gen_random_uuid(),
  parohie_id uuid not null references parohii(id) on delete cascade,
  titlu text not null,
  descriere text,
  data date not null,
  ora time,
  tip text not null check (tip in ('liturgic', 'social', 'anunt')),
  notificare_trimisa boolean not null default false,
  created_at timestamptz not null default now()
);

create table sarbatori_globale (
  id uuid primary key default gen_random_uuid(),
  data_stil_nou date not null,
  data_stil_vechi date not null,
  nume_sarbatoare text not null,
  tip text not null
    check (tip in ('cruce_rosie', 'sfant_obisnuit', 'post_incepe', 'post_se_termina')),
  an integer not null
);

-- Utilizatorii sunt gestionați prin auth.users (Supabase Auth, Phone OTP)

create table urmariri (
  utilizator_id uuid not null references auth.users(id) on delete cascade,
  parohie_id uuid not null references parohii(id) on delete cascade,
  notificari_activate boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (utilizator_id, parohie_id)
);

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  utilizator_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  created_at timestamptz not null default now()
);
```

## 3.2 Row Level Security (RLS) — politici esențiale

```sql
alter table parohii enable row level security;
alter table program_recurent enable row level security;
alter table evenimente_locale enable row level security;
alter table sarbatori_globale enable row level security;
alter table urmariri enable row level security;
alter table push_tokens enable row level security;

-- Parohii: citire publică doar pentru cele active; editare doar de proprii admini
create policy "Parohii active sunt publice" on parohii
  for select using (status = 'activ' or auth.uid()::text = email);
  -- notă: adaptează legătura preot↔parohie cum preferi (ex. coloană auth_user_id explicită, mai sigur decât email)

create policy "Preotul își editează propria parohie" on parohii
  for update using (auth.uid()::text = email);

-- Program recurent / Evenimente: citire publică, editare doar de admin-ul parohiei respective
create policy "Program vizibil public" on program_recurent for select using (true);
create policy "Preotul editeaza programul propriu" on program_recurent
  for all using (
    parohie_id in (select id from parohii where auth.uid()::text = email)
  );

create policy "Evenimente vizibile public" on evenimente_locale for select using (true);
create policy "Preotul editeaza evenimentele proprii" on evenimente_locale
  for all using (
    parohie_id in (select id from parohii where auth.uid()::text = email)
  );

-- Sărbători globale: doar citire pentru toți, scriere blocată (gestionat separat, prin acces direct/service role)
create policy "Sarbatori globale vizibile tuturor" on sarbatori_globale for select using (true);

-- Urmăriri: userul își vede/editează doar propriile urmăriri
create policy "Userul isi gestioneaza propriile urmariri" on urmariri
  for all using (auth.uid() = utilizator_id);

create policy "Userul isi gestioneaza propriul push token" on push_tokens
  for all using (auth.uid() = utilizator_id);
```

**Notă importantă:** folosirea `email` ca legătură de identitate între `auth.users` și `parohii` e simplă pentru MVP, dar fragilă (ex. dacă preotul își schimbă emailul). Recomandare: adaugă o coloană `auth_user_id uuid references auth.users(id)` în `parohii`, populată la momentul în care contul e confirmat/activat, și folosește-o în policies în loc de email. Las ambele variante notate aici ca decizie de discutat la implementare.

## 3.3 Funcție: Calendar combinat (logica centrală)

Pentru un utilizator dat, calendarul combinat = pentru fiecare zi din intervalul cerut:
1. Selectează din `sarbatori_globale` rândul unde `data_stil_nou = ziua` SAU `data_stil_vechi = ziua`, în funcție de stilul fiecărei parohii urmărite (atenție: dacă userul urmărește parohii cu stiluri diferite, fiecare parohie afișează sărbătoarea conform stilului ei propriu — nu există "o singură" sărbătoare a zilei valabilă pentru toți)
2. Selectează din `evenimente_locale` toate evenimentele cu `data = ziua` pentru parohiile din `urmariri` ale userului
3. Selectează din `program_recurent` toate intrările active a căror `zi_saptamana` corespunde zilei din săptămână, pentru parohiile urmărite
4. Combină rezultatele într-un singur array ordonat cronologic, cu un câmp `sursa: 'global' | 'local_eveniment' | 'local_recurent'` pentru ca interfața să le poată stila diferit

Implementare recomandată: o funcție Postgres (RPC, apelabilă direct din Supabase client) sau o rută API în Next.js/Expo care face cele 3 interogări și le combină în JS — pentru MVP, a doua variantă e mai simplă de depanat.

## 3.4 Funcție: Seed date liturgice de test

Script separat (rulat o singură dată, sau de câte ori e nevoie de refresh) care populează `sarbatori_globale` cu minimum 3 luni de date reale, marcate clar ca provizorii până la integrarea sursei finale (azisespala.ro sau construcție internă — vezi întrebarea deschisă din REZUMAT-IDEE.md).

## 3.5 Funcție: Trimitere notificări push (Supabase Edge Function)

Trigger: la creare/actualizare a unui rând în `evenimente_locale` cu `notificare_trimisa = false` și request explicit de trimitere (din admin web, checkbox bifat):

1. Edge Function primește `evenimente_locale.id`
2. Interoghează `urmariri` pentru toți userii care urmăresc `parohie_id` respectivă, cu `notificari_activate = true`
3. Pentru fiecare user găsit, interoghează `push_tokens` pentru token-ul Expo
4. Trimite request către Expo Push Notification API cu titlul evenimentului + numele parohiei ca mesaj
5. Marchează `evenimente_locale.notificare_trimisa = true`

---

# PARTEA 4 — ORDINEA DE CONSTRUCȚIE RECOMANDATĂ PENTRU CURSOR

1. Schema SQL completă (3.1) + RLS (3.2) în Supabase, direct din dashboard sau migrații
2. Seed date liturgice de test (3.4) — minim ca să ai ce afișa în interfețe
3. Admin web: Login + Înregistrare (1.1, 1.2) → Dashboard (1.3) → Program (1.4) → Evenimente (1.5) → Profil (1.6)
4. App mobilă: Descoperă (2.2) → Profil parohie (2.3) — funcționale fără autentificare, ca să poți testa rapid vizual
5. Autentificare Phone OTP (2.5) — apoi Urmărește devine funcțional
6. Calendarul meu (2.4) — necesită funcția de calendar combinat (3.3)
7. Notificări push (3.5) — ultima piesă, cea mai predispusă la probleme de configurare (Expo EAS, certificate Apple/Google)

Construiește și testează fiecare pas înainte de a trece la următorul — nu încerca toate ecranele simultan.
