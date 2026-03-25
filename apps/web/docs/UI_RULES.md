# UI Canon Rules - AK Golf Academy

> **Status: LOCKED**
> Version: 1.0
> Last updated: 2025-12-28

This document defines the mandatory UI standards for the IUP Master V1 frontend.
All new code and modifications MUST follow these rules.

---

## 1. Allowed Primitives

Use ONLY the following UI primitives:

| Primitive | Location | Usage |
|-----------|----------|-------|
| `Card` | `components/ui/Card.jsx` | All content containers |
| `Button` | `components/ui/Button.jsx` | All interactive buttons |
| `Badge` | `components/ui/Badge.jsx` | Status indicators, tags |
| `StateCard` | `components/ui/StateCard.jsx` | Stateful content blocks |
| `PageHeader` | `components/layout/PageHeader.jsx` | Page titles and navigation |

### Import Pattern
```jsx
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
```

---

## 2. Forbidden Patterns

### 2.1 Token References
```jsx
// FORBIDDEN
tokens.colors.primary
tokens.spacing.md
designTokens.anything
```

### 2.2 Hardcoded Hex Colors
```jsx
// FORBIDDEN
style={{ color: '#10456A' }}
style={{ backgroundColor: '#EDF0F2' }}
```

### 2.3 Inline Hover States
```jsx
// FORBIDDEN
onMouseEnter={() => setHover(true)}
onMouseLeave={() => setHover(false)}
```
Use CSS classes or `Button` variants instead.

### 2.4 Direct designTokens Import
```jsx
// FORBIDDEN in features/
import { designTokens } from '../../designTokens';
```

---

## 3. Spacing Rules

### 3.1 Inside Cards
- Padding: `12px` to `16px`
- Gap between elements: `8px` to `12px`

### 3.2 Between Sections
- Gap: `24px` to `32px`
- Page margins: `16px` (mobile), `24px` (desktop)

### 3.3 CSS Variables
```css
/* Preferred */
padding: var(--spacing-4);  /* 16px */
gap: var(--spacing-6);      /* 24px */
margin: var(--spacing-8);   /* 32px */
```

---

## 4. CTA Hierarchy

### Rule: Maximum 1 Primary CTA per View

| Level | Variant | Usage |
|-------|---------|-------|
| Primary | `variant="primary"` | Main action (max 1 per view) |
| Secondary | `variant="secondary"` | Supporting actions |
| Ghost | `variant="ghost"` | Tertiary/cancel actions |
| Outline | `variant="outline"` | Alternative secondary |

### Example
```jsx
// CORRECT
<Button variant="primary">Save Changes</Button>
<Button variant="ghost">Cancel</Button>

// INCORRECT - Multiple primary CTAs
<Button variant="primary">Save</Button>
<Button variant="primary">Continue</Button>
```

---

## 5. Heading Hierarchy

| Element | Usage | Font Size |
|---------|-------|-----------|
| H1 | Page title only | 28-34px |
| H2 | Section headers | 20-24px |
| H3 | Card titles | 16-18px |
| H4 | Subsection labels | 14-16px |

### Rule: One H1 per Page
Use `PageHeader` component for the main title.

---

## 6. Badge/Accent Usage

### Rule: Minimal Visual Competition

- Max 3 badges per card
- Avoid multiple accent colors in same view
- Use neutral variants for informational badges
- Reserve `success`, `warning`, `error` for actual status

---

## 7. Mobile Requirements

### Touch Targets
- Minimum: `44px x 44px`
- Recommended: `48px x 48px`

### Primary CTA Visibility
- Must be visible without scrolling on initial load
- Fixed bottom positioning for critical actions

---

## 8. Enforcement

This ruleset is enforced by:
1. Pre-commit script: `scripts/check-ui-canon.sh`
2. Code review checklist
3. Build-time validation

Violations will fail the build.

---

## 9. Exceptions

Exceptions require:
1. Written justification in PR description
2. Approval from design lead
3. Documented in this file under "Approved Exceptions"

### Approved Exceptions
*None currently.*

---

## Changelog

- **v1.1** (2025-12-28): UiCanon locked - polish complete
  - All hardcoded hex colors replaced with semantic CSS variables
  - StateCard used consistently for loading/empty/error states
  - UiCanon enforcement script passes with zero violations
- **v1.0** (2025-12-28): Initial lock
