# Color & Icon Contract v1

> **Status:** Production
> **Gjelder:** AK Golf Academy Design System v3.0
> **Sist oppdatert:** 2025-12-26

---

## TL;DR

- **ALDRI** bruk hardkodede hex-verdier (`#10456A`) i komponenter
- **ALDRI** bruk rå palette-tokens (`--ak-*`, `--gray-*`) i komponenter
- **ALLTID** bruk semantiske tokens (`--accent`, `--bg`, `--success`, etc.)
- **ALDRI** la ikoner ha hardkodede farger - bruk `currentColor`
- **ALDRI** bruk `--achievement` (gull) for CTA eller navigasjon - kun for badges/tiers

---

## 1. Ikke-forhandlingsbare Regler

### Farger

| Regel | Forklaring |
|-------|------------|
| **ALDRI hex i komponenter** | `color: #10456A` er forbudt. Bruk `color: var(--accent)` |
| **ALDRI rå tokens i komponenter** | `var(--ak-primary)` er forbudt. Bruk `var(--accent)` |
| **ALDRI --gray-* i komponenter** | `var(--gray-500)` er forbudt. Bruk `var(--text-tertiary)` |
| **Accent != Achievement** | `--accent` = aksjoner/CTA. `--achievement` = kun badges/tiers |

### Ikoner

| Regel | Forklaring |
|-------|------------|
| **ALDRI hardkodede farger i SVG** | `stroke="#10456A"` er forbudt |
| **ALLTID currentColor** | `stroke="currentColor"` og `fill="currentColor"` |
| **Farge via CSS-klasser** | Bruk `.tone-accent`, `.tone-success`, etc. |

---

## 2. Tillatte Semantiske Tokens

### Bakgrunn

```css
--bg                    /* Hovedbakgrunn */
--card                  /* Kort/panel bakgrunn */
--background-default    /* Alias for --bg */
--background-surface    /* Sekundær overflate */
--background-white      /* Hvit bakgrunn */
--background-accent     /* Aksentert bakgrunn (CTA) */
--background-inverse    /* Invertert bakgrunn */
```

### Tekst

```css
--text-primary          /* Hovedtekst */
--text-secondary        /* Sekundær tekst */
--text-tertiary         /* Tertiær/dempet tekst */
--text-inverse          /* Invertert tekst (på mørk bg) */
--text-brand            /* Merkefarget tekst */
--text-accent           /* Aksenttekst (linker, CTA) */
--text-achievement      /* KUN for achievement-tekst */
```

### Border

```css
--border                /* Standard kantlinje */
--border-default        /* Alias for --border */
--border-subtle         /* Subtil kantlinje */
--border-brand          /* Merkefarget kant */
--border-accent         /* Aksentkant */
--border-achievement    /* KUN for achievement-kanter */
```

### Aksent & Status

```css
--accent                /* CTA, linker, aktive states, fokus */
--accent-hover          /* Hover-state for aksent */
--achievement           /* KUN badges, tiers, gamification */
--success               /* Suksess-status */
--warning               /* Advarsel-status */
--error                 /* Feil-status */
--info                  /* Info-status */
```

---

## 3. Forbudte Mønstre

### I JavaScript/TypeScript/JSX

```jsx
// FEIL - Hardkodet hex
<div style={{ color: '#10456A' }}>...</div>
<div style={{ backgroundColor: '#C9A227' }}>...</div>

// FEIL - Rå palette-token
<div style={{ color: 'var(--ak-primary)' }}>...</div>
<div style={{ color: 'var(--gray-500)' }}>...</div>

// RIKTIG - Semantisk token
<div style={{ color: 'var(--accent)' }}>...</div>
<div style={{ color: 'var(--text-tertiary)' }}>...</div>
```

### I CSS/Tailwind

```css
/* FEIL */
.button { background-color: #10456A; }
.button { color: var(--ak-gold); }

/* RIKTIG */
.button { background-color: var(--accent); }
.button { color: var(--text-primary); }
```

### I SVG-ikoner

```html
<!-- FEIL - Hardkodet farge -->
<svg stroke="#10456A" fill="#C9A227">
  <path d="..."/>
</svg>

<!-- RIKTIG - currentColor -->
<svg stroke="currentColor" fill="currentColor">
  <path d="..."/>
</svg>
```

