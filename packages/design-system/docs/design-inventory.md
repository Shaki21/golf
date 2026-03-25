# Design System Inventory Report

**Generert:** 2025-12-26
**Scope:** `packages/design-system/` og `apps/web/src/`
**Status:** Kartlegging fullfort - Runde 1

---

## A) Filteroversikt

### Design-relaterte filer identifisert:

| Kategori | Antall filer | Plasseringer |
|----------|--------------|--------------|
| CSS-filer | 5 | `apps/web/src/`, `packages/design-system/` |
| Tailwind config | 3 | `apps/web/`, `packages/design-system/tokens/`, `packages/design-system/AK_Golf_Design_Variants/` |
| Token-filer (JS) | 3 | `apps/web/src/`, `packages/design-system/tokens/`, `packages/design-system/AK_Golf_Design_Variants/` |
| Token-filer (CSS) | 2 | `packages/design-system/tokens/`, `packages/design-system/AK_Golf_Design_Variants/` |
| UI Primitives | 10+ | `apps/web/src/ui/primitives/` |
| UI Components (legacy) | 17+ | `apps/web/src/components/ui/` |
| Brand/Logo assets | 4 | `packages/design-system/figma/` |
| Mockups/Varianter | 50+ | `packages/design-system/AK_Golf_Design_Variants/`, `packages/design-system/mockups/` |

---

## B) Oversiktstabell - Kritiske filer

### CSS Entry Points

| Path | Type | Bruk | Risiko | Notater |
|------|------|------|--------|---------|
| `apps/web/src/index.css` | Global CSS | Importert i `index.js` - AKTIV | **HIGH** | Faktisk SSOT for CSS vars (1871 linjer). Inkluderer Tailwind directives, alle tokens, dark mode, utilities |
| `apps/web/src/styles/accessibility.css` | Utility CSS | Importeres trolig et sted | MED | 405 linjer a11y-hjelpere. Refererer til tokens |
| `apps/web/src/components/FocusSession.css` | Feature CSS | Lokal styling | LOW | Feature-spesifikk |
| `packages/design-system/tokens/tokens.css` | Token CSS | **UBRUKT** | MED | 219 linjer - duplikat av index.css tokens. Ikke importert |
| `packages/design-system/AK_Golf_Design_Variants/tokens.css` | Token CSS | **UBRUKT** | LOW | Kopi av tokens.css - arkivmappe |

### Tailwind Config

| Path | Type | Bruk | Risiko | Notater |
|------|------|------|--------|---------|
| `apps/web/tailwind.config.js` | Tailwind Config | **AKTIV** | **HIGH** | Brukes av build - refererer CSS vars |
| `packages/design-system/tokens/tailwind.config.js` | Tailwind Config | **UBRUKT** | MED | Hardkoder fargeverdier direkte (ikke vars) |
| `packages/design-system/AK_Golf_Design_Variants/tailwind.config.js` | Tailwind Config | **UBRUKT** | LOW | Kopi - arkivmappe |

### Design Tokens (JavaScript)

| Path | Type | Bruk | Risiko | Notater |
|------|------|------|--------|---------|
| `apps/web/src/design-tokens.js` | JS Tokens | **AKTIV** - 100+ imports | **HIGH** | Brukes i hele appen for inline styles |
| `packages/design-system/tokens/design-tokens.js` | JS Tokens | **UBRUKT** (unntatt via index.ts) | MED | Litt forskjellig struktur fra web-versjonen |
| `packages/design-system/AK_Golf_Design_Variants/design-tokens.js` | JS Tokens | **UBRUKT** | LOW | Kopi - arkivmappe |

### UI Components

| Path | Type | Bruk | Risiko | Notater |
|------|------|------|--------|---------|
| `apps/web/src/ui/primitives/` | UI Canon v1.2 | **AKTIV** | **HIGH** | Card, Button, Input, Badge + 6 andre. Bruker CSS vars |
| `apps/web/src/ui/composites/` | Composite Components | **AKTIV** | MED | Modal, Toast, Dropdown, etc. |
| `apps/web/src/components/ui/` | Legacy UI | **AKTIV** (delvis) | MED | LoadingState, ErrorState, etc. - eldre pattern |
| `packages/design-system/components/` | DS Components | **UBRUKT** | LOW | Avatar, Badge, Button, Card - ikke importert i web |

### Theme/Dark Mode

| Path | Type | Bruk | Risiko | Notater |
|------|------|------|--------|---------|
| `apps/web/src/theme/theme.ts` | Theme Management | **AKTIV** | MED | Brukes i index.js. Setter `data-theme` og `.dark`/`.light` |
| `apps/web/src/index.css` | CSS Dark Mode | **AKTIV** | **HIGH** | Dual support: `.dark` class OG `@media (prefers-color-scheme)` |

### Brand Assets

