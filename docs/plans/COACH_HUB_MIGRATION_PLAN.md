# Coach Hub Pages Migration Plan

> **Status:** Ready for Implementation
> **Reference:** `docs/guides/DECISION_FIRST_HUB_PATTERN.md`
> **Created:** 2026-01-12

---

## Overview

This plan outlines the migration of all Coach module hub pages to the Decision-First pattern.

### Current State

| Hub Page | Location | Pattern | Status |
|----------|----------|---------|--------|
| Home (Dashboard) | `features/coach-dashboard/CoachDashboard.tsx` | Decision-First | ✅ DONE |
| Players | `features/coach-hub-pages/CoachSpillereHub.tsx` | Old (CoachHubPage) | 🔴 Needs Update |
| Analysis | `features/coach-hub-pages/CoachAnalyseHub.tsx` | Old (CoachHubPage) | 🔴 Needs Update |
| Plan | `features/coach-hub-pages/CoachPlanHub.tsx` | Old (CoachHubPage) | 🔴 Needs Update |
| More | `features/coach-hub-pages/CoachMerHub.tsx` | Old (CoachHubPage) | 🔴 Needs Update |

---

## Hub 1: Players Hub (CoachSpillereHub)

### Primary Question
> "Which player needs my attention right now?"

### State Machine

```typescript
type PlayersHubState =
  | 'sessions_need_feedback'   // Players have completed sessions without feedback
  | 'plans_need_update'        // Training plans expiring or need revision
  | 'inactive_players'         // Players with no activity >14 days
  | 'new_players'              // New players need onboarding/setup
  | 'all_healthy';             // All players are on track
```

### Primary Actions

| State | Headline | CTA |
|-------|----------|-----|
| sessions_need_feedback | "3 players await session feedback" | "Review Sessions" |
| plans_need_update | "2 training plans expire this week" | "Update Plans" |
| inactive_players | "5 players inactive for 2+ weeks" | "Check In" |
| new_players | "1 new player needs setup" | "Complete Onboarding" |
| all_healthy | "All 24 players on track" | "View Players" |

### Layer 2 Panels

**Left Panel: Players Needing Attention**
- List of up to 5 players with issues
- Each shows: avatar, name, issue type, days since last activity
- Click navigates to player detail

**Right Panel: Team Overview Stats**
- Total players / Active this month
- Sessions completed this week (team total)
- Upcoming evaluations count
- Average player load indicator

### Backend Endpoint

```
GET /api/v1/coach-players-dashboard
GET /api/v1/coach-players-dashboard/attention-count
```

### Files to Create

```
apps/api/src/api/v1/coach-players-dashboard/
├── index.ts
├── types.ts
├── schema.ts
└── service.ts

apps/web/src/features/coach-players-dashboard/
├── types.ts
├── hooks/
│   └── useCoachPlayersDashboard.ts
└── components/
    ├── PlayersHeroDecisionCard.tsx
    ├── PlayersNeedingAttentionPanel.tsx
    ├── TeamOverviewCard.tsx
    └── PlayersOperationsSection.tsx
```

---

## Hub 2: Plan Hub (CoachPlanHub)

### Primary Question
> "What scheduling or calendar action should I take now?"

### State Machine

```typescript
type PlanHubState =
  | 'pending_bookings'         // Booking requests awaiting response
  | 'today_sessions'           // Sessions scheduled for today
  | 'tournament_prep'          // Tournaments <14 days needing prep
  | 'schedule_conflicts'       // Overlapping sessions or gaps
  | 'calendar_clear';          // No scheduling issues
```

### Primary Actions

| State | Headline | CTA |
|-------|----------|-----|
| pending_bookings | "5 booking requests pending" | "Review Requests" |
| today_sessions | "3 sessions scheduled today" | "View Today" |
| tournament_prep | "Junior Championship in 8 days" | "Prepare Tournament" |
| schedule_conflicts | "2 schedule conflicts this week" | "Resolve Conflicts" |
| calendar_clear | "Calendar is organized" | "Open Calendar" |

### Layer 2 Panels

**Left Panel: Upcoming Sessions**
- Next 5 sessions with time and player(s)
- Quick status indicators

