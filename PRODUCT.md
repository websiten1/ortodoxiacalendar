# Product

## Register

product

## Users

Două audiențe, două suprafețe:

- **Preoți** (admin web, Next.js) — administrează profilul parohiei, programul recurent, evenimentele și anunțurile. Mulți sunt non-tehnici; sesiuni scurte, sporadice (o dată pe săptămână să actualizeze programul, ocazional un eveniment nou). Au nevoie de claritate și încredere, nu de impact vizual.
- **Enoriași / credincioși** (app mobilă, Expo) — descoperă parohii, urmăresc parohia lor, citesc calendarul liturgic combinat (sărbători + program + evenimente locale), primesc notificări. Folosire frecventă, sesiuni scurte ("ce e azi", "ce e duminică la parohia mea"). Spectru larg de vârstă, inclusiv utilizatori în vârstă și diaspora — citire rapidă, fără friction tehnic.

Ambele audiențe se așteaptă la un ton tradițional ortodox, nu corporate sau "tech".

## Product Purpose

Parohia Mea e un director național de parohii ortodoxe românești + calendar liturgic personalizat + notificări. Diferențiatorul nu e calendarul liturgic în sine (există deja aplicația oficială a Patriarhiei), ci profilul parohiei + programul ei specific + evenimentele locale + notificările legate de "parohia mea". Succesul = preotul actualizează programul fără frustrare, enoriașul deschide aplicația și știe imediat ce e azi la parohia lui.

## Brand Personality

Calm, de încredere, tradițional fără a fi ornat. Trei cuvinte: **liniștit, autentic, lizibil**.

Direcția vizuală aleasă explicit de fondator este **"Parchment"** (una din trei direcții explorate într-un document de design): fundal parchment cald, vișiniu (#7a1f2b) și auriu (#e8c66a) folosite cu zgârcenie ca accente, spațiu generos, un serif de lectură — gândit pentru utilizare zilnică, calmă, nu pentru momentul "wow" o singură dată.

## Anti-references

- **Iconostasis** (direcția 1 din același document de explorare): fundal vișiniu intens, foi de aur, panouri-icoană crem — prea ornat/încărcat pentru utilizare zilnică, deși din aceeași familie de brand.
- **Candlelit** (direcția 3): aproape-negru cu auriu strălucitor, atmosferă "rugăciune de seară" premium — prea întunecat pentru o aplicație folosită la orice oră, contrast nepotrivit pentru utilizatori în vârstă.
- Generic SaaS albastru-alb (stilul actual din cod, neintenționat — un placeholder care trebuie înlocuit complet, nu ajustat).
- Fără kitsch ortodox stereotip (iconițe aurii excesive, fonturi gotice, ornamente bizantine decorative fără rol funcțional).

## Design Principles

1. **Citire înainte de impresie** — fiecare ecran trebuie să fie scanabil în 2 secunde de un preot non-tehnic sau un enoriaș grăbit; ierarhia tipografică duce, decorul urmează.
2. **Accente, nu sature** — vișiniul și auriul marchează ce e important (buton primar, sărbătoare, "azi"); restul interfeței rămâne parchment/cerneală calmă.
3. **Un singur serif de identitate** — Marcellus pentru momentele de marcă și titluri (numele parohiei, luna calendarului), nu pentru tot textul; corpul de text rămâne sans lizibil.
4. **Lizibilitate peste eleganță minimalistă** — text mare, contrast solid, ținte de tap generoase; publicul include utilizatori în vârstă și diaspora, nu doar early adopters.
5. **Consecvență cross-platform fără a copia 1:1** — web admin și app mobilă partajează aceleași tokens (culoare, tip, radius) dar fiecare respectă convențiile propriei platforme (formulare dense pe web, carduri/tab bar pe mobil).

## Accessibility & Inclusion

WCAG AA: contrast text ≥4.5:1 (text mare/bold ≥3:1), ținte de tap ≥44px pe mobil, fără text sub 14px în UI funcțională (etichetele micro-uppercase de 10-11px sunt acceptate doar ca metadate secundare, nu ca text principal). Suport `prefers-reduced-motion`.
