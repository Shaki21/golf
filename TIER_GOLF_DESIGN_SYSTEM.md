# TIER Golf Design System
## Complete Implementation Guide for Developers

**Version:** 1.0.0
**Last updated:** January 2025
**Platform:** IUP Golf / TIER Golf

---

## 1. BRAND OVERVIEW

### 1.1 Positioning

**Brand name:** TIER Golf
**Tagline:** "Rise Through the Ranks"
**Positioning:** For ambitious golfers who want to climb through the category system

**Brand promise:**
TIER Golf is the definitive platform for systematic player development. We combine the Norwegian Golf Federation's official category system (A-K) with modern technology to give each player a clear path to their potential.

**Name meaning:**
"TIER" refers directly to the category/level system (A-K) that is the core of the platform. It communicates progression, ranking, and systematic development.

### 1.2 Design Principles

1. **Clarity First** – Information should be immediately understandable
2. **Progress Visible** – Progress should always be visible and motivating
3. **Premium Feel** – Quality feel in every interaction
4. **Data-Driven** – Visualize data in a meaningful way
5. **Accessible** – Works for all user levels

### 1.3 Target Audiences

| User role | Primary need | Design focus |
|-----------|--------------|--------------|
| **Player** (12-25 years) | Motivation, progress | Gamification, badges, streaks |
| **Coach** | Overview, efficiency | Dashboard, quick actions |
| **Admin** | Control, reports | Data tables, analytics |

---

## 2. COLOR PALETTE

### 2.1 Primary Colors

```css
:root {
  /* Main colors */
  --tier-navy: #0A2540;             /* Primary - text, backgrounds */
  --tier-navy-light: #0D3050;       /* Hover states, secondary */
  --tier-navy-dark: #061829;        /* Pressed states */

  --tier-white: #FFFFFF;            /* Background, text on dark */
  --tier-gold: #C9A227;             /* Accent, premium, CTA */
  --tier-gold-light: #D4B545;       /* Hover on gold */
  --tier-gold-dark: #A8871F;        /* Pressed on gold */
}
```

### 2.2 Background Colors

```css
:root {
  /* Surfaces */
  --surface-primary: #FFFFFF;       /* Main background */
  --surface-secondary: #F8FAFC;     /* Secondary background, cards */
  --surface-tertiary: #EDF0F2;      /* Subtle background */
  --surface-elevated: #FFFFFF;      /* Elevated cards */

  /* Dark mode surfaces */
  --surface-dark-primary: #0A2540;
  --surface-dark-secondary: #0D3050;
  --surface-dark-tertiary: #112D4E;
  --surface-dark-elevated: #153555;
}
```

### 2.3 Text Colors

```css
:root {
  /* Light mode text */
  --text-primary: #0A2540;          /* Main text */
  --text-secondary: #475569;        /* Secondary text */
  --text-tertiary: #64748B;         /* Helper text */
  --text-muted: #94A3B8;            /* Disabled/placeholder */
  --text-inverse: #FFFFFF;          /* Text on dark background */

  /* Dark mode text */
  --text-dark-primary: #F8FAFC;
  --text-dark-secondary: #CBD5E1;
  --text-dark-tertiary: #94A3B8;
  --text-dark-muted: #64748B;
}
```

### 2.4 Status Colors

```css
:root {
  /* Semantic colors */
  --color-success: #16A34A;         /* Green - passed, completed */
  --color-success-light: #DCFCE7;   /* Success background */
  --color-success-dark: #15803D;    /* Success dark */

  --color-warning: #D97706;         /* Orange - warning, attention */
  --color-warning-light: #FEF3C7;   /* Warning background */
  --color-warning-dark: #B45309;    /* Warning dark */

  --color-error: #DC2626;           /* Red - error, not passed */
  --color-error-light: #FEE2E2;     /* Error background */
  --color-error-dark: #B91C1C;      /* Error dark */

  --color-info: #2563EB;            /* Blue - information */
  --color-info-light: #DBEAFE;      /* Info background */
  --color-info-dark: #1D4ED8;       /* Info dark */
}
```

### 2.5 Category Colors (A-K System)

