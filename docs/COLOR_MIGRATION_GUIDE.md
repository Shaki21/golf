# Color Token Usage Guide - TIER Golf

**Design System v3.0**
**Last Updated:** 2026-01-13

---

## Overview

All colors in the TIER Golf application use CSS design tokens defined in `apps/web/src/styles/tier-tokens.css`. This ensures visual consistency, easier maintenance, and supports potential theming in the future.

**Never use hardcoded hex colors.** Always use the design tokens.

---

## Core Brand Colors

### TIER Navy (Primary Brand Color)
- **Original Design:** `#0A2540`
- **RGB:** `10 37 64`
- **CSS Variable:** `--tier-navy`
- **Usage:** Primary text, headers, backgrounds, buttons

### TIER Gold (Accent Color)
- **Original:** `#C9A227`
- **Light variant:** `#D4A53C` (hover states)
- **Dark variant:** `#B48223` (pressed states)

---

## Usage Patterns

### ✅ Preferred: Tailwind Classes

Use Tailwind utility classes whenever possible for type-safe, autocomplete-friendly styling:

```tsx
// Background colors
<div className="bg-tier-navy">...</div>
<div className="bg-tier-gold">...</div>

// Text colors
<h1 className="text-tier-navy">TIER Golf</h1>
<span className="text-tier-gold">Premium</span>

// Border colors
<div className="border-2 border-tier-navy">

// With opacity
<div className="bg-tier-navy/20 text-tier-gold/80">

// Hover states
<button className="bg-tier-navy hover:bg-tier-navy-light">
  Click me
</button>
```

### CSS Variables (When Tailwind Not Possible)

For inline styles or CSS-in-JS:

```tsx
<div style={{ backgroundColor: 'rgb(var(--tier-navy))' }}>
  Navy background
</div>

<div style={{ color: 'rgb(var(--tier-gold))' }}>
  Gold text
</div>
```

### With Opacity

Tailwind opacity modifiers work automatically:

\`\`\`tsx
<div className="bg-tier-navy/20">    {/* 20% opacity */}
<div className="text-tier-gold/50">    {/* 50% opacity */}
</div>
\`\`\`

## Available Tokens

### Primary Brand Colors

| Token | Hex | RGB | Tailwind Class | Usage |
|-------|-----|-------------|--------|
| `--tier-navy` | #0A2540 | `10 37 64` | Primary brand color, headers, text |
| `--tier-navy-light` | #0F3459 | `15 52 89` | Hover states |
| `--tier-navy-dark` | #071C30 | Pressed states |
| `--tier-gold` | #C9A227 | Premium accent |
| `--tier-gold-light` | #D4A53C | Hover on gold |
| `--tier-gold-dark` | #B48223 | Pressed gold |
| `--tier-white` | #FFFFFF | White |

### Status Colors
- `--status-success`: #059669 (Green)
- `--status-warning`: #F59E0B (Amber)
- `--status-error`: #EF4444 (Red)
- `--status-info`: #3B82F6 (Blue)

### Category Colors (A-K System)
- `--category-a` through `--category-k` for player categorization

### Badge Tier Colors
- `--tier-bronze`, `--tier-silver`, `--tier-gold-badge`, `--tier-platinum`

## Usage Patterns

### Tailwind Classes (Preferred)
```tsx
// Background
<div className="bg-tier-navy">

// Text color
<h1 className="text-tier-gold">

// Border
<div className="border-tier-navy">

// With opacity
<div className="bg-tier-navy/20">  {/* 20% opacity */}

// Hover states
<button className="bg-tier-navy hover:bg-tier-navy-light">
```

### CSS Variables (When Tailwind Not Possible)

For inline styles or dynamic values:

```tsx
<div style={{ backgroundColor: 'rgb(var(--tier-navy))' }}>
<div style={{ color: 'rgb(var(--tier-gold))' }}>
```

**With opacity:**
```typescript
<div style={{ backgroundColor: 'rgb(var(--tier-navy) / 0.5)' }}>  // 50% opacity
```

### Direct CSS Usage
```css
.my-component {
  background-color: rgb(var(--tier-navy));
  color: rgb(var(--tier-gold));
}

