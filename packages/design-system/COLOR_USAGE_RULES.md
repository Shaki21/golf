# AK Golf Premium Light - Color Usage Rules

> **Version:** 1.0.0
> **Last Updated:** 2024-12-29

This document defines the strict usage rules for the AK Golf Premium Light color system. All components must follow these guidelines to maintain visual consistency and brand integrity.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Semantic Token Usage](#semantic-token-usage)
3. [Gold Discipline Rules](#gold-discipline-rules)
4. [Contrast Requirements](#contrast-requirements)
5. [Intent Mapping Reference](#intent-mapping-reference)
6. [Anti-Patterns](#anti-patterns)
7. [Lint Rules](#lint-rules)

---

## Core Principles

### 1. Never Use Raw Hex Values in Components

```tsx
// ❌ WRONG - Raw hex values
<div className="bg-[#1B4D3E] text-[#FFFFFF]">

// ✅ CORRECT - Semantic tokens
<div className="bg-ak-brand-primary text-ak-text-inverse">
```

### 2. Use Semantic Tokens by Intent

Colors should be chosen based on **what they represent**, not what they look like:

| Instead of thinking... | Think about... |
|------------------------|----------------|
| "I need green here" | "This is the primary brand element" |
| "I want a light gray" | "This is a secondary/muted text" |
| "Use gold for emphasis" | "Is this an earned achievement?" |

### 3. Import from Semantic Layer Only

```ts
// ❌ WRONG - Importing primitives
import { primitiveColors } from '@/tokens/colors';
const bg = primitiveColors.primary.DEFAULT;

// ✅ CORRECT - Importing semantics
import { semanticColors } from '@/tokens/colors';
const bg = semanticColors.brand.primary;
```

---

## Semantic Token Usage

### Brand Colors

| Token | Tailwind Class | Use For |
|-------|----------------|---------|
| `brand.primary` | `bg-ak-brand-primary` | Primary buttons, active states, brand accents |
| `brand.primaryHover` | `bg-ak-brand-primary-hover` | Hover states on primary elements |
| `brand.primaryMuted` | `bg-ak-brand-primary-muted` | Subtle brand backgrounds (badges, chips) |

### Surface Colors

| Token | Tailwind Class | Use For |
|-------|----------------|---------|
| `surface.base` | `bg-ak-surface-base` | App/page background |
| `surface.card` | `bg-ak-surface-card` | Card backgrounds, panels |
| `surface.elevated` | `bg-ak-surface-elevated` | Modals, dropdowns, popovers |
| `surface.subtle` | `bg-ak-surface-subtle` | Section dividers, grouped content |

### Text Colors

| Token | Tailwind Class | Use For |
|-------|----------------|---------|
| `text.primary` | `text-ak-text-primary` | Main headings, body text |
| `text.secondary` | `text-ak-text-secondary` | Secondary information |
| `text.tertiary` | `text-ak-text-tertiary` | Helper text, descriptions |
| `text.muted` | `text-ak-text-muted` | Placeholders, disabled text |
| `text.mutedMobile` | `text-ak-text-muted-mobile` | Muted text optimized for mobile (darker) |

### Status Colors

| Token | Tailwind Class | Use For |
|-------|----------------|---------|
| `status.success` | `text-ak-status-success` | Success states, positive values |
| `status.warning` | `text-ak-status-warning` | Warning states, caution |
| `status.error` | `text-ak-status-error` | Error states, destructive actions |
| `status.info` | `text-ak-status-info` | Informational states |

---

## Gold Discipline Rules

Gold is reserved for **earned achievements and exceptional states only**. Overuse dilutes its meaning and premium feel.

### Allowed Uses

| Use Case | Example | Reasoning |
|----------|---------|-----------|
| **Earned Badges** | Mastery badge, Gold tier | Player accomplished something |
| **Top Percentile** | "Top 5%" indicator | Exceptional performance |
| **Single Featured Card** | Coach's pick, featured achievement | One highlight per viewport |
| **Mastery Moments** | Level completion, milestone reached | Celebration of accomplishment |
| **Achievement Icons** | Trophy, medal, star icons | Visual reward system |

### Disallowed Uses

| Use Case | Why Not | Alternative |
|----------|---------|-------------|
| **Primary CTA Buttons** | Gold is not for actions | `bg-ak-brand-primary` |
| **Standard Progress Bars** | Not an achievement yet | `bg-ak-component-progress-fill` |
| **Long Text/Paragraphs** | Poor readability | `text-ak-text-primary` |
| **Warnings/Errors** | Semantic confusion | `text-ak-status-warning/error` |
| **Decorative Borders** | Cheapens the meaning | `border-ak-border-default` |
| **Section Headers** | Overexposure | `text-ak-text-primary` |
| **Standard Icons** | Reserve for earned items | `text-ak-text-tertiary` |

### The "One Gold" Rule

> **Maximum 1 gold element visible per viewport at any time.**

This ensures gold maintains its premium, exclusive feel. If you need to show multiple achievements, use a muted gold background (`bg-ak-achievement-gold-muted`) for secondary items.

```tsx
// ❌ WRONG - Multiple gold elements
<div className="text-ak-achievement-gold">Badge 1</div>
<div className="text-ak-achievement-gold">Badge 2</div>
<div className="text-ak-achievement-gold">Badge 3</div>

// ✅ CORRECT - One featured, others muted
<div className="text-ak-achievement-gold">Featured Badge</div>
<div className="bg-ak-achievement-gold-muted text-ak-text-secondary">Badge 2</div>
<div className="bg-ak-achievement-gold-muted text-ak-text-secondary">Badge 3</div>
```

### Gold Border Usage

Gold borders are **only** allowed for:
- The single featured achievement card
- Active/selected achievement in a list
- Earned badge containers

```tsx
// ✅ CORRECT - Featured achievement card
<div className="border-2 border-ak-achievement-gold-border bg-ak-achievement-gold-muted">
  <TrophyIcon className="text-ak-achievement-gold" />
  <span>Category A Mastery</span>
</div>
```

---

## Contrast Requirements

### Text on Backgrounds

| Background | Minimum Text Color | WCAG Level |
|------------|-------------------|------------|
| `surface.base` (#FAFBFC) | `text.tertiary` (#6B7280) | AA |
| `surface.card` (#FFFFFF) | `text.tertiary` (#6B7280) | AA |
| `brand.primary` (#1B4D3E) | `text.inverse` (#FFFFFF) | AAA |
| `status.error` (#DC2626) | `text.inverse` (#FFFFFF) | AA |

### Muted Text Rules

- Use `text.muted` (#9CA3AF) only for:
  - Placeholder text in inputs
  - Truly disabled/inactive elements
  - Timestamps and meta information

- On mobile, prefer `text.mutedMobile` (#7D8590) for better readability on smaller screens

### Large Text Exception

For text 24px+ or bold 18.5px+, you may use:
- `text.muted` on any light surface
- `text.tertiary` on elevated surfaces

---

## Intent Mapping Reference

Use this table to find the correct token for your use case:

| Intent | Token Path | Tailwind Class |
|--------|------------|----------------|
| Primary brand color | `brand.primary` | `bg-ak-brand-primary` |
| Page background | `surface.base` | `bg-ak-surface-base` |
| Card background | `surface.card` | `bg-ak-surface-card` |
| Modal background | `surface.elevated` | `bg-ak-surface-elevated` |
| Main heading | `text.primary` | `text-ak-text-primary` |
| Body copy | `text.primary` | `text-ak-text-primary` |
| Secondary label | `text.secondary` | `text-ak-text-secondary` |
| Helper text | `text.tertiary` | `text-ak-text-tertiary` |
| Placeholder | `text.muted` | `text-ak-text-muted` |
| Mobile placeholder | `text.mutedMobile` | `text-ak-text-muted-mobile` |
| Text on dark bg | `text.inverse` | `text-ak-text-inverse` |
| Card border | `border.default` | `border-ak-border` |
| Focus ring | `border.focus` | `ring-ak-border-focus` |
| Divider line | `neutral.divider` | `border-ak-neutral-divider` |
| Inactive UI element | `neutral.accent` | `bg-ak-neutral-accent` |
| Success state | `status.success` | `text-ak-status-success` |
| Error state | `status.error` | `text-ak-status-error` |
| Warning state | `status.warning` | `text-ak-status-warning` |
| Info state | `status.info` | `text-ak-status-info` |
| Earned achievement | `achievement.gold` | `text-ak-achievement-gold` |
| Achievement background | `achievement.goldMuted` | `bg-ak-achievement-gold-muted` |
| Primary button | `interactive.primaryBg` | `bg-ak-interactive-primary-bg` |
| Secondary button | `interactive.secondaryBg` | `bg-ak-interactive-secondary-bg` |
| Ghost button | `interactive.ghostBg` | `bg-ak-interactive-ghost-bg` |
| Destructive action | `interactive.destructiveBg` | `bg-ak-interactive-destructive-bg` |
| Progress bar track | `component.progressBg` | `bg-ak-component-progress-bg` |
| Progress bar fill | `component.progressFill` | `bg-ak-component-progress-fill` |
| Input background | `component.inputBg` | `bg-ak-component-input-bg` |
| Input border | `component.inputBorder` | `border-ak-component-input-border` |

---

## Anti-Patterns

### Color Hardcoding

```tsx
// ❌ ANTI-PATTERN: Inline styles with hex
<div style={{ backgroundColor: '#1B4D3E' }}>

// ❌ ANTI-PATTERN: Arbitrary Tailwind values
<div className="bg-[#1B4D3E]">

// ❌ ANTI-PATTERN: Legacy color tokens
<div className="bg-primary-500">

// ✅ CORRECT: Semantic Tailwind class
<div className="bg-ak-brand-primary">
```

### Status Color Misuse

```tsx
// ❌ ANTI-PATTERN: Using green for brand accent
<Badge className="bg-ak-status-success">Featured</Badge>

// ✅ CORRECT: Use brand for non-status purposes
<Badge className="bg-ak-brand-primary-muted text-ak-brand-primary">Featured</Badge>
```

### Gold Overuse

```tsx
// ❌ ANTI-PATTERN: Gold for standard UI
<button className="bg-ak-achievement-gold">Submit</button>
<ProgressBar fillColor="gold" value={50} />
<h2 className="text-ak-achievement-gold">Settings</h2>

// ✅ CORRECT: Gold only for achievements
<Badge className="bg-ak-achievement-gold-muted border border-ak-achievement-gold-border">
  <TrophyIcon className="text-ak-achievement-gold" />
  <span className="text-ak-text-primary">Category A Mastery</span>
</Badge>
```

### Ignoring Text Hierarchy

```tsx
// ❌ ANTI-PATTERN: Same color for all text
<h1 className="text-ak-text-primary">Title</h1>
<p className="text-ak-text-primary">Description that should be secondary</p>
<span className="text-ak-text-primary">Helper text that should be tertiary</span>

// ✅ CORRECT: Proper text hierarchy
<h1 className="text-ak-text-primary">Title</h1>
<p className="text-ak-text-secondary">Description text</p>
<span className="text-ak-text-tertiary">Helper text</span>
```

---

## Lint Rules

The `lint:colors` script enforces these rules automatically. Run it before committing:

```bash
pnpm lint:colors
```

### What Gets Flagged

1. **Raw hex values** in `.tsx`, `.jsx`, `.ts`, `.js` files:
   - `#1B4D3E`, `#FFFFFF`, etc.
   - Exception: Comments, test files

2. **Legacy color classes**:
   - `bg-primary-*`, `text-forest-*`, `bg-gold`
   - Should use `bg-ak-*`, `text-ak-*` instead

3. **Arbitrary color values**:
   - `bg-[#...]`, `text-[#...]`
   - Should use semantic tokens

4. **Direct primitive imports**:
   - `import { primitiveColors }`
   - Should use `semanticColors` instead

### Ignoring Rules

For rare exceptions (e.g., third-party integrations), use:

```tsx
// eslint-disable-next-line ak-golf/no-raw-colors
const thirdPartyColor = '#1B4D3E';
```

Or add file to `.colorlintignore`:

```
# Third-party integrations
src/integrations/legacy-charts.tsx
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  AK GOLF COLOR QUICK REFERENCE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BRAND         bg-ak-brand-primary     #1B4D3E              │
│  SURFACES      bg-ak-surface-base      #FAFBFC              │
│                bg-ak-surface-card      #FFFFFF              │
│                                                             │
│  TEXT          text-ak-text-primary    #111827              │
│                text-ak-text-secondary  #374151              │
│                text-ak-text-tertiary   #6B7280              │
│                text-ak-text-muted      #9CA3AF              │
│                                                             │
│  BORDERS       border-ak-border        #E5E7EB              │
│                border-ak-neutral-divider                    │
│                                                             │
│  STATUS        text-ak-status-success  #059669 ✓            │
│                text-ak-status-warning  #D97706 ⚠            │
│                text-ak-status-error    #DC2626 ✕            │
│                                                             │
│  GOLD          text-ak-achievement-gold #B8860B             │
│  (earned only) bg-ak-achievement-gold-muted                 │
│                                                             │
│  RULE: Max 1 gold element per viewport                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Changelog

- **1.0.0** (2024-12-29): Initial release with Gold discipline, semantic tokens, and lint rules.
