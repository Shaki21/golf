# Token Usage Matrix

> **Versjon:** 1.0
> **Sist oppdatert:** 2025-12-26

Denne matrisen definerer eksakt hvilke tokens som skal brukes for hvilke formål.

---

## Bakgrunn-tokens

| Token | Tillatt bruk | Forbudt bruk |
|-------|-------------|--------------|
| `--bg` | Hovedbakgrunn, page background | - |
| `--card` | Kort, paneler, modaler, dropdowns | Tekst, ikoner |
| `--background-surface` | Sekundære overflater, sidebars | - |
| `--background-white` | Rent hvite områder, inputs | - |
| `--background-accent` | CTA-knapper, aktive tabs, hover | Status-indikatorer, achievements |
| `--background-inverse` | Inverterte seksjoner, dark mode | - |

---

## Tekst-tokens

| Token | Tillatt bruk | Forbudt bruk |
|-------|-------------|--------------|
| `--text-primary` | Hovedtekst, overskrifter, viktig innhold | Dempet/sekundær tekst |
| `--text-secondary` | Undertekst, labels, metadata | Hovedoverskrifter |
| `--text-tertiary` | Placeholder, hint, disabled tekst | Viktig innhold |
| `--text-inverse` | Tekst på mørk bakgrunn | Tekst på lys bakgrunn |
| `--text-brand` | Logo, brand-elementer | Vanlig tekst |
| `--text-accent` | Linker, interaktiv tekst, CTA | Status, achievements |
| `--text-achievement` | Badge-tekst, tier-navn, gamification | CTA, linker, navigasjon |

---

## Border-tokens

| Token | Tillatt bruk | Forbudt bruk |
|-------|-------------|--------------|
| `--border` / `--border-default` | Standard kanter på kort, inputs | - |
| `--border-subtle` | Subtile separatorer, dividers | Synlige kanter |
| `--border-brand` | Brand-elementer, fremhevede kort | Vanlige kort |
| `--border-accent` | Fokus-ring, aktive elementer, CTA | Status-indikatorer |
| `--border-achievement` | Achievement-badges, tier-kanter | CTA, navigasjon |

---

## Aksent & Status-tokens

| Token | Tillatt bruk | Forbudt bruk |
|-------|-------------|--------------|
| `--accent` | CTA-knapper, linker, fokus-ring, aktive states, navigasjon | Status-indikatorer, achievements |
| `--accent-hover` | Hover-state for aksent-elementer | Default state |
| `--achievement` | Badges, tiers, gamification, gull-elementer | CTA, navigasjon, vanlige knapper |
| `--success` | Suksess-meldinger, bekreftelser, positive indikatorer | CTA, navigasjon |
| `--warning` | Advarsler, varsler, attention-states | CTA, suksess |
| `--error` | Feilmeldinger, validation errors, kritiske varsler | CTA, advarsler |
| `--info` | Informasjon, tips, nøytrale varsler | Aksjoner, status |

---

## Ikon-roller

| Rolle | Token | Eksempel-bruk |
|-------|-------|---------------|
| **Aksjon** | `--accent` (via `.tone-accent`) | Chevrons, meny-ikoner, navigasjon |
| **Achievement** | `--achievement` (via `.tone-achievement`) | Trophy, star, medal |
| **Suksess** | `--success` (via `.tone-success`) | CheckCircle, CheckSquare |
| **Advarsel** | `--warning` (via `.tone-warning`) | AlertTriangle |
| **Feil** | `--error` (via `.tone-error`) | XCircle, AlertOctagon |
| **Info** | `--info` (via `.tone-info`) | Info, HelpCircle |
| **Dempet** | `--text-tertiary` (via `.tone-muted`) | Inaktive ikoner, placeholder |

---

## Komponent-til-Token Mapping

### Button