---

## 4. Ikon-roller og Tone-klasser

### Tilgjengelige Tone-klasser

```css
.tone-accent        { color: var(--accent); }      /* Aksjoner, navigasjon */
.tone-achievement   { color: var(--achievement); } /* Badges, tiers (gull) */
.tone-success       { color: var(--success); }     /* Suksess-status */
.tone-warning       { color: var(--warning); }     /* Advarsel-status */
.tone-error         { color: var(--error); }       /* Feil-status */
.tone-info          { color: var(--info); }        /* Info-status */
.tone-muted         { color: var(--text-tertiary); } /* Dempet/inaktiv */
```

### Bruk

```jsx
// Aksjon-ikon (f.eks. pil, meny)
<ChevronRight className="tone-accent" />

// Status-ikon
<CheckCircle className="tone-success" />
<AlertTriangle className="tone-warning" />
<XCircle className="tone-error" />

// Achievement-ikon (KUN for badges/tiers)
<Trophy className="tone-achievement" />
<Star className="tone-achievement" />
```

---

## 5. Kodeeksempler

### FEIL vs RIKTIG - Button

```jsx
// FEIL
const Button = () => (
  <button style={{
    backgroundColor: '#10456A',
    color: '#FFFFFF',
    border: '1px solid #2C5F7F'
  }}>
    Klikk
  </button>
);

// RIKTIG
const Button = () => (
  <button style={{
    backgroundColor: 'var(--accent)',
    color: 'var(--text-inverse)',
    border: '1px solid var(--accent-hover)'
  }}>
    Klikk
  </button>
);
```

### FEIL vs RIKTIG - Badge

```jsx
// FEIL - Achievement-farge på vanlig badge
const CategoryBadge = () => (
  <span style={{ backgroundColor: 'var(--ak-gold)' }}>
    Kategori A
  </span>
);

// RIKTIG - Semantisk farge
const CategoryBadge = () => (
  <span style={{ backgroundColor: 'var(--accent)' }}>
    Kategori A
  </span>
);

// RIKTIG - Achievement-farge KUN for tier/achievement badge
const AchievementBadge = () => (
  <span style={{ backgroundColor: 'var(--achievement)' }}>
    Gull Tier
  </span>
);
```

### FEIL vs RIKTIG - Icon

```jsx
// FEIL - Hardkodet farge i SVG
const Icon = () => (
  <svg stroke="#10456A">
    <path d="..."/>
  </svg>
);

// RIKTIG - currentColor + tone-klasse
const Icon = () => (
  <svg className="tone-accent" stroke="currentColor">
    <path d="..."/>
  </svg>
);
```

---

## 6. Unntaksregler

### Tillatte unntak

1. **Token-definisjoner:** `design-tokens.js`, `tokens.css`, `index.css` (root)
2. **Dokumentasjon:** HTML-filer i `/docs`, `/examples`
3. **Tester:** Snapshot-tester kan inneholde hex-verdier
4. **Tredjepartsstiler:** Biblioteker vi ikke kontrollerer

### Prosess for unntak

Hvis du absolutt må bruke en rå verdi:
1. Legg til en kommentar som forklarer hvorfor
2. Lag en PR med `[DESIGN-EXCEPTION]` tag
3. Få godkjenning fra design lead

---

## 7. Håndhevelse

### Lint-regler

```bash
# Kjør token-lint
npm run lint:tokens

# Sjekk for brudd
npm run lint:colors
```

### Code Review Sjekkliste

- [ ] Ingen hardkodede hex-verdier i komponenter
- [ ] Ingen `--ak-*` eller `--gray-*` tokens i komponenter
- [ ] Ikoner bruker `currentColor`
- [ ] `--achievement` brukes kun for badges/tiers
- [ ] Status-farger brukes kun for status-indikatorer

---

## Referanser

- [COLOR_PALETTE.html](/packages/design-system/docs/COLOR_PALETTE.html)
- [ICON_GALLERY.html](/packages/design-system/docs/ICON_GALLERY.html)
- [Token-Usage-Matrix.md](./Token-Usage-Matrix.md)
- [Component-Token-Audit.md](./Component-Token-Audit.md)
