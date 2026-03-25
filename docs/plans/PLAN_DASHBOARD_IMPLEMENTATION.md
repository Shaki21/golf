# Plan Dashboard Implementation Plan

**Dato:** 12. januar 2026
**Mål:** Fullføre McKinsey-grade decision-first Plan dashboard
**Tidsfrist:** I natt

---

## Oversikt

### Allerede ferdig (UI-lag)
- [x] `PlanHeroDecisionCard` - Decision hero med primary CTA
- [x] `GoalsControlPanel` - Mål med leading indicators
- [x] `LoadAndReadinessCard` - Belastning og varsler
- [x] `OperationsSection` - Collapsible admin-verktøy
- [x] `usePlanDashboard` hook - State machine med mock data
- [x] `PlanHub.tsx` - 3-lags dashboard layout
- [x] Sidebar attention badge - UI ferdig, ikke wired

### Gjenstår
- [ ] FASE 1: Backend API
- [ ] FASE 2: Frontend integration
- [ ] FASE 3: Testing

---

## FASE 1: Backend API

### 1.1 Database Query Functions

**Fil:** `apps/api/src/domain/plan/plan-dashboard.service.ts`

```typescript
// Funksjoner som må implementeres:
- getNextSession(playerId: string): Promise<UpcomingSession | null>
- getActiveGoals(playerId: string, limit: number): Promise<PlanGoal[]>
- getWeeklyLoadStats(playerId: string): Promise<LoadStats>
- getUpcomingTournaments(playerId: string, daysAhead: number): Promise<Tournament[]>
- computeAttentionItems(playerId: string): Promise<AttentionItem[]>
- getMissingLogCount(playerId: string): Promise<number>
```

### 1.2 API Endpoint

**Fil:** `apps/api/src/api/v1/plan/dashboard.ts`

```
GET /api/v1/plan/dashboard

Response:
{
  state: 'session_upcoming' | 'missing_log' | 'plan_not_confirmed' | 'tournament_soon' | 'no_sessions',
  primaryAction: {
    type: string,
    label: string,
    href: string,
    context: string
  },
  nextSession: { ... } | null,
  goals: [ ... ],  // max 3, at-risk first
  loadStats: {
    planned: number,
    completed: number,
    missingPurpose: number
  },
  upcomingTournament: { ... } | null,
  attentionItems: [ ... ],
  missingLogs: number
}
```

### 1.3 Prisma Queries

Bruk eksisterende modeller:
- `TrainingSession` - for økter og logging
- `Goal` - for mål og progress
- `Tournament` / `TournamentRegistration` - for turneringer
- `WeeklyPlan` / `WeeklyPlanConfirmation` - for plan-bekreftelse

### Oppgaver Fase 1

| # | Oppgave | Fil | Avhengighet |
|---|---------|-----|-------------|
| 1.1 | Opprett plan-dashboard.service.ts | `apps/api/src/domain/plan/` | - |
| 1.2 | Implementer getNextSession() | service | Prisma TrainingSession |
| 1.3 | Implementer getActiveGoals() | service | Prisma Goal |
| 1.4 | Implementer getWeeklyLoadStats() | service | Prisma TrainingSession |
| 1.5 | Implementer getUpcomingTournaments() | service | Prisma Tournament |
| 1.6 | Implementer computeAttentionItems() | service | Alle over |
| 1.7 | Implementer getMissingLogCount() | service | Prisma TrainingSession |
| 1.8 | Opprett API route GET /plan/dashboard | `apps/api/src/api/v1/plan/` | service |
| 1.9 | Legg til route i index.ts | `apps/api/src/api/v1/plan/index.ts` | route |

---

## FASE 2: Frontend Integration

### 2.1 API Client

**Fil:** `apps/web/src/features/plan/api/plan-dashboard.api.ts`

```typescript
export async function fetchPlanDashboard(): Promise<PlanDashboardData> {
  const response = await apiClient.get('/plan/dashboard');
  return response.data;
}
```

### 2.2 React Query Hook

**Fil:** `apps/web/src/features/plan/hooks/usePlanDashboardQuery.ts`

```typescript
export function usePlanDashboardQuery() {
  return useQuery({
    queryKey: ['plan', 'dashboard'],
    queryFn: fetchPlanDashboard,
    staleTime: 30 * 1000, // 30 sekunder
    refetchOnWindowFocus: true,
  });
}
```

### 2.3 Oppdater usePlanDashboard

Bytt fra mock data til API-kall, behold fallback for loading state.

### 2.4 Wire Sidebar Attention Badge

**Fil:** `apps/web/src/components/layout/PlayerAppShellV3.tsx`

```typescript
// Legg til:
const { data: planData } = usePlanDashboardQuery();
const planAttentionCount = planData?.attentionItems.filter(
  i => i.severity === 'warning' || i.severity === 'error'
).length ?? 0;

// Pass til sidebar:
<PlayerSidebarV3 planAttentionCount={planAttentionCount} ... />
```

### 2.5 Loading & Error States

Oppdater PlanHub.tsx med:
- Skeleton loading state
- Error boundary
- Empty states

### Oppgaver Fase 2