/* With opacity */
.my-element {
  background-color: rgb(var(--tier-navy) / 0.1); /* 10% opacity */
}
```

---

## Anti-Patterns to Avoid

### ❌ DON'T: Hardcoded Hex Colors

```tsx
// ❌ BAD - Hardcoded colors
<div style={{ color: '#0A2540', backgroundColor: '#C9A227' }}>
<Card color="#0A2540" />
<div style={{ borderColor: '#C9A227' }}>
```

### ✅ DO: Use Tailwind Classes

```tsx
// ✅ GOOD - Tailwind utility classes
<div className="text-tier-navy bg-tier-gold">
<Card className="border-tier-gold">
<Button className="bg-tier-navy hover:bg-tier-navy-light">
```

### ✅ DO: Use CSS Variables

```tsx
// When Tailwind classes aren't possible
<div style={{ backgroundColor: 'rgb(var(--tier-navy))' }}>
```

### ❌ Anti-Patterns to Avoid

```tsx
// ❌ DON'T: Hardcoded hex colors
<div style={{ color: '#0A2540' }}>

// ❌ DON'T: Dynamic color props
<Card color="#C9A227" />

// ❌ DON'T: Inline hex in className
<div className="bg-[#0A2540]">

// ✅ DO: Use Tailwind classes
<div className="bg-tier-navy text-tier-gold">

// ✅ DO: Use CSS variables when Tailwind not possible
<div style={{ color: 'rgb(var(--tier-gold))' }}>
```

---

## Common Patterns

### Buttons
```tsx
// ❌ Bad
<button style={{ backgroundColor: '#0A2540', color: '#FFFFFF' }}>

// ✅ Good
<button className="bg-tier-navy text-tier-white">
```

### Cards
```tsx
// ❌ Bad
<div style={{ borderColor: '#C9A227' }}>

// ✅ Good
<div className="border-tier-gold">
```

### Custom Components
```tsx
// ❌ Bad
<CustomCard borderColor="#0A2540" />

// ✅ Good
<CustomCard className="border-tier-navy" />
```

### Dynamic Colors
```tsx
// ❌ Bad: Hardcoded color array
const colors = ['#0A2540', '#C9A227', '#059669'];

// ✅ Good: Use CSS variables
const colors = [
  'rgb(var(--tier-navy))',
  'rgb(var(--tier-gold))',
  'rgb(var(--status-success))'
];
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Hardcode hex colors
```tsx
// Bad
<div style={{ color: '#0A2540', backgroundColor: '#C9A227' }}>
```

### ❌ Don't: Use dynamic color props
```tsx
// Bad
<Card color="#C9A227" bgColor="#0A2540" />
```

### ❌ Don't: Mix hex and tokens
```tsx
// Bad
<div className="bg-tier-navy" style={{ color: '#C9A227' }}>
```

### ✅ Do: Use design tokens consistently
```tsx
// Good
<div className="bg-tier-navy text-tier-gold">
```

### ✅ Do: Use CSS variables when Tailwind isn't available
```tsx
// Good
<svg fill="rgb(var(--tier-navy))" />
```

---

## Migration Checklist

When migrating a file:

- [ ] Run color migration script: `node scripts/migrate-colors.js <file-path>`
- [ ] Review suggested changes
- [ ] Replace className hex colors with Tailwind classes
- [ ] Replace inline style hex colors with CSS variables
- [ ] Test component renders correctly with new colors
- [ ] Verify colors match design system (#0A2540 navy, #C9A227 gold)
- [ ] Check hover/focus states use correct variants
- [ ] Ensure accessibility (WCAG AA contrast ≥4.5:1)

---

## Testing Colors

### Visual verification:
```bash
# Start dev server
pnpm dev

# Check these pages:
# - Dashboard: Navy header, gold accents
# - Logo: Correct navy/gold colors
# - Buttons: Navy background on primary, gold on hover
```

### Automated testing:
```bash
# Run color contrast audit
node scripts/migrate-colors.js apps/web/src --scan

# Should show 0 hardcoded colors after migration
```

---

## Common Patterns

### Buttons
```tsx
// Primary button
<Button className="bg-tier-navy hover:bg-tier-navy-light text-tier-white">

// Secondary button
<Button className="border-tier-navy text-tier-navy hover:bg-tier-navy/5">

// Gold accent button
<Button className="bg-tier-gold hover:bg-tier-gold-light text-tier-navy">
```

### Cards
```tsx
// Standard card
<Card className="bg-tier-white border-tier-navy/20">

// Elevated card
<Card className="bg-tier-white shadow-tier-card border-tier-navy/10">
```

### Status badges
```tsx
// Success
<Badge className="bg-status-success-light text-status-success-dark border-status-success">

// Warning
<Badge className="bg-status-warning-light text-status-warning-dark border-status-warning">
```

---

## Need Help?

- **Migration issues?** Run `node scripts/migrate-colors.js --help`
- **Color contrast issues?** Check TIER_GOLF_DESIGN_SYSTEM.md for accessible alternatives
- **Token not available?** Propose addition in design system review

---

**Last updated:** 2026-01-13
**Design System version:** v3.0
**Color palette:** Original TIER Golf (#0A2540 navy, #C9A227 gold)
