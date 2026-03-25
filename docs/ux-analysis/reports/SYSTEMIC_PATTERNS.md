# Systemic UX Patterns Analysis
## TIER Golf Platform - Phase 3B Report

**Generated:** 2026-01-13T03:05:00Z
**Based on:** 26 pages analyzed with 11-point JTBD framework
**Coverage:** Player (16 pages) + Coach (10 pages)

---

## Executive Summary

Analysis of 26 high-impact pages reveals **strong foundational UX** with **3 critical systemic issues** that block production readiness:

1. **Mock data fallbacks** - Silent data corruption when APIs fail
2. **Incomplete API integration** - 27% of pages show fake data
3. **Missing feedback loops** - Users uncertain if actions succeeded

**Good news:** 11 pages (42%) are production-ready with scores ≥9. The platform has solid design patterns and clear JTBD alignment.

---

## Critical Anti-Patterns (Must Fix)

### 🚨 CRITICAL: Mock Data Fallback on Error

**Pattern:** `try { API call } catch { show mock data }`
**Pages:** coach-stats-overview, coach-groups
**Severity:** CRITICAL

**Why it's dangerous:**
- Coach sees fake player stats when API fails → makes decisions on false data
- Silent failure → no indication data is stale/fake
- Production corruption risk → users lose trust when they discover fake data

**Fix:**
```typescript
// ❌ ANTI-PATTERN
try {
  const data = await apiClient.get('/players/stats');
  setPlayers(data);
} catch (error) {
  setPlayers(MOCK_DATA); // Silent corruption!
}

// ✅ CORRECT PATTERN
try {
  const data = await apiClient.get('/players/stats');
  setPlayers(data);
} catch (error) {
  setError(error.message);
  // Show StateCard with retry button
}
```

**Impact if not fixed:** Loss of user trust, incorrect coaching decisions, data integrity issues.

---

### 🔴 HIGH: Hardcoded Mock Data (No API)

**Pattern:** Entire pages render static mock data
**Pages:** player-trening-hub, coach-spillere-hub, coach-analyse-hub, player-analyse-prestasjoner, player-trening-video-hub (7 pages total)
**Severity:** HIGH

**Why it blocks production:**
- Features are non-functional demos
- Users cannot see their real data
- Looks good but doesn't work

**Example pages:**
- `player-trening-video-hub` - All 4 tabs are placeholders
- `player-analyse-prestasjoner` - Shows static stats, not real performance
- `coach-spillere-hub` - Mock player list

**Fix:** Complete API integration for each page. Minimum viable:
1. Load real data from API
2. Handle loading state
3. Handle empty state
4. Handle error state with retry

**Timeline:** Must complete before beta/production launch.

---

### 🟡 MEDIUM: Missing Success Feedback

**Pattern:** Mutations execute without confirmation
**Pages:** 7 pages including player-plan-maal, player-plan-booking, coach-groups
**Severity:** MEDIUM

**User experience:**
- Click "Save goal" → nothing happens → did it save?
- Click "Book session" → page stays same → was booking created?
- Click "Delete" → item disappears → but was it deleted from DB?

**Fix:** Add toast notifications:
```typescript
const { mutate: createGoal } = useCreateGoal({
  onSuccess: () => {
    toast.success('Mål opprettet!');
  },
  onError: (error) => {
    toast.error(`Kunne ikke opprette mål: ${error.message}`);
  }
});
```

**Pattern to adopt:** shadcn/ui toast component (already in codebase)

---

### 🟡 MEDIUM: Vanity Metrics Dashboard

**Pattern:** Stats that don't guide decisions
**Pages:** 6 pages including coach-dashboard, player-trening-hub, coach-groups
**Severity:** MEDIUM

**Examples of vanity metrics:**
- "Totalt grupper: 12" → So what? Should I create more? Delete some?
- "Økter: 45" → Is that good? Up or down from last month?
- "Spillere: 18" → Are they active? Do they need attention?

**Leading indicator alternatives:**

| ❌ Vanity | ✅ Actionable Leading Indicator |
|-----------|-------------------------------|
| "12 grupper" | "3 grupper uten treningsplan" |
| "45 økter" | "5 spillere ikke trent på 14+ dager" |
| "18 spillere" | "4 spillere med fallende progresjon" |

**Fix:** Replace count metrics with:
1. **At-risk indicators** (what needs attention NOW)
2. **Trend indicators** (improving/declining/stable)
3. **Target progress** (X of Y goals completed)

---

## Good Patterns (To Replicate)

### ✅ Pattern: Decision-First Hub Pages

