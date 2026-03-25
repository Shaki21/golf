# TIER Golf Component Library

Komponentbibliotek for TIER Golf design system.

## 📦 Komponenter

### Base Components

#### TierButton
Premium button med TIER Golf styling.

```jsx
import { TierButton } from '@/components/tier';

<TierButton variant="primary" size="md" onClick={handleClick}>
  Click me
</TierButton>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'outline'` | `'ghost'` (default: `'primary'`)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `disabled`: boolean
- `className`: string
- Standard button props (`onClick`, `type`, etc.)

---

#### TierCard
Flexible card component med multiple variants.

```jsx
import { TierCard } from '@/components/tier';

// Base card
<TierCard>
  <h3>Title</h3>
  <p>Content</p>
</TierCard>

// Category card med farget top border
<TierCard variant="category" category="A">
  <h3>Category A Progress</h3>
</TierCard>

// Tier card med colored border
<TierCard variant="tier" tier="gold">
  <h3>Gold Badge</h3>
</TierCard>
```

**Props:**
- `variant`: `'base'` | `'elevated'` | `'category'` | `'tier'` (default: `'base'`)
- `category`: `'A'` - `'K'` (required when `variant="category"`)
- `tier`: `'bronze'` | `'silver'` | `'gold'` | `'platinum'` (required when `variant="tier"`)
- `hoverable`: boolean (enables hover shadow effect)
- `className`: string

---

#### TierBadge
Small badge/pill for status indicators.

```jsx
import { TierBadge } from '@/components/tier';
import { CheckCircle } from 'lucide-react';

<TierBadge variant="success" icon={<CheckCircle />}>
  Completed
</TierBadge>
```

**Props:**
- `variant`: `'primary'` | `'gold'` | `'success'` | `'warning'` | `'error'` | `'info'` | `'neutral'`
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `icon`: React element (Lucide icon)
- `className`: string

---

### Gamification Components

#### CategoryRing
SVG-based circular progress for Category A-K system.

```jsx
import { CategoryRing } from '@/components/tier';

<CategoryRing
  category="A"
  progress={65}
  size={120}
/>
```

**Props:**
- `category`: `'A'` - `'K'` (required)
- `progress`: number (0-100) (default: 0)
- `size`: number (pixels) (default: 120)
- `strokeWidth`: number (default: 8)
- `showPercentage`: boolean (default: true)
- `className`: string

**Static properties:**
- `CategoryRing.categories` - Array of valid categories
- `CategoryRing.categoryColors` - Object mapping categories to hex colors
- `CategoryRing.categoryNames` - Object mapping categories to Norwegian names

---

#### StreakIndicator
Shows training streak count with animated fire icon.

```jsx
import { StreakIndicator } from '@/components/tier';

<StreakIndicator count={7} label="dagers streak" />
```

**Props:**
- `count`: number (streak count)
- `label`: string (default: `"dagers streak"`)
- `animated`: boolean (enable fire flicker) (default: true)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `className`: string

---

## 🎨 Design Tokens

All komponenter bruker TIER Golf design tokens fra `src/styles/tier-tokens.css`.

### Farger

```jsx
// Navy (primary)
className="bg-tier-navy text-tier-white"
className="bg-tier-navy-light"
className="bg-tier-navy-dark"

// Gold (accent)
className="bg-tier-gold text-tier-navy"
className="bg-tier-gold-light"
className="bg-tier-gold-dark"

// Category A-K
className="bg-category-a"  // Gold
className="bg-category-d"  // Silver
className="bg-category-f"  // Blue
className="bg-category-h"  // Green
className="bg-category-j"  // Purple

// Badge tiers
className="bg-badge-tier-bronze"
className="bg-badge-tier-silver"
className="bg-badge-tier-gold"
className="bg-badge-tier-platinum"

// Status
className="bg-status-success"
className="bg-status-warning"
className="bg-status-error"
className="bg-status-info"
```

### Typografi

```jsx
// Headers (DM Sans)
className="font-display text-4xl font-bold"

// Body (Inter)
className="font-sans text-base"

// Mono (for code/numbers)
className="font-mono text-sm"
```

---

## 🎬 Animasjoner

All animasjoner er definert i `src/styles/tier-animations.css`.

```jsx
// Fire flicker (for StreakIndicator)
className="animate-fire-flicker"

// Badge unlock
className="animate-badge-unlock"

// Tier up celebration
className="animate-tier-up"

// Standard animations
className="animate-fade-in"
className="animate-slide-up"
className="animate-scale-in"
className="animate-pulse-slow"
```

**Accessibility:** Alle animasjoner respekterer `prefers-reduced-motion`.

---

## 🧪 Testing

For å se alle komponenter i aksjon:

1. Start dev server: `npm run dev`
2. Åpne `TierShowcase.jsx` i nettleseren
3. Eller import showcase: `import TierShowcase from '@/components/tier/TierShowcase';`

---

## 📚 Dokumentasjon

- [TIER_GOLF_DESIGN_SYSTEM.md](../../../TIER_GOLF_DESIGN_SYSTEM.md) - Komplett design system spec
- [TIER_GOLF_IMPLEMENTATION_PLAN.md](../../../TIER_GOLF_IMPLEMENTATION_PLAN.md) - Implementation roadmap
- [CATEGORY_AK_SYSTEM.md](../../../CATEGORY_AK_SYSTEM.md) - A-K kategori detaljer

---

## ✅ Komponent Checklist

- [x] TierButton - 4 variants, 3 sizes
- [x] TierCard - 4 variants (base, elevated, category, tier)
- [x] TierBadge - 7 variants, 3 sizes, icon support
- [x] CategoryRing - SVG circular progress for A-K
- [x] StreakIndicator - Animated streak counter
- [ ] TierInput - Form input (TODO)
- [ ] TierProgress - Progress bar (TODO)
- [ ] TierTooltip - Tooltip (TODO)
- [ ] AchievementBadge - Unlockable badge (TODO)
- [ ] XPBar - Experience bar (TODO)
- [ ] LevelIndicator - Player level (TODO)

---

**Version:** 1.0.0
**Last Updated:** Januar 2025
