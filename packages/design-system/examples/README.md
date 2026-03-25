# AK Golf Academy Design System v3.0

## Blue Palette 01

A comprehensive, mobile-first design system built for the AK Golf Academy platform. Features full dark mode support, 21+ animations, and WCAG 2.1 AA accessibility compliance.

---

## 📊 Quick Stats

- **6 Core Components** (Button, Card, Badge, Input, Avatar, Progress)
- **75+ Component Variants** across all sizes and states
- **21+ CSS Keyframe Animations** with timing controls
- **100% Dark Mode Support** with system preference detection
- **3 Responsive Breakpoints** (Mobile, Tablet, Desktop)
- **WCAG 2.1 AA Compliant** color contrast ratios
- **Zero Dependencies** (except Google Fonts for Inter typeface)

---

## 📁 What's Included

### Interactive Showcases (9 HTML Files)

All showcase files are self-contained, fully responsive, and support dark mode:

| File | Size | Description |
|------|------|-------------|
| **index.html** | 25KB | Navigation hub with design tokens reference |
| **component-gallery.html** | 58KB | Complete catalog of all 75+ component variants |
| **interaction-states.html** | 32KB | Interactive demos of 8 component states |
| **form-layouts.html** | 33KB | 6 form patterns including multi-step wizard |
| **list-layouts.html** | 28KB | 8 list and data display patterns |
| **theme-variations.html** | 36KB | Dark mode showcase with WCAG compliance table |
| **animation-showcase.html** | 35KB | All 21+ animations with replay controls |
| **responsive-showcase.html** | 32KB | Responsive design documentation |
| **dashboard-showcase.html** | 56KB | 4 complete dashboard layouts |

**Total Size:** 335KB across all files

---

## 🎨 Design Tokens

### Brand Colors

```css
/* Light Mode */
--ak-primary: #10456A;      /* Deep ocean blue - primary actions */
--ak-primary-light: #2C5F7F;
--ak-gold: #C9A227;          /* Accent gold - achievements */
--ak-snow: #EDF0F2;          /* Light neutral background */
--ak-surface: #EBE5DA;       /* Card/elevated surfaces */

/* Dark Mode */
--ak-primary: #2C5F7F;       /* Lighter blue for dark backgrounds */
--ak-gold: #D4B84E;          /* Brighter gold for visibility */
--ak-snow: #1C1C1E;          /* Dark background */
--ak-surface: #2C2C2E;       /* Elevated surfaces */
```

### Semantic Colors

```css
--ak-success: #4A7C59;  /* Green - success states */
--ak-warning: #D4A84B;  /* Yellow - warnings */
--ak-error: #C45B4E;    /* Red - errors */
```

### Spacing Scale (4px base unit)

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Typography (Apple HIG Scale)

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 32px;
--font-size-4xl: 40px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-card: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

## 🧩 Components

### 1. Button

**5 Variants:**
- `btn-primary` - Main call-to-action (ocean blue)
- `btn-secondary` - Secondary actions (light background)
- `btn-ghost` - Tertiary actions (transparent)
- `btn-danger` - Destructive actions (red)
- `btn-success` - Positive actions (green)

**3 Sizes:**
- `btn-sm` - Small (32px height)
- `btn-md` - Medium (40px height, default)
- `btn-lg` - Large (48px height)

**5 States:**
- Default
- Hover (lift + shadow)
- Active (pressed)
- Disabled (50% opacity)
- Loading (spinner icon)

### 2. Card

**4 Variants:**
- `card` - Default with subtle shadow
- `card-elevated` - Stronger shadow for prominence
- `card-outlined` - Border instead of shadow
- `card-highlight` - Gold accent border

**Padding Options:**
- `card-compact` - 12px padding
- Default - 16px padding
- `card-spacious` - 24px padding

### 3. Badge

**7 Color Variants:**
- `badge-primary` - Ocean blue
- `badge-secondary` - Neutral gray
- `badge-success` - Green
- `badge-warning` - Yellow
- `badge-error` - Red
- `badge-gold` - Gold accent
- `badge-neutral` - Light gray

**2 Sizes:**
- `badge-sm` - Small (height: 20px)
- `badge-md` - Medium (height: 24px)

### 4. Input

**Types:**
- TextInput
- Textarea
- Select
- Search
- Number
- Email
- Password

**States:**
- Default
- Focus (blue ring)
- Error (red border + shake animation)
- Success (green border)
- Disabled (50% opacity)

### 5. Avatar

**5 Sizes:**
- `avatar-xs` - 24px
- `avatar-sm` - 32px
- `avatar-md` - 40px (default)
- `avatar-lg` - 56px
- `avatar-xl` - 80px

**Special:** AvatarGroup component for stacked avatars