```css
:root {
  /* Elite levels (A-C) - Gold/Premium tones */
  --category-a: #C9A227;            /* Gold - Tour/Elite */
  --category-a-bg: #FDF6E3;
  --category-b: #B8960F;            /* Dark gold - National team */
  --category-b-bg: #FDF6E3;
  --category-c: #A68A00;            /* Bronze-gold - High national */
  --category-c-bg: #FEF9E7;

  /* National level (D-E) - Silver/Steel tones */
  --category-d: #64748B;            /* Silver - National */
  --category-d-bg: #F1F5F9;
  --category-e: #475569;            /* Steel - Regional top */
  --category-e-bg: #F1F5F9;

  /* Regional level (F-G) - Blue tones */
  --category-f: #2563EB;            /* Blue - Regional */
  --category-f-bg: #EFF6FF;
  --category-g: #3B82F6;            /* Light blue - Club high */
  --category-g-bg: #EFF6FF;

  /* Club level (H-I) - Green tones */
  --category-h: #16A34A;            /* Green - Club medium */
  --category-h-bg: #F0FDF4;
  --category-i: #22C55E;            /* Light green - Club low */
  --category-i-bg: #F0FDF4;

  /* Development level (J-K) - Purple tones */
  --category-j: #7C3AED;            /* Purple - Development player */
  --category-j-bg: #F5F3FF;
  --category-k: #8B5CF6;            /* Light purple - Beginner */
  --category-k-bg: #F5F3FF;
}
```

### 2.6 Badge Tier Colors

```css
:root {
  /* Badge levels */
  --tier-bronze: #B08D57;           /* Bronze */
  --tier-bronze-bg: #FDF8F3;
  --tier-bronze-border: #D4A574;

  --tier-silver: #8A9BA8;           /* Silver */
  --tier-silver-bg: #F5F7F9;
  --tier-silver-border: #A8B5C2;

  --tier-gold: #C9A227;             /* Gold */
  --tier-gold-bg: #FDF6E3;
  --tier-gold-border: #DDB93D;

  --tier-platinum: #E5E4E2;         /* Platinum */
  --tier-platinum-bg: #FAFAFA;
  --tier-platinum-border: #D1D5DB;
}
```

### 2.7 Grayscale

```css
:root {
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  --gray-950: #030712;
}
```

---

## 3. TYPOGRAFI

### 3.1 Font Families

```css
:root {
  /* Primary font - UI and body text */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Display font - Headings and logo */
  --font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Mono font - Code and numbers */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

### 3.2 Type Scale

```css
:root {
  /* Font sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  --text-7xl: 4.5rem;      /* 72px */
}
```

### 3.3 Font Weights

```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### 3.4 Line Heights

