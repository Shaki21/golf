# Dashboard v2 - Technical Specification

> **Version:** 2.0.0
> **Design System:** AK Golf Premium Light v3.0
> **Last Updated:** 2024-12-29

---

## 1. DashboardV2Layout

### Responsive Grid Structure

```
┌─────────────────────────────────────────────────────────┐
│                      HEADER                              │
│  Date label · Greeting · Avatar                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────┐  ┌─────────────────────┐   │
│  │                         │  │     STATS GRID      │   │
│  │       HERO CARD         │  │  ┌────┐  ┌────┐     │   │
│  │                         │  │  │ S1 │  │ S2 │     │   │
│  │  [Today's Focus]        │  │  └────┘  └────┘     │   │
│  │  [Primary CTA]          │  │  ┌────┐  ┌────┐     │   │
│  │                         │  │  │ S3 │  │ S4 │     │   │
│  └─────────────────────────┘  │  └────┘  └────┘     │   │
│       col-span-7              └─────────────────────┘   │
│                                   col-span-5            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────┐  ┌─────────────────────┐   │
│  │      NEXT UP            │  │    DAILY PLAN       │   │
│  │  ┌─────────┬─────────┐  │  │                     │   │
│  │  │Turnering│  Test   │  │  │  09:00 Teknikk      │   │
│  │  │  14d    │   7d    │  │  │  11:00 Approach     │   │
│  │  └─────────┴─────────┘  │  │  14:00 Spill        │   │
│  └─────────────────────────┘  └─────────────────────┘   │
│       col-span-7                  col-span-5            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────┐  ┌─────────────────────┐   │
│  │    STROKES GAINED       │  │   ACTIVITY FEED     │   │
│  │                         │  │                     │   │
│  │  Driving    ████▌  +0.4 │  │  • Økt fullført     │   │
│  │  Approach   ▌       -0.2│  │  • Melding fra coach│   │
│  │  Around     ██▌    +0.3 │  │  • Badge opptjent   │   │
│  │  Putting    ██▌     -0.3│  │                     │   │
│  │  ──────────────────────│  │                     │   │
│  │  Total SG        +0.15  │  │                     │   │
│  └─────────────────────────┘  └─────────────────────┘   │
│       col-span-7                  col-span-5            │
└─────────────────────────────────────────────────────────┘
```

### Breakpoints

| Breakpoint | Grid | Gap | Notes |
|------------|------|-----|-------|
| 0-767px | 1 column | 16px | Full-width cards, stacked |
| 768-1023px | 2 columns (1fr 1fr) | 16px | Balanced 50/50 split |
| 1024px+ | 12 columns (7fr 5fr) | 24px | Asymmetric, content-first |

---

## 2. Component Tree

```
DashboardV2
└── DashboardV2Layout
    │
    ├── header
    │   └── DashboardHeader
    │       ├── Date label (caption, tertiary)
    │       └── Player greeting (title2, primary)
    │
    ├── hero (col-span-7)
    │   └── AsyncBoundary [loading|error|stale|empty|success]
    │       └── HeroCard
    │           ├── Date label (caption1, uppercase)
    │           ├── Greeting (title1, bold)
    │           ├── Focus section (surface bg)
    │           │   ├── Focus label (footnote, brand color)
    │           │   ├── Category badge (caption2, pill)
    │           │   ├── Title (title3, semibold)
    │           │   ├── Description (subheadline, secondary)
    │           │   └── ProgressBar [optional]
    │           └── Actions
    │               ├── Primary button (44px, brand)
    │               └── Secondary link (text, brand)
    │
    ├── statsGrid (col-span-5)
    │   └── AsyncBoundary
    │       └── StatsGrid (2x2)
    │           └── StatsCard (×4)
    │               ├── Label (caption1, uppercase, secondary)
    │               ├── Icon [optional] (tertiary)
    │               ├── Value (title1, bold, tabular-nums)
    │               ├── Unit (footnote, tertiary)
    │               └── Change indicator
    │                   ├── Value (+/−, success/error)
    │                   └── Label (caption1, tertiary)
    │
    ├── nextUp (col-span-7)
    │   └── AsyncBoundary
    │       └── NextUpSection
    │           ├── CountdownCard [tournament]
    │           │   ├── Type label (caption2, warning)
    │           │   ├── Title (subheadline, primary)
    │           │   ├── Location (caption1, secondary)
    │           │   ├── Date (caption1, tertiary)
    │           │   └── Days remaining (title1, brand, tabular)
    │           └── CountdownCard [test]
    │               └── (same structure, info color)
    │
    ├── dailyPlan (col-span-5)
    │   └── AsyncBoundary
    │       └── ScheduleCard
    │           ├── Header
    │           │   ├── Label (caption1, tertiary)
    │           │   ├── Date (headline, primary)
    │           │   └── View all button (footnote, brand)
    │           └── Sessions list
    │               └── Session item (×n)
    │                   ├── Time column (footnote, tabular)
    │                   ├── Type dot (8px, colored)
    │                   ├── Title (subheadline, primary)
    │                   ├── Location (caption1, secondary)
    │                   └── Status indicator
    │
    ├── strokesGained (col-span-7)
    │   └── AsyncBoundary
    │       └── StrokesGainedCard
    │           ├── Header
    │           │   ├── Title (headline, primary)
    │           │   ├── Subtitle (caption1, tertiary)
    │           │   └── Details button (footnote, brand)
    │           ├── Metrics
    │           │   └── Metric row (×4)
    │           │       ├── Label (footnote, secondary)
    │           │       ├── Bar (centerline, pos=success/neg=error)
    │           │       └── Value (footnote, bold, tabular)
    │           └── Total row (surface bg)
    │               ├── Label (subheadline, primary)
    │               └── Value (title3, bold, success/error)
    │
    └── activityFeed (col-span-5)
        └── AsyncBoundary
            └── ActivityFeed
                ├── Header
                │   ├── Title (headline, primary)
                │   └── View all button (footnote, brand)
                └── Activities list
                    └── Activity item (×n)
                        ├── Type indicator (8px dot)
                        ├── Title (subheadline, primary)
                        ├── Description (caption1, secondary)
                        ├── Timestamp (caption1, tertiary, relative)
                        └── Unread dot [optional] (6px, brand)
```

