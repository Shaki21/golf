# Design System CI Gate

> **Status:** ACTIVE
> **Phase:** 2-Week Refactor
> **Enforcement:** STRICT (CI fails on violations)

## Overview

This CI gate enforces design system rules to prevent style drift. During the refactor phase, all design system rules are **non-negotiable**.

## Quick Commands

```bash
# Run full gate check locally
pnpm run design-system:check

# Check contrast only
pnpm run design-system:contrast

# Lint CSS files
pnpm run lint:css
```

---

## Allowed Tokens Reference

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--ak-primary` | `#10456A` | Primary brand, CTAs |
| `--ak-primary-light` | `#2C5F7F` | Hover states |
| `--ak-ink` | `#02060D` | Dark text |
| `--ak-snow` | `#EDF0F2` | Page background |
| `--ak-surface` | `#EBE5DA` | Card background |
| `--ak-gold` | `#C9A227` | Accent, highlights |
| `--ak-success` | `#4A7C59` | Success states |
| `--ak-warning` | `#D4A84B` | Warning states |
| `--ak-error` | `#C45B4E` | Error states |
| `--ak-charcoal` | `#1C1C1E` | Primary text |
| `--ak-steel` | `#8E8E93` | Secondary text |
| `--ak-mist` | `#E5E5EA` | Borders |
| `--ak-cloud` | `#F2F2F7` | Light backgrounds |
| `--ak-white` | `#FFFFFF` | White |

### Spacing

| Token | Value |
|-------|-------|
| `--spacing-xs` | `4px` |
| `--spacing-sm` | `8px` |
| `--spacing-md` | `16px` |
| `--spacing-lg` | `24px` |
| `--spacing-xl` | `32px` |
| `--spacing-xxl` | `48px` |

### Typography

| Token | Value |
|-------|-------|
| `--text-large-title` | `700 34px/41px Inter` |
| `--text-title-1` | `700 28px/34px Inter` |
| `--text-title-2` | `700 22px/28px Inter` |
| `--text-title-3` | `600 20px/25px Inter` |
| `--text-headline` | `600 17px/22px Inter` |
| `--text-body` | `400 17px/22px Inter` |
| `--text-callout` | `400 16px/21px Inter` |
| `--text-subhead` | `400 15px/20px Inter` |
| `--text-footnote` | `400 13px/18px Inter` |
| `--text-caption-1` | `400 12px/16px Inter` |
| `--text-caption-2` | `400 11px/13px Inter` |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-full` | `9999px` |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-card` | `0 2px 4px rgba(0, 0, 0, 0.06)` |
| `--shadow-elevated` | `0 4px 12px rgba(0, 0, 0, 0.08)` |

---

## Rules Enforced

### 1. Token-Only Styling

**BLOCKED** in `apps/**`:
- Hex colors: `#fff`, `#10456A`
- RGB/RGBA: `rgb(255, 255, 255)`, `rgba(0, 0, 0, 0.5)`
- HSL/HSLA: `hsl(200, 50%, 50%)`
- Raw px/rem for spacing: `padding: 16px`
- Raw font sizes: `fontSize: '14px'`
- Raw border-radius: `borderRadius: '8px'`
- Raw shadows: `boxShadow: '0 2px 4px rgba(0,0,0,0.1)'`
- Raw z-index > 1: `zIndex: 100`

**ALLOWED**:
- CSS variables: `var(--ak-primary)`
- Token references: `tokens.colors.primary`
- Allowed keywords: `inherit`, `initial`, `transparent`, `currentColor`, `auto`, `none`
- Zero values: `0`, `0px`
- Percentages: `100%`, `50%`

### 2. Component Boundary Enforcement

In scope flows (`apps/**`), only these UI components are allowed from design-system:

| Component | Import Path |
|-----------|-------------|
| `Button` | `packages/design-system` |
| `Input` | `packages/design-system` |
| `Table` | `packages/design-system` |

**BLOCKED**:
- Legacy imports from `components/ui/` (except allowlisted)
- Inline UI component definitions that duplicate design-system

### 3. Contrast Safety (WCAG AA)

| Text Type | Required Ratio |
|-----------|---------------|
| Normal text (<18pt) | ≥ 4.5:1 |
| Large text (≥18pt or ≥14pt bold) | ≥ 3.0:1 |
| UI components | ≥ 3.0:1 |

**Validated Pairs**:
- `--ak-charcoal` on `--ak-white` ✓
- `--ak-charcoal` on `--ak-snow` ✓
- `--ak-white` on `--ak-primary` ✓
- All semantic colors on white backgrounds

---

## Examples of Failing Cases

### ❌ FAIL: Hardcoded Color

```jsx
// apps/web/src/components/MyComponent.jsx
const styles = {
  color: '#10456A',  // ❌ BLOCKED: Hardcoded hex
  backgroundColor: 'rgba(255, 255, 255, 0.9)',  // ❌ BLOCKED: Raw rgba
};
```

**Fix:**
```jsx
import { tokens } from '../../design-tokens';

const styles = {
  color: tokens.colors.primary,  // ✓ Token reference
  backgroundColor: 'var(--ak-white)',  // ✓ CSS variable
};
```

### ❌ FAIL: Hardcoded Spacing