| Path | Type | Bruk | Risiko | Notater |
|------|------|------|--------|---------|
| `packages/design-system/figma/AK_Icon_Logo.svg` | Logo SVG | Referanse | LOW | 1.5KB |
| `packages/design-system/figma/ak_golf_figma_kit_blue_palette01.svg` | Figma Kit | Referanse | LOW | 95KB - design source |
| `packages/design-system/figma/ak_golf_complete_figma_kit.svg` | Figma Kit | Duplikat | LOW | Duplikat med og uten " 2" suffix |

---

## C) Konfliktanalyse (KRITISK)

### 1. Font-family kilder

| Sted | Verdi | Status |
|------|-------|--------|
| `apps/web/src/index.css` :root | `'Inter', -apple-system, ...` | **AKTIV** - primary |
| `apps/web/src/index.css` :root | `'DM Sans'` for logo | **AKTIV** - logo font |
| `apps/web/tailwind.config.js` fontFamily.sans | `['Inter', ...]` | **AKTIV** - synkronisert |
| `apps/web/src/design-tokens.js` | `'Inter', ...` | **AKTIV** - synkronisert |
| `packages/design-system/tokens/tokens.css` | `'Inter', ...` | UBRUKT |
| `packages/design-system/tokens/tailwind.config.js` | `['Inter', ...]` | UBRUKT |

**Vurdering:** Ingen konflikt. Inter er konsistent overalt. DM Sans brukes kun for logo.

### 2. Fargekonflikter (Dobbeltkilder!)

| Token | index.css (AKTIV) | design-tokens.js (AKTIV) | tokens/tailwind.config.js (UBRUKT) |
|-------|-------------------|--------------------------|-----------------------------------|
| primary | `var(--ak-primary)` -> `#10456A` | `#10456A` | `#10456A` |
| success | `var(--ak-success)` -> `#4A7C59` | `#4A7C59` | `#4A7C59` |
| warning | `var(--ak-warning)` -> `#D4A84B` | `#D4A84B` | `#D4A84B` |
| error | `var(--ak-error)` -> `#C45B4E` | `#C45B4E` | `#C45B4E` |

**Vurdering:** Fargene ER synkroniserte, men det finnes **3 kilder**:
1. `index.css` (CSS vars) - brukt av Tailwind og CSS
2. `design-tokens.js` (JS object) - brukt av 100+ komponenter for inline styles
3. `packages/design-system/tokens/` - **HELT UBRUKT** men identisk

**Risiko:** Ved fremtidig endring ma man oppdatere 2 steder (index.css + design-tokens.js).

### 3. Theme/Dark Mode konflikter

| Mekanisme | Fil | Status |
|-----------|-----|--------|
| `html.dark` class | index.css linje 213 | **AKTIV** |
| `[data-theme="dark"]` attribute | index.css linje 214 | **AKTIV** |
| `@media (prefers-color-scheme: dark)` | index.css linje 299 | **AKTIV** |
| `theme.ts` setter begge | theme.ts | **AKTIV** |

**Vurdering:** Vel designet - triple fallback (class, attribute, media query). theme.ts setter begge. Ingen konflikt.

### 4. Icon kilder

| Kilde | Bruk | Antall imports |
|-------|------|----------------|
| `lucide-react` | Direkte import | 30+ filer |
| `packages/design-system/AK_Golf_Design_Variants/icons.jsx` | UBRUKT | 0 |

**Vurdering:** Konsistent bruk av lucide-react. Design-system icon-fil er ubrukt.

### 5. UI Component duplikater

| Komponent | `apps/web/src/ui/primitives/` | `apps/web/src/components/ui/` | `packages/design-system/components/` |
|-----------|-------------------------------|-------------------------------|-------------------------------------|
| Button | `Button.tsx` (AKTIV) | - | `Button.tsx` (UBRUKT) |
| Card | `Card.tsx` (AKTIV) | - | `Card.tsx` (UBRUKT) |
| Badge | `Badge.primitive.tsx` (AKTIV) | - | `Badge.tsx` (UBRUKT) |
| Input | `Input.tsx` (AKTIV) | - | `Input.tsx` (UBRUKT) |
| LoadingState | - | `LoadingState.jsx` (AKTIV) | - |
| ErrorState | - | `ErrorState.jsx` (AKTIV) | - |

**Vurdering:** Det finnes **to generasjoner** av UI-komponenter:
1. **Ny:** `apps/web/src/ui/primitives/` - TypeScript, UI Canon v1.2, CSS vars
2. **Legacy:** `apps/web/src/components/ui/` - JavaScript, eldre pattern
3. **Ubrukt:** `packages/design-system/components/` - aldri importert

---

## D) Entry Points

### Faktisk import-kjede:

