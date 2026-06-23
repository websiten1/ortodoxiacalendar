---
name: Parohia Mea
description: Calm parchment-and-crimson design system for an Orthodox parish directory and liturgical calendar
colors:
  parchment: "#f4f1ea"
  ink: "#2c2620"
  ink-muted: "#5a5046"
  ink-faint: "#9a8268"
  ink-faint-alt: "#8a7458"
  crimson: "#7a1f2b"
  crimson-text-on: "#f6ecd6"
  gold: "#c9a24b"
  gold-bright: "#e8c66a"
  surface: "#fdfcf8"
  border: "#e0d8c6"
  border-alt: "#e6dfce"
  border-strong: "#d8cfbb"
  sunday-red: "#b9322f"
  fast-bg: "#ece6f5"
  fast-text: "#6a4ea0"
  upcoming-text: "#b9892f"
  upcoming-bg: "#f4ecdb"
  upcoming-border: "#e6dca0"
typography:
  display:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.01em"
  reading:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "6px"
  md: "11px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.crimson-text-on}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.crimson}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "13px 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
---

# Design System: Parohia Mea

## 1. Overview

**Creative North Star: "The Quiet Nave"**

Parohia Mea lives on parchment, not on a screen pretending to be one. The system borrows its mood from standing in an empty church nave on a weekday afternoon: cream stone, a little gold catching the light, the deep crimson reserved for the moments that matter — the altar cloth, not the walls. This is the **Parchment** direction, chosen deliberately over two siblings explored in the same brief: **Iconostasis** (crimson ground, gold leaf, ornate — too loud for daily use) and **Candlelit** (near-black with glowing gold — too dark for a screen checked at any hour, and too low-contrast for older users). Parchment won because the product is read daily, briefly, often by people who are not technical and not all young.

Density stays low and text stays large. The serif display face (Marcellus) appears only at moments of identity — the parish name, the month, the app's own name — never in body copy. Crimson and gold are accents, not backgrounds; the page itself stays a calm, warm neutral so the few colored elements (a primary button, today's date, a feast name) actually read as important.

