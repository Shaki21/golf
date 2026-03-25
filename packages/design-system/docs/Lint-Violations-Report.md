# Lint Violations Report

> **Generert:** 2025-12-26
> **Scope:** apps/web/src/components, apps/web/src/features, apps/web/src/ui

---

## Sammendrag

| Type | Antall forekomster | Antall filer |
|------|-------------------|--------------|
| Hardkodede hex-verdier | ~888 | ~45 filer |
| Rå `--ak-*` tokens | ~562 | ~20 filer |
| Rå `--gray-*` tokens | ~15 | ~11 filer |
| **Totalt** | **~1465** | **~50+ filer** |

---

## Høyest Prioritet (Batch A-filer med brudd)

### 1. VideoAnalysisPage.jsx
**Plassering:** `features/video-analysis/VideoAnalysisPage.jsx`
**Brudd:** 15+ forekomster av `--ak-*` tokens og hex fallbacks

```javascript
// Eksempler på brudd:
container: 'bg-[var(--ak-ink,#0a0a0a)]'          // FEIL
commentItem: 'bg-[var(--ak-surface-dark,#0f0f1a)]' // FEIL
color: apiAnnotation.drawingData?.color || '#ff0000' // FEIL
```

**Anbefalt fix:**
```javascript
container: 'bg-background-inverse'
commentItem: 'bg-surface'
color: 'var(--error)' // eller dynamisk fra props
```

---

### 2. CoachPlanningHub.tsx
**Plassering:** `features/coach-planning/CoachPlanningHub.tsx`
**Brudd:** Hardkodede kategorifarger

```typescript
// Brudd:
case 'A': return { bg: '#dcfce7', text: '#166534' };
case 'B': return { bg: '#dbeafe', text: '#1e40af' };
<User size={16} color="#f59e0b" />
```

**Anbefalt fix:** Bruk semantiske tokens eller CSS-klasser

---

### 3. AdminFeatureFlagsEditor.tsx
**Plassering:** `features/admin-feature-flags/AdminFeatureFlagsEditor.tsx`
**Brudd:** Definerer eget fargeobjekt med hex

```typescript
// Brudd (linje 24-33):
const colors = {
  primary: '#10456A',
  primaryLight: '#2C5F7F',
  ...
}
```

**Anbefalt fix:** Importer fra design-tokens.js

---

### 4. SwingTimeline.jsx / VideoProgressView.jsx
**Plassering:** `features/video-progress/`
**Brudd:** Inline --ak-* tokens

```javascript
backgroundColor: 'var(--ak-surface, #1a1a2e)'
border: '1px solid var(--ak-border, rgba(255,255,255,0.1))'
```

---

## UI Primitives med brudd

| Fil | Brudd-type |
|-----|------------|
| `ui/composites/BottomNav.tsx` | `--ak-*` tokens |
| `ui/composites/Toast.composite.tsx` | `--ak-*` tokens |
| `ui/composites/Dropdown.composite.tsx` | `--ak-*` og `--gray-*` |
| `ui/primitives/Badge.primitive.tsx` | `--ak-*` tokens |
| `ui/primitives/Button.primitive.tsx` | `--ak-*` tokens |
| `ui/primitives/Input.primitive.tsx` | `--ak-*` og `--gray-*` |
| `ui/primitives/Avatar.primitive.tsx` | `--ak-*` og `--gray-*` |
| `ui/primitives/Switch.primitive.tsx` | `--ak-*` og `--gray-*` |
| `ui/raw-blocks/CalendarWeek.raw.tsx` | `--ak-*` og `--gray-*` |

---

## Features med brudd (alfabetisk)

| Feature-mappe | Antall filer | Alvorlighet |
|---------------|-------------|-------------|
| `calendar/` | 5 | Middels |
| `coach-groups/` | 2 | Lav |
| `coach-messages/` | 3 | Lav |
| `coach-planning/` | 1 | Høy |
| `coaches/` | 1 | Lav |
| `tests/` | 3 | Middels |
| `training/` | 2 | Middels |
| `video-analysis/` | 1 | Høy |
| `video-library/` | 4 | Middels |
| `video-progress/` | 2 | Middels |

---

## Unntatte filer (OK å ha hex)

Disse filene er unntatt fordi de definerer tokens:

- `src/design-tokens.js` - Token-definisjoner
- `src/index.css` - Root CSS med token-definisjoner
- `packages/design-system/tokens/tokens.css` - Design system tokens
- `ui/lab/*.tsx` - Dev-only lab filer
- `**/*.test.{js,jsx,ts,tsx}` - Testfiler

---

## Handlingsplan

### Fase 1: Kritiske komponenter (Batch A)
1. [ ] Fiks `VideoAnalysisPage.jsx`
2. [ ] Fiks `CoachPlanningHub.tsx`
3. [ ] Fiks alle `ui/primitives/*.tsx` filer
4. [ ] Oppdater `ui/composites/Toast.composite.tsx`

### Fase 2: Sekundære (Batch B)
1. [ ] Fiks kalender-komponenter
2. [ ] Fiks video-library komponenter
3. [ ] Oppdater coach-relaterte features

### Fase 3: Resten
1. [ ] Gjennomgå alle gjenværende filer
2. [ ] Aktiver ESLint-regel som `error` (ikke `warn`)
3. [ ] Legg til pre-commit hook for å blokkere nye brudd

---

## Slik kjører du lint

```bash
# Fra prosjektrot:
npm run lint

# For å se kun token-brudd:
grep -rn "var(--ak-\|var(--gray-\|#[0-9A-Fa-f]\{6\}" apps/web/src/features --include="*.jsx" --include="*.tsx"
```

---

## Referanser

- [Color-Icon-Contract-v1.md](./Color-Icon-Contract-v1.md)
- [Token-Usage-Matrix.md](./Token-Usage-Matrix.md)
- [Component-Token-Audit.md](./Component-Token-Audit.md)
