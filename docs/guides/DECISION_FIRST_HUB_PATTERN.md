# Decision-First Hub Page Pattern

> **Version:** 1.0
> **Created:** 2026-01-12
> **Applies to:** All hub pages in Coach and Player modules
> **Reference Implementation:** `CoachDashboard.tsx`, `PlanHub.tsx`

---

## Executive Summary

This document defines the **Decision-First Hub Pattern** - a McKinsey-grade dashboard architecture that transforms hub pages from navigation menus into intelligent operating dashboards.

**Primary Question Each Hub Must Answer (visible in <5 seconds):**

> "What is the most important decision/action I should take NOW in [this area]?"

---

## The 3-Layer Information Architecture

All hub pages MUST follow this layout structure:

```
┌────────────────────────────────────────────────────────────┐
│  PageHeader (compact - less prominent than hero)           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  LAYER 1 — DECISION LAYER (~30% of viewport)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HeroDecisionCard                                    │  │
│  │  - Greeting + attention badge                        │  │
│  │  - Primary action headline                           │  │
│  │  - Context/subtext                                   │  │
│  │  - Single dominant CTA button                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  LAYER 2 — CONTROL & PROGRESS (~40% of viewport)          │
│  ┌────────────────────────┬─────────────────────────────┐  │
│  │  Primary Panel         │  Secondary Panel            │  │
│  │  (e.g., Items needing  │  (e.g., Stats/Load/         │  │
│  │   attention, Goals)    │   Tournaments)              │  │
│  └────────────────────────┴─────────────────────────────┘  │
│                                                            │
│  LAYER 3 — OPERATIONS & ADMIN (~30% of viewport)          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OperationsSection (visually quieter, collapsible)   │  │
│  │  - Quick actions                                     │  │
│  │  - Navigation to sub-pages                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Non-Negotiable Principles

1. **Decision-first, not feature-first** - Lead with action, not navigation
2. **One primary action per screen** - Single dominant CTA in hero
3. **Progress > status** - Numbers must have implication, not just display
4. **Coach mindset > admin mindset** - Language supports decisions
5. **Graceful degradation** - Fallback data when API fails

---

## State Machine Pattern

Each hub should have a state machine that determines the current state and primary action.

### Example States (Coach Dashboard)

```typescript
type CoachDashboardState =
  | 'unreviewed_sessions'      // Priority 1: Sessions need review
  | 'pending_player_approvals' // Priority 2: Players need confirmation
  | 'tournament_prep'          // Priority 3: Tournaments <14 days
  | 'today_sessions'           // Priority 4: Sessions today
  | 'players_inactive'         // Priority 5: Players inactive >14 days
  | 'all_clear';               // Default: No immediate action

interface PrimaryAction {
  headline: string;    // "3 sessions need review"
  subtext: string;     // "Erik, Sofie, and Jonas completed sessions this week"
  ctaLabel: string;    // "Review Sessions"
  ctaHref: string;     // "/coach/sessions?filter=needs-review"
  urgency: 'high' | 'medium' | 'low';
}
```

### State Priority Rules

States are evaluated in priority order. First matching state wins:

```typescript
function computeState(data: DashboardData): State {
  // Priority 1: Most urgent
  if (data.unreviewedSessions.length > 0) return 'unreviewed_sessions';

  // Priority 2
  if (data.pendingApprovals.length > 0) return 'pending_player_approvals';

  // Priority 3
  if (data.upcomingTournaments.some(t => t.daysUntil < 14)) return 'tournament_prep';

  // Priority 4
  if (data.todaySessions.length > 0) return 'today_sessions';

  // Priority 5
  if (data.inactivePlayers.length > 0) return 'players_inactive';

  // Default
  return 'all_clear';
}
```

---

## Component Structure

### Required Components per Hub

```
features/[area]-dashboard/
├── types.ts                    # TypeScript interfaces
├── hooks/
│   ├── use[Area]Dashboard.ts   # Main data hook
│   └── use[Area]AttentionCount.ts  # Lightweight badge hook
└── components/
    ├── [Area]HeroDecisionCard.tsx  # Layer 1
    ├── [Primary]Panel.tsx          # Layer 2 left
    ├── [Secondary]Card.tsx         # Layer 2 right
    └── [Area]OperationsSection.tsx # Layer 3