```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### 3.5 Letter Spacing

```css
:root {
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### 3.6 Typography Usage

| Element | Font | Size | Weight | Line height | Letter Spacing |
|---------|------|-----------|------|------------|----------------|
| **H1** | DM Sans | 48px (3rem) | 700 | 1.1 | -0.025em |
| **H2** | DM Sans | 36px (2.25rem) | 700 | 1.2 | -0.025em |
| **H3** | DM Sans | 30px (1.875rem) | 600 | 1.25 | -0.02em |
| **H4** | DM Sans | 24px (1.5rem) | 600 | 1.3 | -0.01em |
| **Body Large** | Inter | 18px (1.125rem) | 400 | 1.6 | 0 |
| **Body** | Inter | 16px (1rem) | 400 | 1.5 | 0 |
| **Body Small** | Inter | 14px (0.875rem) | 400 | 1.5 | 0 |
| **Caption** | Inter | 12px (0.75rem) | 400 | 1.4 | 0.01em |
| **Label** | Inter | 14px (0.875rem) | 500 | 1.4 | 0.01em |
| **Button** | Inter | 14-16px | 600 | 1 | 0.025em |
| **Overline** | Inter | 12px (0.75rem) | 600 | 1.4 | 0.1em |

---

## 4. SPACING SYSTEM

### 4.1 Base Unit

Base unit: **4px**

### 4.2 Spacing Scale

```css
:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1.5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2.5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3.5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-28: 7rem;        /* 112px */
  --space-32: 8rem;        /* 128px */
}
```

### 4.3 Semantic Spacing

```css
:root {
  /* Component internal spacing */
  --spacing-xs: var(--space-1);     /* 4px - tight */
  --spacing-sm: var(--space-2);     /* 8px - compact */
  --spacing-md: var(--space-4);     /* 16px - default */
  --spacing-lg: var(--space-6);     /* 24px - comfortable */
  --spacing-xl: var(--space-8);     /* 32px - spacious */
  --spacing-2xl: var(--space-12);   /* 48px - section */
  --spacing-3xl: var(--space-16);   /* 64px - page section */
}
```

### 4.4 Container Padding

```css
:root {
  /* Mobile */
  --container-padding-mobile: var(--space-4);    /* 16px */
  
  /* Tablet */
  --container-padding-tablet: var(--space-6);    /* 24px */
  
  /* Desktop */
  --container-padding-desktop: var(--space-8);   /* 32px */
}
```

### 4.5 Card Padding

```css
:root {
  --card-padding-sm: var(--space-3);    /* 12px */
  --card-padding-md: var(--space-4);    /* 16px */
  --card-padding-lg: var(--space-6);    /* 24px */
}
```

---

## 5. BORDER & RADIUS

### 5.1 Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;   /* Pill/Circle */
}
```

### 5.2 Border Width

```css
:root {
  --border-0: 0;
  --border-1: 1px;
  --border-2: 2px;
  --border-4: 4px;
  --border-8: 8px;
}
```

### 5.3 Border Colors

```css
:root {
  --border-default: var(--gray-200);
  --border-strong: var(--gray-300);
  --border-subtle: var(--gray-100);
  --border-focus: var(--tier-navy);
  --border-error: var(--color-error);
  --border-success: var(--color-success);
}
```

---

## 6. SHADOWS

### 6.1 Box Shadows

```css
:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-none: 0 0 #0000;
}
```

### 6.2 Semantic Shadows

```css
:root {
  /* Components */
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-md);
  --shadow-dropdown: var(--shadow-lg);
  --shadow-modal: var(--shadow-xl);
  --shadow-toast: var(--shadow-lg);
  
  /* Colored shadows */
  --shadow-gold: 0 4px 14px 0 rgb(201 162 39 / 0.25);
  --shadow-navy: 0 4px 14px 0 rgb(10 37 64 / 0.15);
}
```

### 6.3 Inner Shadows

```css
:root {
  --shadow-inner-sm: inset 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-inner-md: inset 0 2px 4px 0 rgb(0 0 0 / 0.1);
}
```

---

## 7. BREAKPOINTS & LAYOUT

### 7.1 Breakpoints

```css
:root {
  --breakpoint-xs: 375px;   /* Small phones */
  --breakpoint-sm: 640px;   /* Large phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large desktops */
}
```

### 7.2 Media Queries (CSS)

```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 7.3 Container Widths

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```

### 7.4 Z-Index Scale

```css
:root {
  --z-0: 0;
  --z-10: 10;         /* Elevated content */
  --z-20: 20;         /* Dropdowns */
  --z-30: 30;         /* Fixed headers */
  --z-40: 40;         /* Overlays */
  --z-50: 50;         /* Modals */
  --z-60: 60;         /* Popovers over modals */
  --z-70: 70;         /* Tooltips */
  --z-80: 80;         /* Toasts */
  --z-90: 90;         /* Maximum priority */
  --z-100: 100;       /* Debug/Dev tools */
}
```

---

## 8. ANIMATIONS

### 8.1 Timing Functions

```css
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 8.2 Durations

```css
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### 8.3 Standard Transitions

```css
:root {
  --transition-colors: color, background-color, border-color, text-decoration-color, fill, stroke;
  --transition-opacity: opacity;
  --transition-shadow: box-shadow;
  --transition-transform: transform;
  --transition-all: all;
}

/* Utility classes */
.transition-base {
  transition-property: var(--transition-colors), var(--transition-opacity), var(--transition-shadow);
  transition-duration: var(--duration-150);
  transition-timing-function: var(--ease-in-out);
}