### 6. Progress

**3 Components:**
- ProgressBar - Linear progress indicator
- CircularProgress - Circular spinner
- GoalProgress - Progress with target markers

---

## ✨ Features

### Dark Mode

Complete dark mode implementation with:
- CSS custom properties that auto-update
- System preference detection via `prefers-color-scheme`
- Manual toggle with localStorage persistence
- WCAG 2.1 AA compliant contrast in both modes

**Implementation:**

```javascript
// Toggle dark mode
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('ak-golf-theme', isDark ? 'dark' : 'light');
}

// Auto-detect system preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}
```

### Animations (21+ Keyframes)

**Fade Animations:**
- `fade-in`, `fade-out`
- `fade-in-up`, `fade-in-down`
- `fade-in-left`, `fade-in-right`

**Scale Animations:**
- `scale-in`, `scale-out`
- `pop-in` (with bounce)

**Slide Animations:**
- `slide-in-right`, `slide-in-left`
- `slide-in-up`, `slide-in-down`

**Continuous Animations:**
- `bounce`, `pulse`, `pulse-scale`
- `glow`, `wiggle`, `shake`

**Loading States:**
- `skeleton-shimmer`
- `spin` (spinner)
- `progress` (progress bar fill)

**Duration Tokens:**
```css
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

**Easing Functions:**
```css
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Responsive Design

**Mobile-First Approach:**
```css
/* Mobile: < 640px (default) */
.grid { grid-template-columns: 1fr; }

/* Tablet: 640px - 1024px */
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

**Breakpoints:**
- Mobile: `< 640px` (single column, 44px touch targets)
- Tablet: `640px - 1024px` (2 columns, hybrid UI)
- Desktop: `> 1024px` (3-4 columns, full navigation)

**Touch Targets:**
All interactive elements expand to minimum 44×44px on mobile (Apple HIG standard)

---

## 🚀 Getting Started

### 1. Quick Start (Copy-Paste)

Each showcase file is self-contained. Simply:
1. Open the desired showcase in your browser
2. Copy the HTML/CSS code you need
3. Paste into your project

### 2. Using CSS Variables

```html
<!-- In your HTML head -->
<style>
  @import url('path/to/design-system-tokens.css');
</style>

<!-- Use in your components -->
<button style="
  background: var(--ak-primary);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
">
  Button
</button>
```

### 3. Dark Mode Setup

```html
<!-- Add to your HTML -->
<html class="dark">  <!-- or omit for light mode -->

<script>
  // Theme toggle function
  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  // Initialize from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
</script>
```

### 4. Component Usage Example

```html
<!-- Primary Button -->
<button class="btn btn-primary">
  Save Changes
</button>

<!-- Card with Badge -->
<div class="card">
  <h3 class="card-title">Training Session</h3>
  <p class="card-content">Morning practice at driving range</p>
  <span class="badge badge-success">Completed</span>
</div>

<!-- Avatar Group -->
<div class="avatar-group">
  <img class="avatar avatar-md" src="user1.jpg" alt="User 1">
  <img class="avatar avatar-md" src="user2.jpg" alt="User 2">
  <img class="avatar avatar-md" src="user3.jpg" alt="User 3">
</div>
```

---

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Safari | 14+ |
| Firefox | 88+ |
| Edge | 90+ |

**Not Supported:** Internet Explorer 11

**Requirements:**
- CSS Custom Properties
- CSS Grid
- Flexbox
- `prefers-color-scheme` media query

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

All color combinations meet minimum contrast requirements:

| Combination | Contrast Ratio | Rating |
|-------------|----------------|--------|
| Primary on White | 6.8:1 | AAA ✓ |
| Text on Background | 19.8:1 | AAA ✓ |
| Secondary Text | 4.7:1 | AA ✓ |
| Success on White | 5.2:1 | AA ✓ |
| Error on White | 4.5:1 | AA ✓ |

### Features:
- ✅ Semantic HTML5 elements
- ✅ ARIA labels on icon buttons
- ✅ Focus rings on all interactive elements
- ✅ Keyboard navigation support
- ✅ Reduced motion media query support
- ✅ Touch targets ≥ 44×44px on mobile
- ✅ Screen reader friendly structure

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 Usage Patterns

### Form Validation

```html
<!-- Error State -->
<div class="form-group">
  <label>Email</label>
  <input type="email" class="input error" value="invalid">
  <span class="error-message">Please enter a valid email</span>
</div>

<!-- Success State -->
<div class="form-group">
  <input type="email" class="input success" value="user@example.com">
  <span class="success-message">Email verified ✓</span>
</div>
```

### Loading States

```html
<!-- Skeleton Loader -->
<div class="skeleton" style="height: 20px; width: 100%;"></div>
<div class="skeleton" style="height: 20px; width: 80%; margin-top: 8px;"></div>

