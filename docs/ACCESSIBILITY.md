# TIER Golf - Accessibility Guidelines

## Color Contrast Standards

### WCAG AA Compliance
All text must meet WCAG AA contrast requirements:
- **Normal text** (< 18pt): 4.5:1 minimum
- **Large text** (≥ 18pt bold or ≥ 24pt regular): 3:1 minimum

### Tier Color Usage

#### Navy (#0A2540)
- **Contrast on white**: ~15:1 ✅ (Exceeds AAA)
- **Usage**: Primary text, headings, UI elements
- **Safe for**: All text sizes

#### Gold (#C9A227)
- **Contrast on white**: ~2.6:1 ❌ (Fails WCAG AA for small text)
- **Contrast on navy**: ~5.8:1 ✅ (Passes WCAG AA)
- **Usage restrictions**:
  - ✅ Icons and decorative elements (no contrast requirement)
  - ✅ Large text only (18pt+ bold, 24pt+ regular)
  - ✅ Non-critical accent text
  - ✅ Backgrounds with sufficient opacity (bg-tier-gold/10)
  - ❌ Small body text on white backgrounds

#### Approved Gold Text Patterns
```tsx
// ✅ GOOD - Large text
<h2 className="text-3xl font-bold text-tier-gold">Headline</h2>

// ✅ GOOD - Icon (no contrast requirement)
<Trophy className="text-tier-gold" size={24} />

// ✅ GOOD - Badge with gold background
<span className="px-2 py-1 bg-tier-gold/10 text-tier-gold-dark rounded">
  Badge
</span>

// ✅ GOOD - On navy background
<div className="bg-tier-navy">
  <span className="text-tier-gold">Accent text</span>
</div>

// ❌ BAD - Small text on white
<p className="text-sm text-tier-gold">This fails contrast</p>

// ✅ FIXED - Use navy for small text
<p className="text-sm text-tier-navy">This passes contrast</p>
```

## ARIA Labels

### Icon-Only Buttons
All buttons without visible text must have `aria-label`:

```tsx
// ❌ BAD
<button onClick={handleDelete}>
  <Trash2 size={18} />
</button>

// ✅ GOOD
<button onClick={handleDelete} aria-label="Delete item">
  <Trash2 size={18} />
</button>
```

### Form Inputs
All inputs must have associated labels:

```tsx
// ❌ BAD
<input type="text" placeholder="Name" />

// ✅ GOOD
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ ALSO GOOD - aria-label for floating labels
<input type="text" aria-label="Name" placeholder="Name" />
```

### Loading States
Loading indicators must be announced:

```tsx
// ✅ GOOD
<div role="status" aria-live="polite" aria-label="Loading content">
  <Loader2 className="animate-spin" />
  <span className="sr-only">Loading...</span>
</div>
```

## Screen Reader Support

### Skip Links
Main content should be skippable:

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* content */}
</main>
```

### Semantic HTML
- Use `<nav>` for navigation
- Use `<main>` for primary content
- Use `<header>`, `<footer>`, `<aside>` appropriately
- Use proper heading hierarchy (h1 → h2 → h3)

## Keyboard Navigation

### Focus Indicators
All interactive elements must show focus:

```css
/* Already implemented in tier-tokens.css */
:focus-visible {
  outline: 2px solid rgb(var(--tier-navy));
  outline-offset: 2px;
}
```

### Tab Order
- Use `tabIndex={0}` for custom interactive elements
- Use `tabIndex={-1}` to remove from tab order
- Never use `tabIndex > 0`

## Testing Checklist

### Manual Tests
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Verify all interactive elements are focusable
- [ ] Check color contrast with browser devtools
- [ ] Test with 200% zoom
- [ ] Test with system dark mode

### Automated Tests
```bash
# Run axe-core accessibility tests
npm run test:a11y

# Check color contrast
npm run audit:contrast
```

## Common Patterns

### Loading Skeleton
```tsx
<div className="bg-tier-navy/10 animate-pulse rounded" aria-hidden="true" />
```

### Error Messages
```tsx
<div role="alert" className="text-tier-error">
  {errorMessage}
</div>
```

### Success Messages
```tsx
<div role="status" aria-live="polite" className="text-tier-success">
  {successMessage}
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