```jsx
const styles = {
  padding: '16px',  // ❌ BLOCKED
  margin: '24px 16px',  // ❌ BLOCKED
  gap: '8px',  // ❌ BLOCKED
};
```

**Fix:**
```jsx
const styles = {
  padding: 'var(--spacing-md)',  // ✓
  margin: `var(--spacing-lg) var(--spacing-md)`,  // ✓
  gap: tokens.spacing.sm,  // ✓
};
```

### ❌ FAIL: Hardcoded Typography

```jsx
const styles = {
  fontSize: '14px',  // ❌ BLOCKED
  lineHeight: '1.5',  // ⚠️ Check context
  letterSpacing: '-0.5px',  // ❌ BLOCKED
};
```

**Fix:**
```jsx
const styles = {
  font: 'var(--text-body)',  // ✓
  letterSpacing: 'var(--text-body-spacing)',  // ✓
};
```

### ❌ FAIL: Hardcoded Border Radius

```jsx
const styles = {
  borderRadius: '12px',  // ❌ BLOCKED
};
```

**Fix:**
```jsx
const styles = {
  borderRadius: 'var(--radius-md)',  // ✓
};
```

### ❌ FAIL: Hardcoded Shadow

```jsx
const styles = {
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',  // ❌ BLOCKED
};
```

**Fix:**
```jsx
const styles = {
  boxShadow: 'var(--shadow-card)',  // ✓
};
```

### ❌ FAIL: Hardcoded Z-Index

```jsx
const styles = {
  zIndex: 100,  // ❌ BLOCKED (>1)
  zIndex: 9999,  // ❌ BLOCKED
};
```

**Fix:**
```jsx
// Use documented z-index tokens when available
// For now, document exceptional cases
const styles = {
  zIndex: 1,  // ✓ Allowed (stacking context)
  zIndex: 'auto',  // ✓ Allowed
};
```

### ❌ FAIL: Legacy Component Import

```jsx
// apps/web/src/features/dashboard/Dashboard.jsx
import { Card, Badge, Avatar } from '../../components/ui';  // ❌ BLOCKED
```

**Fix:**
```jsx
import { Button, Input, Table } from '@ak-golf/design-system';  // ✓ Allowed
// Card, Badge, Avatar need migration to design-system first
```

---

## Exceptions

### Allowlisted Paths

These paths are **exempt** from enforcement:

- `packages/design-system/**` - Source of truth
- `scripts/design-system-gate/**` - Gate tooling itself

### Allowed Raw Values

These values are always permitted:

| Value | Reason |
|-------|--------|
| `0`, `0px` | Zero is universal |
| `1px` | Hairline borders |
| `100%`, `50%` | Percentage layouts |
| `inherit`, `initial`, `unset` | CSS reset values |
| `transparent` | Transparency |
| `currentColor` | Color inheritance |
| `auto` | Auto sizing |
| `none` | Disable property |
| `normal`, `bold` | Font weight keywords |
| `1`, `-1` | Basic stacking |

---

## CI Integration

### Workflow: `design-system-gate.yml`

Triggers on:
- Push to `main`, `develop`
- Pull requests targeting `main`, `develop`
- Changes to `apps/**` or `packages/design-system/**`

Jobs:
1. **Design System Gate** - Full enforcement check
2. **Contrast Check** - WCAG AA validation
3. **Design Token Lint** - ESLint + Stylelint

### Local Pre-Commit

Add to your workflow:

```bash
# Before committing changes to apps/**
pnpm run design-system:check

# Quick contrast check
pnpm run design-system:contrast
```

---

## Extending the Gate

### Adding New Token Checks

Edit `scripts/design-system-gate/eslint-plugin-design-tokens.js`:

1. Add property to `STYLE_PROPERTIES` object
2. Create check function if needed
3. Add rule implementation

### Adding Contrast Pairs

Edit `scripts/design-system-gate/contrast-checker.js`:

```js
const CONTRAST_PAIRS = [
  // Add new pair
  {
    text: '--ak-new-text-token',
    surface: '--ak-new-surface-token',
    type: 'normal',  // 'normal' | 'large' | 'ui'
    description: 'Description for reports'
  },
];
```

### Adding Component Allowlist

Edit `scripts/design-system-gate/eslint-plugin-component-boundary.js`:

```js
const ALLOWED_COMPONENTS = ['Button', 'Input', 'Table', 'NewComponent'];
```

---

## Troubleshooting

### "Hardcoded color detected" but I'm using a token

Check that you're using the correct syntax:
- CSS: `var(--ak-primary)`
- JS: `tokens.colors.primary` or `'var(--ak-primary)'`

### "Component not in allowlist" but it's needed

Options:
1. Add component to design-system package first
2. Add to `ALLOWED_COMPONENTS` in `eslint-plugin-component-boundary.js`
3. Request exception during refactor planning

### Contrast check failing

1. Run `pnpm run design-system:contrast` to see details
2. Check if token combination is used in UI
3. Either fix the token values or remove the combination from `CONTRAST_PAIRS`

---

## Contact

For exceptions or questions during refactor phase, discuss in PR comments or team Slack.

**Remember:** Design system rules are non-negotiable during the refactor phase. No exceptions without documented approval.