.transition-transform {
  transition-property: var(--transition-transform);
  transition-duration: var(--duration-200);
  transition-timing-function: var(--ease-out);
}
```

### 8.4 Keyframe Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade Out */
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide Down */
@keyframes slideDown {
  from { 
    opacity: 0;
    transform: translateY(-10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { 
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% { 
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* Badge Unlock */
@keyframes badgeUnlock {
  0% { 
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1.2) rotate(10deg);
  }
  100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Progress Fill */
@keyframes progressFill {
  from { width: 0%; }
  to { width: var(--progress-value, 100%); }
}

/* Fire Flicker (for streaks) */
@keyframes fireFlicker {
  0%, 100% { 
    transform: scale(1) rotate(-2deg);
    filter: brightness(1);
  }
  25% { 
    transform: scale(1.05) rotate(1deg);
    filter: brightness(1.1);
  }
  50% { 
    transform: scale(0.98) rotate(-1deg);
    filter: brightness(0.95);
  }
  75% { 
    transform: scale(1.02) rotate(2deg);
    filter: brightness(1.05);
  }
}

/* Tier Up Celebration */
@keyframes tierUp {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  25% {
    transform: scale(1.1);
    filter: brightness(1.2) drop-shadow(0 0 20px var(--tier-gold));
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.3) drop-shadow(0 0 30px var(--tier-gold));
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
```

---

## 9. COMPONENTS

### 9.1 Buttons

```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-primary);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-lg);
  transition: all var(--duration-150) var(--ease-in-out);
  cursor: pointer;
  border: none;
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--tier-navy);
  outline-offset: 2px;
}

/* Primary Button */
.btn-primary {
  background-color: var(--tier-navy);
  color: var(--tier-white);
}

.btn-primary:hover {
  background-color: var(--tier-navy-light);
}

.btn-primary:active {
  background-color: var(--tier-navy-dark);
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--tier-gold);
  color: var(--tier-navy);
}

.btn-secondary:hover {
  background-color: var(--tier-gold-light);
}

/* Outline Button */
.btn-outline {
  background-color: transparent;
  border: 2px solid var(--tier-navy);
  color: var(--tier-navy);
}

.btn-outline:hover {
  background-color: var(--tier-navy);
  color: var(--tier-white);
}

/* Ghost Button */
.btn-ghost {
  background-color: transparent;
  color: var(--tier-navy);
}

.btn-ghost:hover {
  background-color: var(--gray-100);
}

/* Button Sizes */
.btn-sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}

.btn-md {
  height: 40px;
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
}

.btn-lg {
  height: 48px;
  padding: 0 var(--space-6);
  font-size: var(--text-base);
}
```

### 9.2 Cards

```css
/* Base Card */
.card {
  background-color: var(--surface-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  padding: var(--card-padding-md);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--duration-200) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-card-hover);
}

/* Elevated Card */
.card-elevated {
  background-color: var(--surface-elevated);
  box-shadow: var(--shadow-md);
}

/* Category Card */
.card-category {
  position: relative;
  overflow: hidden;
}

.card-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: var(--category-color, var(--tier-navy));
}

/* Tier Card */
.card-tier {
  border: 2px solid var(--tier-color, var(--gray-200));
}

.card-tier.tier-gold {
  --tier-color: var(--tier-gold);
  box-shadow: var(--shadow-gold);
}

.card-tier.tier-silver {
  --tier-color: var(--tier-silver);
}

.card-tier.tier-bronze {
  --tier-color: var(--tier-bronze);
}
```

### 9.3 Badges (UI Element)

```css
/* Badge Base */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
}

/* Badge Variants */
.badge-primary {
  background-color: var(--tier-navy);
  color: var(--tier-white);
}

.badge-gold {
  background-color: var(--tier-gold-bg);
  color: var(--tier-gold-dark);
  border: 1px solid var(--tier-gold);
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}
```

### 9.4 Input Fields

```css
/* Input Base */
.input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-4);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--text-primary);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  transition: border-color var(--duration-150) var(--ease-in-out),
              box-shadow var(--duration-150) var(--ease-in-out);
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--tier-navy);
  box-shadow: 0 0 0 3px rgb(10 37 64 / 0.1);
}

.input:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

/* Input Error State */
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
}
```

### 9.5 Progress Bars