---

## 3. Async State Contract

Every data-dependent section wraps content in `AsyncBoundary`:

| State | Visual | Behavior |
|-------|--------|----------|
| `loading` | Custom skeleton OR default pulse | Maintains layout shape |
| `error` | ErrorPanel with retry CTA | "Noe gikk galt" + retry button |
| `stale` | Info Alert above content | "Viser tidligere data" + content |
| `empty` | EmptyPanel with action | Title + description + CTA |
| `success` | Normal content render | Pass-through children |

```tsx
<AsyncBoundary
  state={asyncState}
  skeleton={<CustomSkeleton />}
  errorMessage="Kunne ikke laste statistikk"
  onRetry={refetch}
  staleMessage="Oppdaterer data..."
  emptyState={{
    title: "Ingen data ennå",
    description: "Start din første økt for å se statistikk",
    actionLabel: "Start økt",
    onAction: () => navigate('/sessions/new'),
  }}
>
  <StatsGrid>...</StatsGrid>
</AsyncBoundary>
```

---

## 4. Design Rationale

### Why This Layout Feels Premium

**1. Information Hierarchy**

The 7/5 column split isn't arbitrary. It follows the golden ratio principle (≈1.4:1), creating visual harmony while giving primary content (hero, actions, metrics) dominant viewport space.

**2. Restraint Over Decoration**

- Zero gradients
- Zero shadows > `--shadow-elevated`
- Zero arbitrary colors
- Single font family (Inter)

Premium is achieved through negative space and precision, not embellishment.

**3. Data Typography**

All numeric data uses `tabular-nums` for perfect column alignment. This subtle detail signals engineering precision and makes scanning effortless.

**4. Status Colors by Intent**

Colors are never decorative:
- Green = positive change, success
- Red = negative change, error
- Amber = warning, tournament
- Blue = info, test
- Gold = earned achievement ONLY

**5. Touch-First, Mouse-Enhanced**

- All interactive elements ≥44px
- Press states (`active:scale(0.98)`)
- No hover-only affordances

**6. The "One Gold Rule"**

Gold (`#B8860B`) appears maximum once per viewport, reserved for earned achievements. This prevents value dilution and maintains gold's "premium earned" association.

---

## 5. Token Reference (Quick)

### Semantic Classes

```css
/* Backgrounds */
var(--background-default)    /* Page bg */
var(--background-white)      /* Card bg */
var(--background-surface)    /* Nested sections */
var(--background-elevated)   /* Progress tracks, dividers */

/* Text */
var(--text-primary)          /* Headlines, values */
var(--text-secondary)        /* Descriptions */
var(--text-tertiary)         /* Meta, timestamps */
var(--text-brand)            /* Interactive text, emphasis */
var(--text-inverse)          /* On primary bg */

/* Status */
var(--ak-success)            /* Positive */
var(--ak-error)              /* Negative */
var(--ak-warning)            /* Caution, tournament */
var(--ak-info)               /* Information, test */
var(--ak-gold)               /* EARNED ONLY */

/* Borders */
var(--border-subtle)         /* Internal dividers */
var(--border-default)        /* Card outlines */
var(--border-strong)         /* Emphasis */
```

### Typography

```css
/* Titles */
.text-title1   /* 28px/34px, 700 - Page title */
.text-title2   /* 22px/28px, 700 - Section title */
.text-title3   /* 20px/25px, 600 - Card title */
.text-headline /* 17px/22px, 600 - Widget title */

/* Body */
.text-body       /* 17px/22px, 400 - Standard text */
.text-subheadline /* 15px/20px, 400 - Secondary text */
.text-footnote   /* 13px/18px, 400 - Small text */

/* Captions */
.text-caption1 /* 12px/16px, 400 - Labels */
.text-caption2 /* 11px/13px, 400 - Micro */
```

---

## 6. Implementation Checklist

- [x] DashboardV2Layout (responsive grid)
- [x] HeroCard (focus + CTA)
- [x] StatsCard + StatsGrid (2x2 metrics)
- [x] CountdownCard + NextUpSection
- [x] ScheduleCard (daily plan)
- [x] StrokesGainedCard (centerline bars)
- [x] ActivityFeed (timeline)
- [x] AsyncBoundary (state wrapper)
- [x] Alert primitive
- [x] ProgressBar primitive
- [ ] Integration with data hooks
- [ ] Responsive CSS for NextUpSection
- [ ] E2E testing
- [ ] Accessibility audit

---

## 7. File Structure

```
apps/web/src/features/dashboard/v2/
├── index.ts                 # Public exports
├── DashboardV2.tsx          # Main component
├── DashboardV2Layout.tsx    # Grid layout
├── DASHBOARD_V2_SPEC.md     # This document
└── components/
    ├── index.ts             # Component exports
    ├── HeroCard.tsx
    ├── StatsCard.tsx
    ├── CountdownCard.tsx
    ├── ScheduleCard.tsx
    ├── StrokesGainedCard.tsx
    ├── ActivityFeed.tsx
    └── AsyncBoundary.tsx
```

---

*Maintained by AK Golf Engineering*