| State | Background | Text | Border |
|-------|------------|------|--------|
| Primary default | `--accent` | `--text-inverse` | `--accent` |
| Primary hover | `--accent-hover` | `--text-inverse` | `--accent-hover` |
| Secondary default | transparent | `--accent` | `--border-accent` |
| Secondary hover | `--accent` (10%) | `--accent` | `--border-accent` |
| Disabled | `--bg` | `--text-tertiary` | `--border` |

### Badge

| Type | Background | Text | Border |
|------|------------|------|--------|
| Default | `--accent` (10%) | `--text-accent` | none |
| Achievement/Tier | `--achievement` (10%) | `--text-achievement` | `--border-achievement` |
| Success | `--success` (10%) | `--success` | none |
| Warning | `--warning` (10%) | `--warning` | none |
| Error | `--error` (10%) | `--error` | none |

### Card

| Element | Token |
|---------|-------|
| Background | `--card` |
| Border | `--border` |
| Shadow | `--shadow-card` |
| Hover border | `--border-accent` |

### Input

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | `--background-white` | `--border` | `--text-primary` |
| Focus | `--background-white` | `--border-accent` | `--text-primary` |
| Error | `--background-white` | `--error` | `--text-primary` |
| Disabled | `--bg` | `--border` | `--text-tertiary` |
| Placeholder | - | - | `--text-tertiary` |

### Toast/Alert

| Type | Background | Text | Icon |
|------|------------|------|------|
| Success | `--success` (10%) | `--text-primary` | `.tone-success` |
| Warning | `--warning` (10%) | `--text-primary` | `.tone-warning` |
| Error | `--error` (10%) | `--text-primary` | `.tone-error` |
| Info | `--info` (10%) | `--text-primary` | `.tone-info` |

---

## Forbudte Tokens i Komponenter

Disse tokenene skal **ALDRI** brukes direkte i komponent-kode:

### Rå Palette (--ak-*)

```
--ak-primary        FORBUDT  -> Bruk --accent
--ak-primary-light  FORBUDT  -> Bruk --accent-hover
--ak-gold           FORBUDT  -> Bruk --achievement
--ak-ink            FORBUDT  -> Bruk --text-primary / --background-inverse
--ak-snow           FORBUDT  -> Bruk --bg / --background-default
--ak-surface        FORBUDT  -> Bruk --background-surface
--ak-success        FORBUDT  -> Bruk --success
--ak-warning        FORBUDT  -> Bruk --warning
--ak-error          FORBUDT  -> Bruk --error
```

### Gråskala (--gray-*)

```
--gray-50           FORBUDT  -> Bruk --bg
--gray-100          FORBUDT  -> Bruk --background-surface
--gray-300          FORBUDT  -> Bruk --border
--gray-500          FORBUDT  -> Bruk --text-tertiary
--gray-600          FORBUDT  -> Bruk --text-secondary
--gray-700          FORBUDT  -> Bruk --text-secondary
--gray-900          FORBUDT  -> Bruk --text-primary
```

### Legacy Aliases

```
--ak-forest         FORBUDT  -> Bruk --accent
--ak-forest-light   FORBUDT  -> Bruk --accent-hover
--ak-foam           FORBUDT  -> Bruk --bg
--ak-ivory          FORBUDT  -> Bruk --background-surface
--ak-charcoal       FORBUDT  -> Bruk --text-primary
--ak-steel          FORBUDT  -> Bruk --text-tertiary
--ak-mist           FORBUDT  -> Bruk --border-subtle
--ak-cloud          FORBUDT  -> Bruk --bg
```

---

## Dark Mode Mapping

Semantiske tokens endres automatisk i dark mode:

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--bg` | #FAFAFA | #02060D (ink) |
| `--card` | #FFFFFF | #101720 |
| `--border` | #D5D7DA | #223042 |
| `--accent` | #10456A | #2BA6A6 |
| `--text-primary` | #02060D | #EDF0F2 |
| `--text-secondary` | #535862 | #B8C2CE |
| `--text-tertiary` | #8E8E93 | #7C8896 |

**Viktig:** Fordi vi bruker semantiske tokens, fungerer dark mode automatisk uten endringer i komponent-kode.