```css
/* Progress Container */
.progress {
  width: 100%;
  height: 8px;
  background-color: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

/* Progress Fill */
.progress-fill {
  height: 100%;
  background-color: var(--tier-navy);
  border-radius: var(--radius-full);
  transition: width var(--duration-500) var(--ease-out);
}

/* Category Progress */
.progress-category {
  height: 12px;
}

.progress-category .progress-fill {
  background: linear-gradient(90deg, var(--category-color) 0%, var(--category-color-light) 100%);
}

/* Animated Progress */
.progress-animated .progress-fill {
  animation: progressFill var(--duration-1000) var(--ease-out) forwards;
}
```

### 9.6 Tooltips

```css
/* Tooltip Container */
.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip Content */
.tooltip-content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-2) var(--space-3);
  background-color: var(--tier-navy);
  color: var(--tier-white);
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--duration-150) var(--ease-in-out),
              visibility var(--duration-150) var(--ease-in-out);
  z-index: var(--z-70);
}

/* Tooltip Arrow */
.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--tier-navy);
}

/* Show Tooltip */
.tooltip:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
}
```

---

## 10. GAMIFICATION ELEMENTS

### 10.1 Achievement Badges

```css
/* Achievement Badge Container */
.achievement-badge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

/* Badge Icon Container */
.achievement-badge-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tier-bg) 0%, var(--tier-color) 100%);
  border: 3px solid var(--tier-border);
  box-shadow: var(--shadow-md);
}

/* Tier Variants */
.achievement-badge.tier-bronze {
  --tier-color: var(--tier-bronze);
  --tier-bg: var(--tier-bronze-bg);
  --tier-border: var(--tier-bronze-border);
}

.achievement-badge.tier-silver {
  --tier-color: var(--tier-silver);
  --tier-bg: var(--tier-silver-bg);
  --tier-border: var(--tier-silver-border);
}

.achievement-badge.tier-gold {
  --tier-color: var(--tier-gold);
  --tier-bg: var(--tier-gold-bg);
  --tier-border: var(--tier-gold-border);
}

.achievement-badge.tier-platinum {
  --tier-color: var(--tier-platinum);
  --tier-bg: var(--tier-platinum-bg);
  --tier-border: var(--tier-platinum-border);
}

/* Locked State */
.achievement-badge.locked {
  opacity: 0.5;
  filter: grayscale(100%);
}

/* Badge Sizes */
.achievement-badge.size-sm .achievement-badge-icon {
  width: 40px;
  height: 40px;
}

.achievement-badge.size-md .achievement-badge-icon {
  width: 64px;
  height: 64px;
}

.achievement-badge.size-lg .achievement-badge-icon {
  width: 96px;
  height: 96px;
}

.achievement-badge.size-xl .achievement-badge-icon {
  width: 128px;
  height: 128px;
}
```

### 10.2 Streak Indicator

```css
/* Streak Container */
.streak {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-warning-light);
  border-radius: var(--radius-full);
}

/* Streak Fire Icon */
.streak-fire {
  font-size: var(--text-xl);
  animation: fireFlicker 1s ease-in-out infinite;
}

/* Streak Count */
.streak-count {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-warning-dark);
}

/* Streak Label */
.streak-label {
  font-size: var(--text-sm);
  color: var(--color-warning-dark);
}
```

### 10.3 XP Bar

```css
/* XP Container */
.xp-bar {
  width: 100%;
}

/* XP Progress */
.xp-progress {
  height: 12px;
  background-color: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

/* XP Fill */
.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--tier-gold-dark) 0%, var(--tier-gold) 50%, var(--tier-gold-light) 100%);
  border-radius: var(--radius-full);
  transition: width var(--duration-500) var(--ease-out);
}

/* XP Labels */
.xp-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
```

### 10.4 Level Indicator

```css
/* Level Circle */
.level-indicator {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--tier-navy);
  color: var(--tier-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  border: 3px solid var(--tier-gold);
  box-shadow: var(--shadow-gold);
}
```

### 10.5 Category Ring