**Best example:** `player-plan-hub` (score: 10/10)

**What makes it excellent:**
- 3-layer hierarchy: Quick actions → Weekly view → Details
- JTBD clarity score: 10/10 - "What should I do this week?" obvious in 5 seconds
- Decision ratio: 0.67 (strongly action-oriented)
- Progressive disclosure: See overview → drill down only if needed

**Pages that nail this pattern:**
- player-plan-hub
- player-dashboard
- coach-athletes

**Replication checklist:**
- [ ] Primary decision stated in header
- [ ] Quick actions above the fold
- [ ] Progressive disclosure (summary → details)
- [ ] Empty states with CTAs
- [ ] Loading skeletons

---

### ✅ Pattern: Dual-Mode Views (Calendar + List)

**Best examples:** `player-plan-booking`, `coach-booking`

**UX benefit:**
- Tab 1: See availability (calendar view)
- Tab 2: Manage bookings (list view)
- Minimal navigation - both modes on one page

**When to use:** Any feature with temporal + list aspects (booking, sessions, goals with deadlines)

---

### ✅ Pattern: Collapsible Filter Drawers

**Best examples:** `player-trening-okter`, `player-plan-turneringer`

**UX benefit:**
- Search bar always visible
- Filters hidden by default (clean UI)
- Filter button shows active filter dot
- Expand for 5-10 advanced filters

**Implementation:**
```tsx
<Collapsible open={isOpen}>
  <CollapsibleTrigger>
    <Button variant={hasFilters ? 'default' : 'outline'}>
      <Filter /> Filter
      {hasFilters && <Badge />}
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <Card>{/* Filter controls */}</Card>
  </CollapsibleContent>
</Collapsible>
```

**Adoption:** Only 2/26 pages use this. **Recommendation:** Standardize for all list pages.

---

### ✅ Pattern: URL-Persisted Filter State

**Best example:** `player-plan-turneringer`

**UX benefit:**
- Filters persist in URL query params
- Share filtered view via URL
- Browser back/forward works correctly
- Bookmarkable search results

**Implementation:** `useFilterState` custom hook

**Adoption:** Only 2/26 pages. **Recommendation:** Add to all filterable pages.

---

### ✅ Pattern: Real-Time Smart Routing

**Best example:** `player-trening-okter`

**Logic:**
```typescript
if (session.status === 'in_progress') {
  navigate(`/session/${id}/evaluate`); // Continue session
} else {
  navigate(`/session/${id}`); // View details
}
```

**UX benefit:** One click does the right thing based on state.

---

### ✅ Pattern: AI Coach Integration

**Example:** `player-trening-okter` uses `AICoachGuide` component

**Adoption:** Only 1/26 pages. This is a new feature.

**Recommendation:** Add contextual AI Coach guides to all hub pages:
- player-dashboard → Daily goals guide
- player-plan-hub → Weekly planning guide
- coach-athletes → Player progress guide

---

## Architecture Migration Status

### Pattern Evolution

| Pattern | Current | Target | Migration |
|---------|---------|--------|-----------|
| PageHeader + PageContainer | 69% (18 pages) | 0% | → Page component |
| Page component (new) | 15% (4 pages) | 80% | ↗ Migrating |
| Custom layouts | 15% (4 pages) | 20% | → OK for special cases |

**Recommendation:** Continue migration, target 80% on new pattern by Q2 2026.

---

### Data Fetching Status

| Strategy | Current | Target |
|----------|---------|--------|
| Real API with hooks | 62% (16 pages) | 100% |
| Hardcoded mock data | 27% (7 pages) | 0% |
| Mock fallback on error | 12% (3 pages) | 0% |

**Critical path:** Move all pages to 100% real API before production.

---

### State Handling Coverage

| Coverage Level | Current | Target |
|---------------|---------|--------|
| Comprehensive (L/E/Em) | 46% (12 pages) | 100% |
| Partial (1-2 states) | 23% (6 pages) | 0% |
| Missing | 31% (8 pages) | 0% |

**L/E/Em:** Loading, Error, Empty states

**Recommendation:** Add StateCard to all pages, enforce via linting rule.

---

## JTBD Framework Results

### Clarity Scores Distribution

- **Excellent (9-10):** 11 pages (42%) - JTBD obvious in 5 seconds
- **Good (7-8):** 12 pages (46%) - JTBD clear but takes 10-15 seconds
- **Poor (<7):** 3 pages (12%) - JTBD unclear

**Average score:** 8.3/10 (GOOD)