**Right Panel: Calendar Stats**
- Sessions this week / month
- Booking acceptance rate
- Upcoming tournaments
- Schedule utilization

### Backend Endpoint

```
GET /api/v1/coach-plan-dashboard
GET /api/v1/coach-plan-dashboard/attention-count
```

### Files to Create

```
apps/api/src/api/v1/coach-plan-hub-dashboard/
├── index.ts
├── types.ts
├── schema.ts
└── service.ts

apps/web/src/features/coach-plan-hub-dashboard/
├── types.ts
├── hooks/
│   └── useCoachPlanHubDashboard.ts
└── components/
    ├── PlanHeroDecisionCard.tsx
    ├── UpcomingSessionsPanel.tsx
    ├── CalendarStatsCard.tsx
    └── PlanOperationsSection.tsx
```

---

## Hub 3: Analysis Hub (CoachAnalyseHub)

### Primary Question
> "What data should I review or analyze now?"

### State Machine

```typescript
type AnalysisHubState =
  | 'sessions_need_analysis'   // Recent sessions with unreviewed data
  | 'benchmarks_available'     // New benchmark results to review
  | 'templates_outdated'       // Session templates need updating
  | 'stats_ready';             // General stats available
```

### Primary Actions

| State | Headline | CTA |
|-------|----------|-----|
| sessions_need_analysis | "8 sessions have unanalyzed data" | "Analyze Data" |
| benchmarks_available | "3 new benchmark results" | "Review Benchmarks" |
| templates_outdated | "2 templates need updating" | "Update Templates" |
| stats_ready | "View your coaching statistics" | "View Statistics" |

### Layer 2 Panels

**Left Panel: Data to Review**
- List of sessions/benchmarks needing attention
- Quick stats on data quality

**Right Panel: Exercise Library**
- Total exercises in library
- My custom exercises
- Most used templates
- Recent template usage

### Backend Endpoint

```
GET /api/v1/coach-analysis-dashboard
GET /api/v1/coach-analysis-dashboard/attention-count
```

### Files to Create

```
apps/api/src/api/v1/coach-analysis-dashboard/
├── index.ts
├── types.ts
├── schema.ts
└── service.ts

apps/web/src/features/coach-analysis-dashboard/
├── types.ts
├── hooks/
│   └── useCoachAnalysisDashboard.ts
└── components/
    ├── AnalysisHeroDecisionCard.tsx
    ├── DataToReviewPanel.tsx
    ├── ExerciseLibraryCard.tsx
    └── AnalysisOperationsSection.tsx
```

---

## Hub 4: More Hub (CoachMerHub)

### Primary Question
> "What communication or admin task needs attention?"

### State Machine

```typescript
type MoreHubState =
  | 'unread_messages'          // Messages awaiting response
  | 'pending_requests'         // Change requests from players
  | 'group_updates'            // Group notifications
  | 'settings_needed'          // Profile/settings need attention
  | 'all_clear';               // No admin tasks
```

### Primary Actions

| State | Headline | CTA |
|-------|----------|-----|
| unread_messages | "3 unread messages" | "Read Messages" |
| pending_requests | "2 change requests pending" | "Review Requests" |
| group_updates | "New updates in Team Norway" | "View Group" |
| settings_needed | "Complete your profile" | "Update Profile" |
| all_clear | "All caught up!" | "New Message" |

### Layer 2 Panels

**Left Panel: Messages & Requests**
- Recent messages preview
- Pending requests list

**Right Panel: Groups & Settings**
- Group membership summary
- Profile completion status
- Quick settings links

### Backend Endpoint

```
GET /api/v1/coach-more-dashboard
GET /api/v1/coach-more-dashboard/attention-count
```

### Files to Create

```
apps/api/src/api/v1/coach-more-dashboard/
├── index.ts
├── types.ts
├── schema.ts
└── service.ts

apps/web/src/features/coach-more-dashboard/
├── types.ts
├── hooks/
│   └── useCoachMoreDashboard.ts
└── components/
    ├── MoreHeroDecisionCard.tsx
    ├── MessagesPanel.tsx
    ├── GroupsSettingsCard.tsx
    └── MoreOperationsSection.tsx
```