```

### Backend API Structure

```
api/v1/[area]-dashboard/
├── index.ts      # Route definitions
├── types.ts      # TypeScript interfaces
├── schema.ts     # JSON Schema validation
└── service.ts    # Business logic + state machine
```

---

## Hook Pattern

### Main Dashboard Hook

```typescript
export function use[Area]Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/v1/[area]-dashboard');
      setData(response);
      setError(null);
    } catch (err) {
      setError('Could not load dashboard');
      // Keep existing data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Always provide fallback data
  const dashboardData = data || getFallbackData();

  return { data: dashboardData, isLoading, error, refetch: fetchData };
}
```

### Attention Count Hook (for sidebar badge)

```typescript
export function use[Area]AttentionCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await apiClient.get('/api/v1/[area]-dashboard/attention-count');
        setCount(response.count);
      } catch {
        // Silent fail for badge
      }
    };
    fetchCount();
  }, []);

  return count;
}
```

---

## Visual Design Tokens

From `UI_CANON.md`:

### Colors

```css
/* Primary */
--tier-navy: #0A2540;
--tier-gold: #C9A227;

/* Surfaces */
--tier-surface-base: #F9FAFB;
--tier-surface-subtle: #F3F4F6;
--tier-white: #FFFFFF;

/* Text */
--tier-text-primary: #111827;
--tier-text-secondary: #6B7280;
--tier-text-tertiary: #9CA3AF;

/* Status */
--success: #059669;
--warning: #D97706;
--danger: #EF4444;
```

### Component Patterns

```tsx
// Hero Card
<div className="bg-white rounded-xl p-6 shadow-sm">
  ...
</div>

// Control Panel Card
<div className="bg-white rounded-xl p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-tier-text-primary mb-4">
    Panel Title
  </h3>
  ...
</div>

// Primary CTA Button
<Link
  to={primaryAction.ctaHref}
  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors"
>
  {primaryAction.ctaLabel}
</Link>
```

---

## Implementation Checklist

For each hub page update:

### Phase 1: Backend

- [ ] Create `api/v1/[area]-dashboard/types.ts` with interfaces
- [ ] Create `api/v1/[area]-dashboard/service.ts` with state machine
- [ ] Create `api/v1/[area]-dashboard/schema.ts` with validation
- [ ] Create `api/v1/[area]-dashboard/index.ts` with routes
- [ ] Register routes in `app.ts`

### Phase 2: Frontend

- [ ] Create `features/[area]-dashboard/types.ts`
- [ ] Create `features/[area]-dashboard/hooks/use[Area]Dashboard.ts`
- [ ] Create `features/[area]-dashboard/components/[Area]HeroDecisionCard.tsx`
- [ ] Create Layer 2 panels (context-specific)
- [ ] Create `features/[area]-dashboard/components/[Area]OperationsSection.tsx`
- [ ] Update hub page to use new components

### Phase 3: Integration

- [ ] Wire attention count to sidebar badge (if applicable)
- [ ] Add loading skeletons
- [ ] Add error states with retry
- [ ] Test fallback data behavior

---

## Coach Module Pages to Update

| Current Page | Hub Area | Primary Question | State Machine Focus |
|--------------|----------|------------------|---------------------|
| `CoachDashboard.tsx` | Home | What coaching action now? | ✅ DONE |
| `CoachSpillereHub.tsx` | Players | Which player needs attention? | Player health/progress |
| `CoachAnalyseHub.tsx` | Analysis | What data should I review? | New stats, templates |
| `CoachPlanHub.tsx` | Plan | What scheduling action? | Calendar, bookings |
| `CoachMerHub.tsx` | More | What admin task? | Messages, settings |

---

## Example: Players Hub Transformation

### Before (Current Pattern)

```tsx
<CoachHubPage
  area={area}
  title="Players"
  quickStats={[
    { label: 'Total Players', value: 24 },
    { label: 'Active This Month', value: 18 },
  ]}
  featuredAction={{
    label: 'View All Players',
    href: '/coach/athletes',
  }}
/>
```

### After (Decision-First Pattern)

```tsx
<div className="min-h-screen bg-tier-surface-base">
  <PageHeader title="Players" subtitle="Your athlete management" />

  <PageContainer paddingY="lg" background="base">
    {/* Layer 1 - Decision */}
    <section className="mb-8">
      <PlayersHeroDecisionCard
        data={dashboardData}
        coachName={coachName}
      />
    </section>

    {/* Layer 2 - Control */}
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayersNeedingAttentionPanel players={dashboardData.needsAttention} />
        <PlayerLoadCard stats={dashboardData.playerStats} />
      </div>
    </section>

    {/* Layer 3 - Operations */}
    <section>
      <PlayersOperationsSection />
    </section>
  </PageContainer>