```css
/* Category Ring (SVG-based) */
.category-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.category-ring-circle {
  fill: none;
  stroke: var(--gray-200);
  stroke-width: 8;
}

.category-ring-progress {
  fill: none;
  stroke: var(--category-color, var(--tier-navy));
  stroke-width: 8;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset var(--duration-700) var(--ease-out);
}

.category-ring-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.category-ring-letter {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--tier-navy);
}

.category-ring-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
```

---

## 11. DATA VISUALIZATION

### 11.1 Chart Colors

```css
:root {
  /* Primary chart palette */
  --chart-1: #0A2540;    /* Navy */
  --chart-2: #C9A227;    /* Gold */
  --chart-3: #16A34A;    /* Green */
  --chart-4: #2563EB;    /* Blue */
  --chart-5: #7C3AED;    /* Purple */
  --chart-6: #DC2626;    /* Red */
  --chart-7: #D97706;    /* Orange */
  --chart-8: #0891B2;    /* Cyan */
  --chart-9: #DB2777;    /* Pink */
  --chart-10: #4F46E5;   /* Indigo */
  --chart-11: #059669;   /* Emerald */
  --chart-12: #9333EA;   /* Violet */
}
```

### 11.2 Stat Cards

```css
/* Stat Card */
.stat-card {
  padding: var(--space-4);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-xl);
}

/* Stat Value */
.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

/* Stat Label */
.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

/* Stat Trend */
.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-top: var(--space-2);
}

.stat-trend.positive {
  color: var(--color-success);
}

.stat-trend.negative {
  color: var(--color-error);
}

.stat-trend.neutral {
  color: var(--text-secondary);
}
```

---

## 12. DARK MODE

### 12.1 Dark Mode Variables

```css
[data-theme="dark"] {
  /* Backgrounds */
  --surface-primary: var(--surface-dark-primary);
  --surface-secondary: var(--surface-dark-secondary);
  --surface-tertiary: var(--surface-dark-tertiary);
  --surface-elevated: var(--surface-dark-elevated);
  
  /* Text */
  --text-primary: var(--text-dark-primary);
  --text-secondary: var(--text-dark-secondary);
  --text-tertiary: var(--text-dark-tertiary);
  --text-muted: var(--text-dark-muted);
  
  /* Borders */
  --border-default: #1E3A5F;
  --border-strong: #2D4A6F;
  --border-subtle: #152D4A;
  
  /* Adjusted gold for dark mode */
  --tier-gold: #D4B545;
  --tier-gold-light: #E0C65A;
}
```

### 12.2 Dark Mode Implementation

```css
/* System preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Apply dark mode variables */
  }
}

/* Manual toggle */
[data-theme="dark"] {
  /* Apply dark mode variables */
}
```

---

## 13. ICONOGRAPHY

### 13.1 Icon Specifications

| Property | Value |
|----------|-------|
| Base size | 24 × 24px |
| Stroke thickness | 1.5px |
| Corner radius | 2px |
| Cap style | Round |
| Join style | Round |
| Safe zone | 2px |

### 13.2 Icon Sizes

```css
:root {
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-base: 24px;
  --icon-lg: 32px;
  --icon-xl: 48px;
}
```

### 13.3 Recommended Icon Libraries