| # | Oppgave | Fil | Avhengighet |
|---|---------|-----|-------------|
| 2.1 | Opprett plan-dashboard.api.ts | `features/plan/api/` | Fase 1 ferdig |
| 2.2 | Opprett usePlanDashboardQuery hook | `features/plan/hooks/` | 2.1 |
| 2.3 | Oppdater usePlanDashboard med API | `features/plan/hooks/` | 2.2 |
| 2.4 | Legg til loading skeleton | `features/plan/components/` | - |
| 2.5 | Wire planAttentionCount til sidebar | `PlayerAppShellV3.tsx` | 2.2 |
| 2.6 | Test i nettleser | - | Alle over |

---

## FASE 3: Testing

### 3.1 Unit Tests

**Fil:** `apps/web/src/features/plan/__tests__/usePlanDashboard.test.ts`

```typescript
// Test state machine prioritering:
describe('usePlanDashboard state machine', () => {
  it('prioritizes missing_log over session_upcoming')
  it('prioritizes plan_not_confirmed over tournament_soon')
  it('returns no_sessions when no data')
  it('limits goals to 3 with at_risk first')
  it('computes attention count correctly')
});
```

### 3.2 Component Tests

**Fil:** `apps/web/src/features/plan/__tests__/PlanHeroDecisionCard.test.tsx`

```typescript
describe('PlanHeroDecisionCard', () => {
  it('renders exactly one primary CTA')
  it('shows correct greeting based on time of day')
  it('displays attention badge when items exist')
  it('shows session preview for session_upcoming state')
});
```

### 3.3 Integration Test

**Fil:** `apps/api/src/api/v1/plan/__tests__/dashboard.test.ts`

```typescript
describe('GET /api/v1/plan/dashboard', () => {
  it('returns valid dashboard structure')
  it('requires authentication')
  it('returns player-specific data')
});
```

### Oppgaver Fase 3

| # | Oppgave | Fil | Avhengighet |
|---|---------|-----|-------------|
| 3.1 | Unit test for state machine | `__tests__/usePlanDashboard.test.ts` | - |
| 3.2 | Component test for hero card | `__tests__/PlanHeroDecisionCard.test.tsx` | - |
| 3.3 | Component test for goals panel | `__tests__/GoalsControlPanel.test.tsx` | - |
| 3.4 | API integration test | `api/v1/plan/__tests__/` | Fase 1 |
| 3.5 | Sidebar badge test | `__tests__/PlayerSidebarV3.test.tsx` | Fase 2 |

---

## Acceptance Criteria Checklist

| Kriterie | Test | Status |
|----------|------|--------|
| Primary CTA alltid synlig, kun én | Component test | ⬜ |
| Badge kun for definerte attention states | Unit test | ⬜ |
| Top section kommuniserer action i <5 sek | Manuell + test | ⬜ |
| Goals begrenset til 3, at-risk først | Unit test | ⬜ |
| Routing /plan bevart | Manuell | ✅ |
| TIER design tokens brukt | Manuell | ✅ |
| Memoized derived state | Code review | ✅ |
| ARIA labels for attention badge | Component test | ⬜ |
| Collapsible operations section | Manuell | ✅ |

---

## Kjøreplan

```
┌─────────────────────────────────────────────────────────┐
│ FASE 1: Backend (1-2 timer)                             │
├─────────────────────────────────────────────────────────┤
│ 1. Opprett service fil med alle queries                 │
│ 2. Implementer hver query funksjon                      │
│ 3. Opprett API endpoint                                 │
│ 4. Test med curl/Postman                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 2: Frontend Integration (1 time)                   │
├─────────────────────────────────────────────────────────┤
│ 1. Opprett API client og React Query hook               │
│ 2. Bytt ut mock data                                    │
│ 3. Wire sidebar badge                                   │
│ 4. Legg til loading states                              │
│ 5. Test i nettleser                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 3: Testing (1 time)                                │
├─────────────────────────────────────────────────────────┤
│ 1. Unit tests for state machine                         │
│ 2. Component tests for acceptance criteria              │
│ 3. API integration test                                 │
│ 4. Kjør alle tester, fiks eventuelle feil               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ COMMIT & DEPLOY                                         │
├─────────────────────────────────────────────────────────┤
│ 1. git add apps/web/src/features/plan/                  │
│ 2. git add apps/api/src/domain/plan/                    │
│ 3. git add apps/api/src/api/v1/plan/                    │
│ 4. Commit med beskrivende melding                       │
└─────────────────────────────────────────────────────────┘
```

---

## Notater

### Eksisterende Prisma-modeller å bruke
- `TrainingSession` - økter med status, dato, type
- `Goal` - mål med progress, status, target
- `Tournament` - turneringer med dato, lokasjon
- `TournamentRegistration` - spillerens påmeldinger
- `Player` - spillerdata

### Fallback-strategi
Hvis API ikke er tilgjengelig, bruk mock data (allerede implementert i hook).

### Performance
- React Query caching med 30s staleTime
- useMemo for derived state
- Unngå unødvendige re-renders

---

**Sist oppdatert:** 12. januar 2026 00:15