**Key Characteristics:**
- Warm parchment ground (#f4f1ea), never stark white, never cream-as-default-AI-beige — it is the brand's own hue, lifted from the source material, not a generic "warm SaaS" choice.
- Crimson (#7a1f2b) is the one saturated color and it is rationed: primary actions, today's date, the brand name.
- Gold (#c9a24b / #e8c66a) is rarer still — thin dividers, small dots marking a feast day, never a fill.
- One serif for identity (Marcellus), one serif for reading (Spectral), one sans for UI chrome (Hanken Grotesk). No fourth font, ever.
- Flat by default; the only "lift" is a soft crimson-tinted shadow under primary buttons.

## 2. Colors

A warm neutral ground carries the page; crimson marks the one action that matters per screen; gold marks the one fact that matters per row.

### Primary
- **Vișiniu / Deep Crimson** (#7a1f2b): primary buttons, the active tab underline, today's date marker, the parish name accent on web, sundays in the calendar grid use a related but distinct red (#b9322f) so "Sunday" and "primary action" never compete for the same color meaning.

### Secondary
- **Aur / Gold** (#c9a24b, bright variant #e8c66a for dark surfaces): thin rule under the app wordmark, the small dot marking a feast day on the calendar grid, "upcoming" badge text (#b9892f on #f4ecdb). Never used as a button fill — gold fills read as low-contrast and cheap at this saturation.

### Neutral
- **Parchment** (#f4f1ea): page background, the one ground color everywhere.
- **Cerneală / Ink** (#2c2620): primary text.
- **Ink Muted** (#5a5046): body copy, secondary line under a heading.
- **Ink Faint** (#9a8268 / #8a7458): micro-labels, timestamps, placeholder-adjacent text — never the only color for anything a user must read to act, per the Legibility Rule below.
- **Surface** (#fdfcf8): cards, inputs, anything that needs to sit one step lighter than the parchment ground without becoming white.
- **Border** (#e0d8c6 / #e6dfce / #d8cfbb): hairline dividers and input/card borders, never heavier than 1px.

### Named Rules
**The Legibility Rule.** Ink Faint (#9a8268) never carries text a user must read to complete a task — labels and metadata only. Anything load-bearing (body copy, button text, error text) uses Ink (#2c2620) or Ink Muted (#5a5046), both of which clear 4.5:1 on Parchment and Surface.

**The Rationing Rule.** Crimson fills no more than one element per screen at rest (the single primary action). Everything else that wants emphasis uses an outline, a underline, or gold — never a second crimson fill competing with the first.

## 3. Typography

**Display Font:** Marcellus (serif, with Georgia fallback)
**Body Font:** Hanken Grotesk (sans, weights 400–800, with system-ui fallback)
**Reading Font:** Spectral (serif, with Georgia fallback)

**Character:** Marcellus is narrow, tall, slightly formal — used sparingly it reads as a name carved in stone, not as decoration. Hanken Grotesk carries the actual interface (buttons, nav, form labels) because it has to be fast to scan at small sizes. Spectral sits between the two: used only where the user is meant to *read* rather than scan — a feast name, an event title — giving those specific facts a calmer, more considered weight than the surrounding UI chrome.

### Hierarchy
- **Display** (400, clamp(1.5rem, 3vw, 2.5rem), line-height 1.1): app wordmark, screen titles, the month name in the calendar header, the parish name on its profile screen.
- **Reading** (500, 1.125rem, line-height 1.3, Spectral): the feast/saint name of the day, an event title in a list — anywhere the user pauses to actually read a name rather than scan a row.
- **Body** (400, 1rem, line-height 1.5, Hanken Grotesk): paragraphs, descriptions, form values. Cap reading blocks (parish descriptions) at ~70ch.
- **Label** (600, 0.625rem, letter-spacing 0.12em, uppercase, Hanken Grotesk): field labels above inputs, badge text, day-of-week headers. Always paired with a higher-contrast value below it — never the only text in a row.

### Named Rules
**The One Serif Per Job Rule.** Marcellus identifies, Spectral narrates, Hanken Grotesk operates. A given piece of text uses exactly one of the three based on which job it's doing — never mix Marcellus and Spectral in the same line, and never set body paragraphs in Marcellus (it gets fatiguing past a few words).

## 4. Elevation

Flat by default. The page itself has no shadows; depth comes from the parchment/surface contrast (background #f4f1ea vs. card #fdfcf8) and 1px borders, not from drop shadows. The single exception is the primary button, which gets a soft, color-matched glow to signal "this is the action" without resorting to a heavier surface treatment.

### Shadow Vocabulary
- **Action glow** (`box-shadow: 0 8px 18px rgba(122, 31, 43, 0.22)`): under primary buttons only. Crimson-tinted, not generic black, so it reads as "warm" rather than "lifted office software."

### Named Rules
**The No Card-on-Card Rule.** Never nest a Surface-colored card inside another Surface-colored card. If a sub-grouping is needed inside a card, use a 1px top border as a section divider instead of a second card shell.

## 5. Components

### Buttons
- **Shape:** radius 11px (mobile cards use 11px, web forms may use up to 12px — treat as the same value, never below 8px or above 14px).
- **Primary:** background Crimson (#7a1f2b), text Crimson-on (#f6ecd6), weight 700, padding 14px vertical / 20px horizontal, Action Glow shadow. One per screen at rest (Rationing Rule).
- **Secondary / Outline:** background Surface (#fdfcf8), 1px border Border-strong (#d8cfbb), text Crimson (#7a1f2b), weight 700, no shadow.
- **Hover / Focus (web):** primary darkens background by ~8% lightness; both variants get a 2px Crimson focus ring offset 2px on `:focus-visible`. Never remove the focus ring.
- **Disabled:** 50% opacity, no shadow, pointer-events none.

### Badges
- **Fasting / liturgical note:** background #ece6f5, text #6a4ea0 (Fast), 6px radius, label-scale type, padding 3px 8px.
- **Upcoming:** text #b9892f on #f4ecdb with #e6dca0 border, same shape rules as Fasting badges — badges share one shape system regardless of color so they read as "the same kind of thing."

### Cards / Containers
- **Corner style:** 12–16px radius depending on size (smaller list-item cards at 12px, larger feature cards like the parish header at 16px).
- **Background:** Surface (#fdfcf8) on a Parchment (#f4f1ea) page — the contrast between the two IS the elevation system (see Elevation).
- **Border:** 1px Border or Border-alt (#e0d8c6 / #e6dfce). Never a heavier or colored border — color comes from content (a badge, a date chip), not the card shell.
- **Internal padding:** 12–16px for list rows, 16px for standalone cards.

### Inputs / Fields
- **Style:** background Surface (#fdfcf8), 1px Border (#e0d8c6), radius 12px, padding 13px 14px, value text in Ink Muted (#5a5046).
- **Label:** always a Label-scale (10px, uppercase, 1.5px letter-spacing, Ink Faint #9a8268) caption sitting above the field, never a floating/inline placeholder-as-label.
- **Focus:** border shifts to Crimson (#7a1f2b) at 1.5px, no glow (glow is reserved for primary buttons per the Rationing Rule).
- **Error:** border and label switch to Sunday-red (#b9322f); error copy sits below the field in the same red, body-scale.

### Navigation
- **Web sidebar:** Surface background, Parchment page behind it, active item gets a Crimson left-aligned text color with no pill fill (text-color-only active state keeps the sidebar quiet).
- **Mobile tab bar:** Surface background, 1px top Border-alt divider, active tab icon+label in Crimson, inactive in Ink Faint. No badges/dots on tab icons except a single small gold dot reserved for "new content" states, used rarely.

## 6. Do's and Don'ts

The Parchment direction was chosen explicitly over two richer siblings from the same brand family — Iconostasis (ornate crimson-and-gold-leaf) and Candlelit (near-black premium-evening). Both remain valid *brand* references but are explicit anti-references for *this* product surface.

### Do:
- **Do** keep the page background Parchment (#f4f1ea) everywhere; cards and inputs step up to Surface (#fdfcf8), never to pure white.
- **Do** reserve Crimson fills for exactly one primary action per screen (the Rationing Rule).
- **Do** set feast names and event titles in Spectral, not Marcellus or Hanken Grotesk — that's the one place the reading serif belongs.
- **Do** hold contrast to WCAG AA (≥4.5:1 body text, ≥3:1 large/bold) given the audience includes older, non-technical users — per PRODUCT.md's accessibility requirement, this overrides any temptation to use Ink Faint for primary copy.
- **Do** use 44px-minimum tap targets on mobile for every interactive row (follow buttons, settings toggles, calendar filter chips).

### Don't:
- **Don't** build the "Iconostasis" mood here — no crimson page backgrounds, no gold-leaf ornament, no cream icon-panel framing. That direction is reserved for a more ceremonial surface, not this daily-use product.
- **Don't** build the "Candlelit" mood here — no near-black surfaces, no glowing text-shadow on the wordmark. Low-light premium drama fails the accessibility requirement for this audience.
- **Don't** ship the placeholder generic-SaaS blue (#1f6feb) that exists in the current codebase — it is an unintentional default, not a design choice, and must be fully replaced, not tinted.
- **Don't** use gold (#c9a24b/#e8c66a) as a fill for any button or large surface — it reads as low-contrast and costume-like at scale; it only works as a thin line, dot, or small badge text.
- **Don't** stack a Surface card inside another Surface card (the No Card-on-Card Rule) — use a divider instead.
- **Don't** mix Marcellus and Spectral within the same line of text, and never set paragraph-length body copy in Marcellus.