**Pages needing improvement (<7):**
- coach-stats-overview (7) - Too info-heavy, unclear action
- player-analyse-prestasjoner (6) - Mock data, unclear value
- player-trening-video-hub (8) - Placeholder tabs confuse purpose

---

### Decision vs Information Ratio

**Optimal range:** 0.4-0.6 (balanced decision/info for daily-use pages)

| Range | Pages | Assessment |
|-------|-------|------------|
| ≥0.6 (decision-heavy) | 8 pages | Excellent for action pages |
| 0.4-0.6 (balanced) | 14 pages | Good for mixed pages |
| <0.4 (info-heavy) | 4 pages | Too passive, add actions |

**Average ratio:** 0.54 (GOOD - balanced)

**Recommendation:** Info-heavy pages should add inline actions to increase ratio to 0.4+.

---

### KPI Quality Analysis

**Actionable vs Vanity Metrics:**

- **Excellent (≥75% actionable):** 12 pages (46%)
- **Moderate (40-74%):** 9 pages (35%)
- **Vanity-heavy (<40%):** 5 pages (19%)

**Most common vanity metrics:**
1. Total counts (sessions, groups, players) - 60% of pages
2. Average scores without context - 30% of pages
3. Static dates without urgency - 20% of pages

**Leading indicator examples from excellent pages:**
- `player-plan-hub`: "3 goals at risk this week" (actionable)
- `coach-booking`: "5 pending bookings" (need action)
- `player-plan-turneringer`: "3 tournaments closing registration soon" (urgency)

---

## Language & Mental Model

### Action-Oriented vs System-Oriented

**Average coach action percentage:** 0.62 (GOOD)

**Interpretation:**
- 0.7-1.0: Excellent - action verbs, player-centric
- 0.5-0.7: Good - mix of action and system language
- <0.5: Poor - too much system jargon

**Best examples:**
- player-plan-maal: "Opprett mål", "Fullfør", "Se framgang" (0.8)
- coach-planning: "Lag plan", "Se plan", "Oppdater" (0.8)

**Needs improvement:**
- coach-stats-overview: "Se detaljer", "Sorter", "Filtrer" (0.4) - too passive

**Recommendation:** Increase action verb usage, especially on coach pages.

---

### Language Consistency Issues

**Norwegian/English Mix:** Detected on 6/26 pages

**Examples:**
- "Laster samtaler..." mixed with English code
- "Se detaljer" vs "View details" inconsistency

**Fix:** Enforce Norwegian for all UI text (per CLAUDE.md policy reversal for UI).

---

## Flow & Navigation Cost

### Click Efficiency

**From dashboard to key actions:**

| Action | Average Clicks | Target |
|--------|---------------|--------|
| View player details | 2 | ≤2 ✅ |
| Create new goal | 2 | ≤2 ✅ |
| Book session | 2 | ≤2 ✅ |
| Filter list | 1 | 1 ✅ |
| Create plan | 3 | ≤3 ✅ |

**Assessment:** Navigation cost is GOOD. Most actions are 1-2 clicks from hub pages.

**One improvement opportunity:**
- Add "Quick add" widgets on dashboard to reduce common actions from 2 → 1 click

---

## Mobile Responsiveness

**All 26 pages** have mobile layouts with breakpoints.

**Common patterns:**
- Grid collapses: `grid-cols-3 md:grid-cols-2 lg:grid-cols-3`
- Two-panel → single panel on mobile
- Collapsible navigation/filters

**Assessment:** GOOD mobile support across the board.

---

## Accessibility Gaps

### Current State:

- **Semantic HTML:** 100% (26/26) ✅
- **Keyboard nav:** 85% (22/26) - good use of button elements
- **ARIA labels:** 15% (4/26) ❌ - major gap
- **Screen reader tested:** Unknown

**Recommendation:**
1. Add aria-label to all icon-only buttons
2. Add aria-describedby to complex interactions
3. Run axe-core accessibility audit
4. Test with screen reader (NVDA/JAWS/VoiceOver)

---

## Design System Compliance

### Component Usage:

**Good adoption:**
- PageHeader: 69%
- StateCard: 46%
- Button primitives: 100%
- Card components: 100%

**Low adoption:**
- Modal component: 15% (many use browser confirm() ❌)
- Toast notifications: 0% (major gap ❌)
- Badge components: 65%
- Loading skeletons: 40%

**Recommendation:**
1. Replace all `confirm()` with Modal component
2. Add toast library (shadcn/ui sonner)
3. Create skeleton variants for all card types

---

## Production Readiness Scorecard

