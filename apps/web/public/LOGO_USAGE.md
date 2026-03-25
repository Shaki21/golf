# TIER Golf Logo Usage Guide

## Logo Files

All logo files are located in `/apps/web/public/` for easy access.

### Available Files

| File | Size | Use Case |
|------|------|----------|
| `tier-golf-logo.svg` | 180×48px | **Primary logo** - Use on light backgrounds |
| `tier-golf-logo-white.svg` | 180×48px | **White version** - Use on dark backgrounds (Navy/dark blue) |
| `tier-golf-icon.svg` | 48×48px | **App icon** - Standalone icon for light backgrounds |
| `tier-golf-icon-white.svg` | 48×48px | **White icon** - Standalone icon for dark backgrounds |
| `favicon.svg` | 32×32px | **Favicon** - Browser tab icon (optimized size) |

## Logo Design

### Concept
The TIER Golf logo features **three vertical bars** (tier bars) representing:
- **Progressive heights** = ascending through golf categories (A-K system)
- **Gold gradient** = bars fade from solid to transparent (opacity 1.0 → 0.7 → 0.4)
- **Visual rhythm** = creates dynamic progression effect

### Design Elements
```
TIER  |||  GOLF
      ↑
   tier bars
   (ascending heights)
```

### Colors Used
- **Text (TIER/GOLF)**: TIER Navy `#0A2540` (light bg) / White `#FFFFFF` (dark bg)
- **Tier Bars**: TIER Gold `#C9A227` (light bg) / Gold Light `#D4B545` (dark bg)
- **Bar Opacity**: 100%, 70%, 40% (creates gradient effect)

### Typography
- **TIER** text: DM Sans Bold (700)
- **Golf** text: DM Sans Regular (400)
- **Tagline**: Inter Regular (400) - "RISE THROUGH THE RANKS"

## Usage Guidelines

### Minimum Sizes

| Format | Minimum Width |
|--------|---------------|
| Full logo | 120px |
| Icon only | 24px |
| Favicon | 16px (browser default) |

### Clear Space

**Minimum clear space around logo** = height of the "T" in TIER

Example:
```
[Clear Space]
    TIER Golf
[Clear Space]
```

### Do's ✅

✅ Use on appropriate backgrounds (light logo on light bg, white logo on dark bg)
✅ Maintain aspect ratio when scaling
✅ Keep clear space around logo
✅ Use SVG format for web (scalable, crisp)

### Don'ts ❌

❌ Do NOT stretch or distort
❌ Do NOT change colors
❌ Do NOT add effects (shadows, gradients, glows)
❌ Do NOT rotate
❌ Do NOT place on busy/patterned backgrounds
❌ Do NOT use low-resolution versions when scalable SVG is available

## Code Examples

### React Component (Logo)

```jsx
// Light background
<img
  src="/tier-golf-logo.svg"
  alt="TIER Golf"
  width={180}
  height={48}
/>

// Dark background
<img
  src="/tier-golf-logo-white.svg"
  alt="TIER Golf"
  width={180}
  height={48}
/>
```

### React Component (Icon only)

```jsx
// Light background
<img
  src="/tier-golf-icon.svg"
  alt="TIER Golf"
  width={48}
  height={48}
/>

// Dark background
<img
  src="/tier-golf-icon-white.svg"
  alt="TIER Golf"
  width={48}
  height={48}
/>
```

### HTML (Favicon)

```html
<!-- Add to <head> in index.html -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

### CSS Background

```css
/* Logo as background */
.logo {
  background-image: url('/tier-golf-logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 180px;
  height: 48px;
}

/* Icon as background */
.icon {
  background-image: url('/tier-golf-icon.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 48px;
  height: 48px;
}
```

## Logo Variations

### Full Logo (with tagline)
**File**: `tier-golf-logo.svg`
**Includes**: Icon + TIER + Golf + "RISE THROUGH THE RANKS"
**Best for**: Headers, landing pages, marketing materials

### Icon Only
**File**: `tier-golf-icon.svg`
**Includes**: Stacked pyramid icon only
**Best for**: App icons, favicons, small spaces, social media avatars

## Color Combinations

### Recommended Background Colors

| Logo Version | Background Colors |
|--------------|-------------------|
| Navy logo | White, Light gray (#F8FAFC), Cream (#EDF0F2) |
| White logo | Navy (#0A2540), Dark Navy (#061829), Dark backgrounds |

### Avoid
- Navy logo on dark backgrounds (poor contrast)
- White logo on light backgrounds (invisible)
- Logo on bright colors (yellow, red, green)

## File Formats

### SVG (Scalable Vector Graphics)
**Use for**: Web, digital displays, apps
**Advantages**: Infinite scaling, small file size, crisp at any size
**When**: Default choice for all digital use

### PNG (Future addition)
**Use for**: Emails, presentations, documents
**Sizes needed**:
- Logo: 360×96px (2x), 720×192px (3x)
- Icon: 96×96px (2x), 192×192px (3x)

## Brand Consistency

Always use official logo files. Do not recreate or modify the logo. If you need a different size or format, contact the design team.

**Version**: 1.0.0
**Last updated**: January 2026
**Design system**: TIER Golf Design System v1.0