---

## Implementation Order

### Recommended Sequence

1. **Players Hub** (Highest value - core coaching activity)
2. **Plan Hub** (Calendar/scheduling is daily use)
3. **Analysis Hub** (Data-driven features)
4. **More Hub** (Admin/settings)

### Per-Hub Implementation Steps

```
1. Backend (3-4 hours)
   - Create types.ts with interfaces
   - Create service.ts with state machine + queries
   - Create schema.ts with JSON Schema
   - Create index.ts with routes
   - Register in app.ts
   - Test endpoint

2. Frontend (4-5 hours)
   - Create types.ts (mirror backend)
   - Create hook with fallback data
   - Create HeroDecisionCard component
   - Create Layer 2 panels
   - Create OperationsSection
   - Update hub page file
   - Wire to existing navigation

3. Testing & Polish (2 hours)
   - Loading states
   - Error states
   - Fallback behavior
   - Attention badge wiring
```

---

## Navigation Badge Wiring

Each hub that has an attention count should display a badge in the sidebar.

### Update `coach-navigation-v3.ts`

```typescript
// For each area that needs attention badges:
{
  id: 'spillere',
  label: 'Players',
  icon: 'Users',
  href: '/coach/players',
  badge: 'playersAttention',  // Add this
  // ...
}
```

### Update `CoachSidebarV3.tsx`

Add props for each attention count and wire to badges.

### Update `CoachAppShell.tsx`

Import and use hooks for each attention count.

---

## Data Sources (Prisma Queries)

### Players Dashboard

```typescript
// Players needing feedback
prisma.trainingSessions.findMany({
  where: {
    coachId,
    status: 'COMPLETED',
    coachFeedback: null,
  },
  include: { player: true },
});

// Inactive players
prisma.players.findMany({
  where: {
    coachId,
    lastActivityAt: { lt: subDays(new Date(), 14) },
  },
});

// Expiring plans
prisma.annualPlans.findMany({
  where: {
    coachId,
    endDate: { lt: addDays(new Date(), 14) },
  },
});
```

### Plan Dashboard

```typescript
// Pending bookings
prisma.bookingRequests.findMany({
  where: {
    coachId,
    status: 'PENDING',
  },
});

// Today's sessions
prisma.trainingSessions.findMany({
  where: {
    coachId,
    scheduledDate: {
      gte: startOfDay(new Date()),
      lte: endOfDay(new Date()),
    },
  },
});

// Upcoming tournaments
prisma.tournaments.findMany({
  where: {
    players: { some: { coachId } },
    startDate: { lte: addDays(new Date(), 14) },
  },
});
```

### Analysis Dashboard

```typescript
// Sessions needing analysis
prisma.trainingSessions.findMany({
  where: {
    coachId,
    status: 'COMPLETED',
    analysisCompleted: false,
  },
});

// Exercise library stats
prisma.exercises.count({
  where: { createdBy: coachId },
});

// Template usage
prisma.sessionTemplates.findMany({
  where: { coachId },
  orderBy: { usageCount: 'desc' },
  take: 5,
});
```

### More Dashboard

```typescript
// Unread messages
prisma.messages.count({
  where: {
    recipientId: coachId,
    readAt: null,
  },
});

// Pending requests
prisma.changeRequests.findMany({
  where: {
    coachId,
    status: 'PENDING',
  },
});
```

---

## Verification Checklist

After implementing each hub:

- [ ] API endpoint returns correct data structure
- [ ] State machine returns expected state for test cases
- [ ] Hero card displays correct primary action
- [ ] Layer 2 panels show relevant data
- [ ] Operations section links work
- [ ] Loading skeleton displays during fetch
- [ ] Error state shows with retry button
- [ ] Fallback data used when API fails
- [ ] Attention badge updates in sidebar
- [ ] Mobile responsive layout works

---

## Success Criteria

1. Each hub answers its primary question in <5 seconds
2. Primary action is immediately clear and actionable
3. No navigation-first patterns remain
4. State machine correctly prioritizes actions
5. Graceful degradation with fallback data
6. Consistent visual design across all hubs

---

*Ready for implementation. Start with Players Hub.*