</div>
```

### Players State Machine

```typescript
type PlayersHubState =
  | 'players_need_feedback'    // Players awaiting session feedback
  | 'plans_expiring'           // Training plans expiring soon
  | 'inactive_players'         // No activity >14 days
  | 'new_player_onboarding'    // New players need setup
  | 'all_players_healthy';     // No issues

function computePlayersState(data: PlayersDashboardData): PlayersHubState {
  if (data.playersNeedingFeedback.length > 0) return 'players_need_feedback';
  if (data.expiringPlans.length > 0) return 'plans_expiring';
  if (data.inactivePlayers.length > 0) return 'inactive_players';
  if (data.newPlayers.length > 0) return 'new_player_onboarding';
  return 'all_players_healthy';
}
```

---

## Example: Analysis Hub Transformation

### Analysis State Machine

```typescript
type AnalysisHubState =
  | 'new_session_data'       // Recent sessions with data to review
  | 'benchmark_due'          // Upcoming benchmark tests
  | 'template_needs_update'  // Templates outdated
  | 'stats_available';       // Default: view stats

function computeAnalysisState(data: AnalysisDashboardData): AnalysisHubState {
  if (data.sessionsNeedingAnalysis.length > 0) return 'new_session_data';
  if (data.upcomingBenchmarks.length > 0) return 'benchmark_due';
  if (data.outdatedTemplates.length > 0) return 'template_needs_update';
  return 'stats_available';
}
```

---

## Example: Plan Hub Transformation

### Plan State Machine

```typescript
type PlanHubState =
  | 'pending_bookings'        // Booking requests awaiting response
  | 'today_sessions'          // Sessions scheduled today
  | 'upcoming_tournaments'    // Tournaments <14 days
  | 'schedule_gaps'           // Calendar gaps needing attention
  | 'calendar_healthy';       // No scheduling issues

function computePlanState(data: PlanDashboardData): PlanHubState {
  if (data.pendingBookings.length > 0) return 'pending_bookings';
  if (data.todaySessions.length > 0) return 'today_sessions';
  if (data.upcomingTournaments.some(t => t.daysUntil < 14)) return 'upcoming_tournaments';
  if (data.scheduleGaps.length > 0) return 'schedule_gaps';
  return 'calendar_healthy';
}
```

---

## Example: More Hub Transformation

### More State Machine

```typescript
type MoreHubState =
  | 'unread_messages'         // Messages needing response
  | 'pending_requests'        // Change requests from players
  | 'notifications_pending'   // Important notifications
  | 'all_clear';              // No admin items

function computeMoreState(data: MoreDashboardData): MoreHubState {
  if (data.unreadMessages > 0) return 'unread_messages';
  if (data.pendingRequests.length > 0) return 'pending_requests';
  if (data.importantNotifications.length > 0) return 'notifications_pending';
  return 'all_clear';
}
```

---

## Testing Requirements

### Backend Tests

```typescript
describe('[Area]DashboardService', () => {
  describe('computeState', () => {
    it('returns highest priority state', () => {});
    it('returns all_clear when no issues', () => {});
  });

  describe('getPrimaryAction', () => {
    it('generates correct CTA for each state', () => {});
  });

  describe('getAttentionCount', () => {
    it('counts all attention items', () => {});
  });
});
```

### Frontend Tests

```typescript
describe('use[Area]Dashboard', () => {
  it('provides fallback data on error', () => {});
  it('refetch updates data', () => {});
});

describe('[Area]HeroDecisionCard', () => {
  it('displays primary action based on state', () => {});
  it('shows attention badge when count > 0', () => {});
});
```

---

## Migration Strategy

### Recommended Order

1. **CoachSpillereHub** (Players) - High value, clear state machine
2. **CoachPlanHub** (Plan) - Calendar/booking focus
3. **CoachAnalyseHub** (Analysis) - Stats/data focus
4. **CoachMerHub** (More) - Admin/settings

### Per-Hub Timeline

1. Backend API: ~2-3 hours
2. Frontend components: ~3-4 hours
3. Testing: ~1-2 hours
4. Integration & polish: ~1 hour

**Total per hub: ~8-10 hours**

---

## References

- `apps/web/src/features/coach-dashboard/CoachDashboard.tsx` - Reference implementation
- `apps/web/src/features/hub-pages/PlanHub.tsx` - Player reference
- `apps/api/src/api/v1/coach-plan-dashboard/` - Backend reference
- `docs/UI_CANON.md` - Design system tokens
- `docs/specs/SCREEN_RESPONSIBILITIES.md` - Screen architecture

---

*This guide should be updated as patterns evolve.*