### Pages Ready for Production (Score ≥9): 11/26 (42%)

✅ **Production-Ready:**
- player-plan-hub
- coach-athletes
- player-dashboard
- player-onboarding
- coach-booking
- player-plan-maal
- player-plan-booking
- player-trening-teknikkplan
- player-mer-meldinger
- player-plan-turneringer
- player-trening-okter

### Blocker Issues by Page:

**HIGH PRIORITY (Blocks production):**
- player-trening-hub: Mock data only
- coach-spillere-hub: Mock data only
- coach-analyse-hub: Mock data only
- player-analyse-prestasjoner: Mock data only
- player-trening-video-hub: All placeholder tabs
- coach-stats-overview: Mock fallback on error
- coach-groups: Mock fallback on error

**MEDIUM PRIORITY (Polish needed):**
- player-analyse-statistikk: No success feedback
- player-plan-kalender: Missing inline actions
- coach-planning: Groups tab placeholder

---

## Quick Wins (High Impact, Low Effort)

### 1. Add Toast Notifications (2-4 hours)

**Impact:** Massive UX improvement
**Effort:** Low - shadcn/ui sonner already available

**Implementation:**
```bash
# Install sonner
pnpm add sonner

# Add to root layout
import { Toaster } from 'sonner';
<Toaster position="top-right" />

# Use in mutations
import { toast } from 'sonner';
toast.success('Mål lagret!');
```

**Affected pages:** 7 pages immediately benefit

---

### 2. Remove Mock Data Fallbacks (1 hour)

**Impact:** Prevents silent data corruption
**Effort:** Low - just delete the fallback code

**Pages:** coach-stats-overview, coach-groups

---

### 3. Replace browser confirm() with Modal (4 hours)

**Impact:** Consistent UX
**Effort:** Low - Modal component exists

**Template:**
```tsx
const [itemToDelete, setItemToDelete] = useState(null);

<Modal
  isOpen={!!itemToDelete}
  onClose={() => setItemToDelete(null)}
  title="Bekreft sletting"
  footer={
    <>
      <Button variant="secondary" onClick={() => setItemToDelete(null)}>
        Avbryt
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Slett
      </Button>
    </>
  }
>
  Er du sikker?
</Modal>
```

---

### 4. Add Empty State CTAs (2 hours)

**Impact:** Guides new users
**Effort:** Low - use existing StateCard pattern

**Affected pages:** 8 pages missing empty states

---

### 5. Standardize Loading Skeletons (4 hours)

**Impact:** Professional feel
**Effort:** Low - create reusable skeletons

**Pattern:**
```tsx
{loading ? (
  <SessionCardSkeleton count={5} />
) : (
  <SessionList sessions={sessions} />
)}
```

---

## Recommendations by Priority

### P0 (Critical - Before Production)

1. ✅ Remove all mock data fallbacks
2. ✅ Complete API integration for placeholder pages
3. ✅ Add error boundaries to all pages
4. ✅ Add StateCard for loading/error/empty to all pages

**Estimated effort:** 40-60 hours

---

### P1 (High - Before Beta)

1. ✅ Add toast notifications for all mutations
2. ✅ Replace browser confirm() with Modal component
3. ✅ Replace vanity metrics with actionable leading indicators
4. ✅ Add accessibility labels (aria-label) to interactive elements

**Estimated effort:** 20-30 hours

---

### P2 (Medium - Nice to Have)

1. ✅ Migrate remaining pages to Page component architecture
2. ✅ Add URL state persistence to all filterable pages
3. ✅ Standardize collapsible filter pattern
4. ✅ Add pagination to all long lists
5. ✅ Add AI Coach guides to all hub pages

**Estimated effort:** 40-50 hours

---

## Conclusion

### Strengths
- Strong foundational UX with clear JTBD alignment (avg 8.3/10)
- 42% of pages production-ready (score ≥9)
- Good navigation cost (most actions 1-2 clicks)
- Consistent component patterns emerging

### Weaknesses
- Mock data fallbacks create silent failures (critical)
- 27% of pages not connected to real APIs (blocker)
- Missing success feedback (polish issue)
- Vanity metrics don't guide decisions (UX issue)

### Path to Production
1. Fix critical issues (40-60h): Remove fallbacks, complete API integration
2. Add polish (20-30h): Toasts, modals, loading states
3. Optional improvements (40-50h): Architecture migration, advanced features

**Total effort to production-ready:** 100-140 hours (2-3 weeks for 1 developer)

---

**Next Phase:** FASE 4 - Improvement Plan Generation (detailed fix plans per page)
