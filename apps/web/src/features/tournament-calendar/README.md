# Tournament Calendar Feature

Tournament discovery and planning surface for AK Golf Academy.

## Overview

The Tournament Calendar provides:
- Automatic tournament ingestion from multiple tour sources
- Recommended player category mapping based on hierarchy configuration
- List-first scannable design
- Robust filtering with URL persistence
- Tournament details panel with calendar integration

## Files

```
tournament-calendar/
  ├── index.ts                    # Feature exports
  ├── types.ts                    # TypeScript definitions
  ├── hierarchy-config.ts         # Category mapping rules
  ├── tournament-service.ts       # Data fetching & seed fallback
  ├── TournamentCalendarPage.tsx  # Main page component
  ├── TournamentDetailsPanel.tsx  # Detail side panel
  └── README.md                   # This file
```

## Hierarchy Configuration

The hierarchy mapping is defined in `hierarchy-config.ts`. It maps tour types to recommended player categories:

### Categories

| Category | Level | Description |
|----------|-------|-------------|
| A | Elite / Professional | PGA Tour, DP World Tour, Challenge Tour, WAGR |
| B | Advanced | EGA, Nordic League, College |
| C | Intermediate | Garmin Norges Cup, Srixon Tour, Global Junior Tour |
| D | Developing | Junior Tour Regional, Club tournaments |
| E | Beginner | Academy internal tournaments |

### Updating Hierarchy Rules

Edit `HIERARCHY_RULES` array in `hierarchy-config.ts`:

```typescript
{
  tour: 'tour_type_id',
  primaryCategory: 'C',
  adjacentCategories: ['B', 'D'],  // Optional
  description: 'Human readable description',
  confidence: 'high' | 'medium' | 'low',
}
```

## Testing Filters

Filters are persisted to URL query parameters:

```
/turneringskalender?q=search&tour=srixon_tour&category=C
```

Available filters:
- `q` - Search query (name, venue, city)
- `tour` - Tour type (multi-select)
- `status` - Tournament status (multi-select)
- `category` - Recommended category (multi-select)
- `dateRange` - Date preset (`next_30_days`, `next_90_days`, `this_season`, `custom`)
- `country` - Country code (multi-select)

## Seed Tournaments

In development or when API returns empty, deterministic seed tournaments are generated:

- 1+ tournament per tour type (11+ total)
- Multi-day tournaments
- Various statuses (open, full, registered, completed)
- Past tournaments with results (including podiums)

Seed generation is stable based on current date for QA consistency.

See `generateSeedTournaments()` in `tournament-service.ts`.

## Token Discipline

This feature follows AK Golf Premium Light design system:

- **NO raw hex values** - Use CSS variables only
- **NO arbitrary Tailwind colors** - Use semantic token classes
- **Gold reserved for achievements only** - Never for standard UI elements

### Semantic Tokens Used

```css
/* Backgrounds */
var(--background-white)
var(--background-surface)
var(--background-elevated)

/* Text */
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)

/* Borders */
var(--border-default)
var(--border-subtle)
var(--border-brand)

/* Brand/Accent */
var(--accent)
var(--accent-muted)

/* Status */
var(--success)
var(--warning)
var(--error)
```

### Verifying Token Compliance

Run the color lint check:

```bash
pnpm --filter iup-golf-web lint:colors
# Or
node scripts/lint-colors.js
```

## API Integration

The feature expects this API endpoint:

```
GET /api/v1/calendar/tournaments
Authorization: Bearer <token>

Response:
{
  tournaments: Tournament[]
}
```

Each tournament should include:
- id, name, startDate, endDate
- venue, city, country
- tour (tour type)
- status
- maxParticipants, currentParticipants
- entryFee, registrationUrl, hotelUrl
- format, description

The service applies hierarchy mapping (`applyHierarchyMapping`) to add:
- recommendedCategory
- recommendedLevelLabel
- recommendationConfidence

## Calendar Integration

"Legg til" button calls `onAddToCalendar(tournament)` which should:
1. Create a calendar event via the Calendar API
2. Use all-day format for multi-day tournaments
3. Include tournament name, venue, and status

TODO: Implement actual Calendar API integration.

## Routes

- `/turneringskalender` - New Tournament Calendar Page
- `/turneringskalender-old` - Legacy implementation (backwards compatible)

## Acceptance Criteria Checklist

- [x] AppShell persistence (header/nav visible)
- [x] Ingestion-ready architecture (fetchTournaments interface)
- [x] Hierarchy mapping (recommendedCategory on all tournaments)
- [x] Filter by category, tour, status, date, location, search
- [x] Highly scannable list view
- [x] Tournament details panel
- [x] Add-to-calendar action
- [x] Token discipline (no raw hex, no gold for standard UI)
- [x] Seed data fallback
- [x] URL filter persistence
