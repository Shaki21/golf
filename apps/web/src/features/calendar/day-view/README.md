# Day View - Decision Engine Execution Surface

This Day View is **strictly subordinate** to the strategy **"Alt B: Decision Engine"**.

## Strategic Intent (NON-NEGOTIABLE)

- The Home screen decides **WHAT** the athlete should do
- The Day View exists only to help the athlete **EXECUTE** that already-made decision
- There must always be:
  1. One clear priority
  2. One primary action
  3. Secondary information only after action

**This is NOT a Google Calendar clone. This is a PERFORMANCE EXECUTION SURFACE.**

## State Machine (S0-S6)

The Day View implements an explicit state machine:

| State | Name | Description | Primary Action |
|-------|------|-------------|----------------|
| S0 | DEFAULT | Decision Anchor visible, no event selected | Start nå |
| S1 | SCHEDULED | Recommended workout is scheduled | Start nå |
| S2 | UNSCHEDULED | Recommended workout exists but not scheduled | Planlegg og start |
| S3 | NO_RECOMMENDATION | No recommendation available (fallback) | Start 15 min terskeløkt |
| S4 | COLLISION | Hard collision with locked event | Flytt 30 min |
| S5 | IN_PROGRESS | Workout currently running | Fullfør |
| S6 | COMPLETED | Workout finished today | Loggfør notat |

## Component Architecture

```
day-view/
├── index.ts                  # Module exports
├── types.ts                  # TypeScript types & interfaces
├── useDayViewState.ts        # State machine hook
├── DayViewExecution.tsx      # Main container component
├── DecisionAnchor.tsx        # Sticky decision header
├── TimeGrid.tsx              # Vertical hour grid
├── EventCard.tsx             # Event display cards
├── EventDetailPanel.tsx      # Side panel (desktop) / bottom sheet (mobile)
└── README.md                 # This file
```

## Components

### DayViewExecution
Main container that orchestrates all sub-components. Manages:
- Date navigation
- State machine coordination
- Event selection
- Panel visibility

### DecisionAnchor
**Always visible** - this is the anchor to the already-made decision.

Content:
- Line 1: "I dag: {ukens_fokus}"
- Line 2: "Anbefalt: {økt_navn} · {varighet} · {kategori}"
- Primary CTA based on current state
- Secondary actions (Utsett, etc.)

### TimeGrid
Vertical hour grid (05:00-23:00) with:
- Hour labels
- Current time indicator ("now line")
- Auto-scroll to "now" on initial load
- Event cards positioned by time
- Ghost slot for unscheduled recommendations (S2)

### EventCard
Visual representation of events with semantic styling:

| Event Type | Background | Border | Badge |
|------------|------------|--------|-------|
| Recommended | accent-muted | accent (left) | "Anbefalt" |
| Planned | elevated | default | "Planlagt" |
| In Progress | success-muted | success | "Pågår" |
| Completed | elevated (muted) | success | "Fullført" |
| Ghost | transparent | dashed brand | "Foreslått" |
| External | surface | default | none |

### EventDetailPanel
- **Desktop**: Side panel (400px) slides in from right
- **Mobile**: Bottom sheet (85% max height) slides up

Actions available:
- Start
- Utsett / Flytt (Reschedule)
- Kort ned (Shorten: 45 → 30 → 15)
- Marker fullført (Complete)
- Se øktinnhold (View content - read only)

## Testing States Locally

### Via URL Query Parameters
The Day View can be accessed at `/kalender/dag`.

To test specific dates:
```
/kalender/dag?date=2025-01-15
```

### Via Mock Data
The `generateMockData` function in `DayViewExecution.tsx` generates test data:

- **S1 (SCHEDULED)**: Default behavior - recommended workout with time
- **S3 (NO_RECOMMENDATION)**: Navigate to a date with no workouts
- **S4 (COLLISION)**: Monday has a conflicting meeting at 09:30-10:30
- **S5 (IN_PROGRESS)**: Click "Start nå" to enter this state
- **S6 (COMPLETED)**: Click "Fullfør" after starting

### Testing S2 (UNSCHEDULED)
Modify mock data to return a workout without `scheduledTime`:
```typescript
{
  id: 'workout-1',
  name: 'Putting Presisjon',
  // scheduledTime: undefined, // No time = ghost slot
  ...
}
```

## Instrumentation Events

All events are logged (non-blocking) via `console.log` in MVP:

| Event | Payload |
|-------|---------|
| workout_start | `{ source, recommended, planned, duration_selected }` |
| workout_reschedule | `{ from_time, to_time, reason }` |
| workout_modify | `{ old_duration, new_duration }` |
| workout_complete | `{ duration_actual, recommended, planned }` |

## Visual Semantics

**CRITICAL**: This implementation uses **semantic CSS tokens only**.
No raw hex values are allowed.

Token mapping:
- `var(--accent)` - Primary brand color
- `var(--accent-muted)` - Recommended background
- `var(--success)` - In progress / completed
- `var(--success-muted)` - Success background
- `var(--text-primary)` - Main text
- `var(--text-secondary)` - Secondary text
- `var(--text-tertiary)` - Muted text
- `var(--border-default)` - Standard borders
- `var(--border-brand)` - Accent borders

## Do Not Build (Absolute)

The following are **explicitly forbidden** in this implementation:

- Full calendar editor as default
- Drag-and-drop planning UI
- Advanced recurrence editors
- Availability / booking systems
- Multi-calendar admin logic
- Calendar analytics or statistics in Day View
- Unlimited color/tag systems

## Acceptance Criteria

- [ ] Decision Anchor is always visible
- [ ] One primary CTA at all times
- [ ] Recommended workout is visually dominant
- [ ] External events never override training priority
- [ ] All instrumentation fires correctly
- [ ] No forbidden features are implemented
- [ ] Responsive (desktop + mobile)
- [ ] Full keyboard accessibility
- [ ] State handling is explicit (S0-S6)

## Future Enhancements

When connecting to real API:
1. Replace `generateMockData` with `useCalendarData` hook
2. Connect `startWorkout` to session API
3. Integrate with weekly focus from Home screen
4. Connect to external calendar sync (Google Calendar)