```
apps/web/src/index.js
    |
    +-- import './index.css'  <-- ALL CSS entry point
    |       |
    |       +-- @tailwind base/components/utilities
    |       +-- @import Google Fonts (Inter, DM Sans)
    |       +-- :root { ... alle tokens ... }
    |       +-- :root.dark { ... dark mode ... }
    |       +-- Base styles, typography, animations
    |
    +-- import { initializeTheme } from './theme/theme'
    |
    +-- import App from './App'
            |
            +-- import { tokens } from './design-tokens'
            +-- (100+ andre komponenter importerer design-tokens)
```

### Tailwind build:

```
apps/web/tailwind.config.js
    |
    +-- content: ["./src/**/*.{js,ts,jsx,tsx}"]
    +-- theme.extend.colors -> var(--token-name)
    +-- (refererer CSS vars fra index.css)
```

---

## Sammendrag: 5 storste problemer

### 1. **DOBBELTKILDE FOR TOKENS** (HIGH)
Farger/spacing defineres bade i `index.css` (CSS vars) OG `design-tokens.js` (JS object). Ved endring ma begge oppdateres.

### 2. **UBRUKT packages/design-system/ INNHOLD** (MED)
Hele `packages/design-system/tokens/` og `packages/design-system/components/` er duplisert og ubrukt. Forvirrende for nye utviklere.

### 3. **TO GENERASJONER UI COMPONENTS** (MED)
`apps/web/src/ui/primitives/` (ny) og `apps/web/src/components/ui/` (legacy) eksisterer side om side. Uklart hvilken som skal brukes.

### 4. **AK_Golf_Design_Variants KAOS** (LOW-MED)
Mappen inneholder 50+ html-mockups, kopier av tokens, og varianter som aldri brukes i prod. Tar plass, skaper forvirring.

### 5. **INGEN OFFISIELL EKSPORT FRA DESIGN-SYSTEM** (LOW)
`packages/design-system/components/index.ts` eksporterer komponenter som aldri importeres. Ingen faktisk bruk av design-system som npm-pakke.

---

## Malstruktur (Anbefalt)

### Single Source of Truth:

```
packages/design-system/
  tokens/
    tokens.css              <- SSOT for CSS vars (farger, spacing, typography)
    design-tokens.js        <- Generert fra tokens.css (eller manuelt synkronisert)
    tailwind.config.js      <- Brukes av apps/web
  primitives/               <- Flyttes fra apps/web/src/ui/primitives
    Button.tsx
    Card.tsx
    Input.tsx
    Badge.tsx
    ...
  composites/               <- Flyttes fra apps/web/src/ui/composites
  brand/
    logo/
    favicon/
  docs/
    design-inventory.md

apps/web/
  src/
    index.css               <- Importerer fra design-system/tokens/tokens.css
    components/ui/          <- KUN app-spesifikke components, eller migreres til legacy/
```

---

## Oppryddingsplan

### P0 - Ma (Konflikter som pavirker UI/DX)

1. **Synkroniser eller eliminer dobbeltkilde**
   - Velg: enten CSS vars genererer JS tokens, eller omvendt
   - Alternativ: fjern JS tokens helt, bruk kun CSS vars via Tailwind

2. **Marker legacy components tydelig**
   - Rename `apps/web/src/components/ui/` -> `components/legacy-ui/`
   - Eller: migrer bruken til `ui/primitives/`

### P1 - Bor (Flytte og normalisere)

1. **Flytt aktive tokens til design-system**
   - Kopier `apps/web/src/index.css` tokens-delen til `packages/design-system/tokens/`
   - apps/web importerer fra design-system

2. **Flytt UI primitives til design-system**
   - `apps/web/src/ui/primitives/` -> `packages/design-system/primitives/`
   - Behold re-exports i apps/web for bakoverkompabilitet

3. **Konsolider tailwind.config**
   - apps/web/tailwind.config.js utvider design-system/tokens/tailwind.config.js

### P2 - Kan (Arkivere og dokumentere)

1. **Arkiver AK_Golf_Design_Variants**
   - Flytt til `design-archive/` utenfor packages/
   - Eller slett helt (html-mockups)

2. **Slett ubrukte packages/design-system filer**
   - `packages/design-system/components/` (ubrukt)
   - Duplikate figma-filer

3. **Dokumenter "no-go"**
   - Legg til README i design-system med klare retningslinjer

---

## Ikke-brekk strategi

For alle endringer:

1. **Flytt forst, behold re-exports**
   ```javascript
   // apps/web/src/ui/primitives/index.ts
   export * from '@ak-golf/design-system/primitives';
   ```

2. **Ingen breaking path changes uten deprecation**
   - Gamle imports fungerer i minst 1 sprint

3. **Bygg/CI verifisering etter hvert steg**
   - `pnpm build && pnpm test` etter hver endring

4. **Feature flag for store migrasjoner**
   - Bytt mellom gammel/ny komponent med env-var

---

**Neste steg:** Godkjenn denne rapporten, sa starter vi Runde 2 med P0-oppgavene.