**Primary:** Lucide Icons (https://lucide.dev/)
- Consistent with design system
- MIT lisens
- React, Vue, Svelte support

**Alternativ:** Heroicons, Phosphor Icons

---

## 14. LOGO USAGE

### 14.1 Logo Versions

| Version | File | Usage |
|---------|-----|------|
| Primary (Navy) | tier-golf-logo.svg | Light background |
| White | tier-golf-logo-white.svg | Dark background |
| Icon | tier-golf-icon.svg | App icon, favicon |

### 14.2 Logo Spacing

**Clear space:** Minimum space around logo = height of "T" in TIER

### 14.3 Minimum Sizes

| Format | Minimum width |
|--------|----------------|
| Full logo | 120px |
| Ikon | 24px |

### 14.4 Incorrect Usage

❌ Do not stretch or distort  
❌ Do not change colors  
❌ Do not add shadows or effects  
❌ Do not rotate  
❌ Do not place on cluttered backgrounds  

---

## 15. TAILWIND CSS CONFIGURATION

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        tier: {
          navy: {
            DEFAULT: '#0A2540',
            light: '#0D3050',
            dark: '#061829',
          },
          gold: {
            DEFAULT: '#C9A227',
            light: '#D4B545',
            dark: '#A8871F',
          },
          white: '#FFFFFF',
        },
        category: {
          a: '#C9A227',
          b: '#B8960F',
          c: '#A68A00',
          d: '#64748B',
          e: '#475569',
          f: '#2563EB',
          g: '#3B82F6',
          h: '#16A34A',
          i: '#22C55E',
          j: '#7C3AED',
          k: '#8B5CF6',
        },
        'badge-tier': {
          bronze: '#B08D57',
          silver: '#8A9BA8',
          gold: '#C9A227',
          platinum: '#E5E4E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'gold': '0 4px 14px 0 rgb(201 162 39 / 0.25)',
        'navy': '0 4px 14px 0 rgb(10 37 64 / 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'badge-unlock': 'badgeUnlock 0.6s ease-out',
        'fire-flicker': 'fireFlicker 1s ease-in-out infinite',
        'progress-fill': 'progressFill 1s ease-out forwards',
        'tier-up': 'tierUp 1.5s ease-out',
      },
    },
  },
  plugins: [],
}
```

---

## 16. REACT NATIVE CONFIGURATION

```javascript
// theme.js
export const theme = {
  colors: {
    tier: {
      navy: '#0A2540',
      navyLight: '#0D3050',
      navyDark: '#061829',
      gold: '#C9A227',
      goldLight: '#D4B545',
      goldDark: '#A8871F',
      white: '#FFFFFF',
    },
    surface: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#EDF0F2',
    },
    text: {
      primary: '#0A2540',
      secondary: '#475569',
      tertiary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#16A34A',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    },
    category: {
      a: '#C9A227',
      b: '#B8960F',
      c: '#A68A00',
      d: '#64748B',
      e: '#475569',
      f: '#2563EB',
      g: '#3B82F6',
      h: '#16A34A',
      i: '#22C55E',
      j: '#7C3AED',
      k: '#8B5CF6',
    },
    badgeTier: {
      bronze: '#B08D57',
      silver: '#8A9BA8',
      gold: '#C9A227',
      platinum: '#E5E4E2',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontFamily: 'DMSans-Bold',
      fontSize: 48,
      lineHeight: 52,
      letterSpacing: -0.5,
    },
    h2: {
      fontFamily: 'DMSans-Bold',
      fontSize: 36,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h3: {
      fontFamily: 'DMSans-SemiBold',
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h4: {
      fontFamily: 'DMSans-SemiBold',
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.2,
    },
    body: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    bodySmall: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      lineHeight: 16,
    },
    label: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    button: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.5,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    gold: {
      shadowColor: '#C9A227',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 8,
    },
  },
};
```

---

## 17. ACCESSIBILITY (A11Y)

### 17.1 Color Contrast

All color combinations meet WCAG 2.1 AA standard (minimum 4.5:1 for normal text).

| Combination | Contrast | Status |
|-------------|----------|--------|
| Navy on white | 14.5:1 | ✅ AAA |
| White on navy | 14.5:1 | ✅ AAA |
| Gold on navy | 5.2:1 | ✅ AA |
| Navy on gold | 5.2:1 | ✅ AA |

### 17.2 Focus States

```css
/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--tier-navy);
  outline-offset: 2px;
}

/* Remove focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 17.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 18. RESOURCES

### 18.1 Logo Files

- `tier-golf-logo.svg` - Main logo (vector)
- `tier-golf-logo.png` - Main logo (raster)
- `tier-golf-logo-white.svg` - White version
- `tier-golf-logo-white.png` - White version (raster)
- `tier-golf-icon.svg` - Icon only
- `tier-golf-icon.png` - Icon only (raster)

### 18.2 Fonts

**Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**npm:**
```bash
npm install @fontsource/inter @fontsource/dm-sans
```

---

## 19. VERSIONING

| Version | Date | Changes |
|---------|------|-----------|
| 1.0.0 | Jan 2025 | Initial release |

---

*TIER Golf Design System*  
*© 2025 TIER Golf / TIER Golf*
