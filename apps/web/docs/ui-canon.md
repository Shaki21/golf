# UI Canon — Single Source of Truth

> **Canon-first**: All UI decisions reference this document and the live `/ui-canon` page.
> No new components, variants, or styles without updating the canon first.

## Live Reference

In development mode, visit `/ui-canon` for the interactive style guide.

---

## Authoritative Primitives

These components in `src/ui/primitives/` are the **only** sources for UI elements:

| Primitive | Location | Purpose |
|-----------|----------|---------|
| `Button` | `primitives/Button.tsx` | All clickable actions |
| `Card` | `primitives/Card.tsx` | Content containers |
| `Badge` | `primitives/Badge.tsx` | Status indicators, labels, tags |
| `Input` | `primitives/Input.tsx` | Text fields, form inputs |
| `StateCard` | `primitives/StateCard.tsx` | Category/stat displays |
| `Tabs` | `primitives/Tabs.tsx` | Tab navigation |

**Rule**: Features import from `src/ui/primitives/`, never create local variants.

---

## Badge Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `neutral` | Default state, non-semantic labels | "Kategori", "Info" |
| `accent` | Brand-related, primary highlight | "Anbefalt", "Populær" |
| `success` | Completed, approved, positive | "Fullført", "Godkjent" |
| `warning` | Attention needed, pending | "Venter", "Snart frist" |
| `error` | Failed, urgent, problems | "Feilet", "Overdue" |
| `achievement` | Earned rewards, special accomplishments | "Gull", "Mester" |

```tsx
// Correct usage
<Badge variant="success">Fullført</Badge>
<Badge variant="achievement">Gull</Badge>

// Wrong - never hardcode colors
<span style={{ background: '#22c55e' }}>Fullført</span>
```

---

## Spacing Scale

Based on 4px base unit. Use these values consistently:

| Token | Value | Use Case |
|-------|-------|----------|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Icon gaps, small padding |
| `--space-3` | 12px | **Inside cards** |
| `--space-4` | 16px | **Inside cards**, form gaps |
| `--space-6` | 24px | **Between sections** |
| `--space-8` | 32px | **Between major sections** |

### Spacing Rules

- **Inside cards**: 12–16px (`--space-3` to `--space-4`)
- **Between sections**: 24–32px (`--space-6` to `--space-8`)
- **Card padding**: 16–20px
- **List item gaps**: 8–12px

---

## Color Usage

### Semantic Tokens Only

Always use semantic tokens, never raw hex values:

```css
/* Correct */
color: var(--text-primary);
background: var(--card);
border-color: var(--border);

/* Wrong */
color: #1e293b;
background: #ffffff;
border-color: #e2e8f0;
```

### Background Hierarchy

1. `--background-default` — Page background
2. `--card` — Card surfaces
3. `--bg-neutral-subtle` — Subtle containers inside cards

### Text Hierarchy

1. `--text-primary` — Headings, important text
2. `--text-secondary` — Body text, descriptions
3. `--text-tertiary` — Captions, metadata

---

## Do's and Don'ts

### Do

- Import primitives from `src/ui/primitives/`
- Use semantic CSS tokens (`var(--accent)`)
- Follow the spacing scale
- Check `/ui-canon` before adding new styles
- Use `border-radius: 20px` for cards (Apple aesthetic)

### Don't

- Create local component variants in features
- Use inline styles with hardcoded colors
- Add new color values without updating tokens
- Use arbitrary spacing values (use 4px multiples)
- Import from `packages/design-system/` directly in features

---

## Card Styling

Standard card appearance:

```tsx
<Card variant="default">  // or "outlined", "flat", "elevated"
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content with 16px internal padding */}
  </CardContent>
</Card>
```

Card properties:
- Border radius: 20px
- Shadow: `0 1px 3px rgba(0,0,0,0.04)`
- Border: 1px solid `var(--border)`

---

## Typography Scale

| Level | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| Heading 1 | 32px | 700 | 1.2 | Page titles |
| Heading 2 | 24px | 600 | 1.3 | Section headers |
| Heading 3 | 18px | 600 | 1.4 | Card titles |
| Body | 15px | 400 | 1.5 | Main content |
| Caption | 13px | 500 | 1.4 | Metadata, labels |
| Small | 12px | 400 | 1.4 | Timestamps, hints |

---

## Quick Reference

```
┌─────────────────────────────────────────────────────┐
│  Page (--background-default)                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  Card (--card, radius: 20px)                  │  │
│  │  padding: 16-20px                             │  │
│  │                                               │  │
│  │  <Badge variant="success">Label</Badge>       │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                    ↕ 24-32px gap                    │
│  ┌───────────────────────────────────────────────┐  │
│  │  Next Section                                 │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-26 | Initial canon established. Badge variants: neutral, accent, success, warning, error, achievement |