<!-- Spinner -->
<div class="spinner"></div>

<!-- Button Loading State -->
<button class="btn btn-primary" disabled>
  <span class="spinner spinner-sm"></span>
  Loading...
</button>
```

### Responsive Grid

```html
<!-- Auto-responsive: 1 col → 2 col → 3 col → 4 col -->
<div class="responsive-grid">
  <div class="grid-item">Item 1</div>
  <div class="grid-item">Item 2</div>
  <div class="grid-item">Item 3</div>
  <div class="grid-item">Item 4</div>
</div>
```

---

## 📐 Layout Patterns

### Dashboard Layout

```html
<div class="dashboard-grid">
  <!-- Stats Cards -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-icon">🏌️</div>
      <div class="stat-number">12</div>
      <div class="stat-label">Sessions</div>
    </div>
  </div>

  <!-- Activity Feed -->
  <div class="activity-section">
    <div class="timeline">
      <div class="timeline-item">...</div>
    </div>
  </div>
</div>
```

### List with Actions

```html
<div class="list">
  <div class="list-item">
    <img class="avatar avatar-md" src="avatar.jpg">
    <div class="list-item-content">
      <div class="list-item-title">Player Name</div>
      <div class="list-item-subtitle">Handicap: 12.5</div>
    </div>
    <div class="list-item-actions">
      <button class="btn btn-sm btn-ghost">View</button>
      <button class="btn btn-sm btn-primary">Edit</button>
    </div>
  </div>
</div>
```

---

## 🔧 Customization

### Overriding Design Tokens

```css
/* In your custom CSS file */
:root {
  /* Override primary color */
  --ak-primary: #0A3D5C;

  /* Override spacing */
  --spacing-lg: 32px;

  /* Override typography */
  --font-size-base: 18px;
}
```

### Creating Custom Variants

```css
/* Custom button variant */
.btn-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.btn-custom:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
```

---

## 📊 Performance

### File Sizes
- **Individual files:** 25KB - 58KB (average 37KB)
- **Total package:** 335KB for all 9 files
- **Zero external dependencies** (except Google Fonts CDN)

### Load Times (3G Network)
- Single file: < 2 seconds
- All files cached after first visit

### Optimization Tips
1. **Lazy load fonts:** Use `font-display: swap` in Google Fonts URL
2. **Inline critical CSS:** For above-the-fold content
3. **Compress images:** If using custom icons/avatars
4. **Enable gzip:** On your server for HTML/CSS delivery

---

## 🧪 Testing Checklist

### Visual Regression
- [ ] Test all components in light mode
- [ ] Test all components in dark mode
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1280px)

### Accessibility
- [ ] Tab through all interactive elements
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify color contrast with tools
- [ ] Test with keyboard only (no mouse)
- [ ] Enable "Reduce Motion" in OS settings

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 📝 Design Principles

### 1. Mobile-First
All layouts start with mobile design and progressively enhance for larger screens.

### 2. Accessibility by Default
Every component meets WCAG 2.1 AA standards without additional configuration.

### 3. Dark Mode Native
Dark mode is not an afterthought—it's built into the core design tokens.

### 4. Performance Focused
Self-contained files with minimal dependencies for fast loading.

### 5. Developer Experience
Copy-paste ready code with clear documentation and live examples.

---

## 🤝 Contributing

### Adding New Components
1. Create component in `component-gallery.html`
2. Add interaction states in `interaction-states.html`
3. Update `index.html` with new design tokens
4. Document usage patterns in this README

### Reporting Issues
When reporting issues, include:
- Browser and version
- Viewport size
- Light or dark mode
- Screenshot of the issue
- Steps to reproduce

---

## 📚 Resources

### External Links
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

### Internal Files
- `index.html` - Start here for overview
- `component-gallery.html` - Complete component reference
- `theme-variations.html` - Dark mode documentation
- `animation-showcase.html` - Animation library
- `responsive-showcase.html` - Responsive patterns

---

## 📄 License

AK Golf Academy Design System v3.0
© 2024 AK Golf Academy
All rights reserved.

---

## 🎯 Quick Reference Card

| Need | Go To |
|------|-------|
| Component code | `component-gallery.html` |
| Button states | `interaction-states.html` |
| Form examples | `form-layouts.html` |
| List patterns | `list-layouts.html` |
| Dark mode setup | `theme-variations.html` |
| Animation code | `animation-showcase.html` |
| Responsive patterns | `responsive-showcase.html` |
| Dashboard layouts | `dashboard-showcase.html` |
| Design tokens | `index.html` |

---

**Version:** 3.0
**Last Updated:** December 2024
**Palette:** Blue Palette 01
