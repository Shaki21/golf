# Phase 4 Extended: Expand Advanced Features

**Status:** Ready to Start
**Estimated Time:** 15-20 hours
**Priority:** P1 (High Value)

---

## 🎯 Objective

Expand the successful Phase 4 patterns to more pages:
- URL-persisted filters for shareable views
- Collapsible filter drawers with tier branding
- AI Coach Guides with premium design

---

## 📋 Sprint 4.5: URL Filters to More Pages (6 hours)

### Target Pages
1. **Player Dashboard** (`/dashboard`) - 1.5h
   - Date range filter
   - Goal category filter
   - Session type filter

2. **Tests Page** (`/analyse/tester`) - 1.5h
   - Test category filter
   - Date range filter
   - Status filter (completed/pending)

3. **Sessions Page** (`/trening/okter`) - 1.5h
   - Session type filter
   - Date range filter
   - Location filter (indoor/outdoor/course)

4. **Statistics Page** (`/analyse/statistikk`) - 1.5h
   - Metric type filter
   - Time period filter
   - Comparison mode filter

### Implementation Pattern
```tsx
// 1. Add useUrlFilters hook
const { filters, setFilter, clearFilters } = useUrlFilters({
  category: 'all',
  dateFrom: '',
  dateTo: '',
  type: 'all'
});

// 2. Apply filters to data
const filtered = items.filter(item => {
  if (filters.category !== 'all' && item.category !== filters.category) return false;
  if (filters.type !== 'all' && item.type !== filters.type) return false;
  return true;
});

// 3. Update filter controls
<select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
```

---

## 📋 Sprint 4.6: Collapsible Filters to More Pages (6 hours)

### Target Pages
1. **Coach Planning Hub** (`/coach/planning`) - 2h
   - Group filter
   - Date range filter
   - Plan status filter

2. **Coach Stats Overview** (`/coach/stats`) - 2h
   - Player selection filter
   - Time period filter
   - Metric type filter

3. **Video Hub** (`/trening/video-hub`) - 2h
   - Exercise type filter
   - Video category filter
   - Date uploaded filter

### Implementation Pattern
```tsx
// 1. Count active filters
const activeFilterCount = Object.entries(filters).filter(
  ([key, value]) => value !== 'all' && value !== ''
).length;

// 2. Add CollapsibleFilterDrawer
<CollapsibleFilterDrawer
  activeFilterCount={activeFilterCount}
  onClearAll={clearFilters}
>
  <FilterControl label="Group">
    <select value={filters.group} onChange={(e) => setFilter('group', e.target.value)}>
      {/* options */}
    </select>
  </FilterControl>
</CollapsibleFilterDrawer>
```

---

## 📋 Sprint 4.7: AI Coach Guides to More Pages (5 hours)

### Target Pages
1. **Player Dashboard** (`/dashboard`) - 1h
   - Guide preset: dashboard (already exists)
   - Context: Overall performance overview

2. **Tests Page** (`/analyse/tester`) - 1h
   - Guide preset: tests (already exists)
   - Context: Test results and analysis

3. **Statistics Page** (`/analyse/statistikk`) - 1h
   - Guide preset: statistics (already exists)
   - Context: Performance metrics

4. **Training Plans** (`/trening/teknikkplan`) - 1h
   - Guide preset: weeklyPlan (already exists)
   - Context: Training session planning

5. **Coach Planning Hub** (`/coach/planning`) - 1h
   - New preset: coachPlanning
   - Context: Group training management

### New Guide Preset Needed
```typescript
// Add to /features/ai-coach/types.ts
coachPlanning: {
  id: 'coach-planning',
  title: 'Training Plan Management',
  description: 'Plan and organize training sessions for your groups. I can help you create balanced programs.',
  suggestions: [
    'Create weekly training plan',
    'Balance workload across groups',
    'Suggest session variations',
  ],
  pageContext: 'coach-planning',
}
```

---

## 🎨 Design Consistency

All new implementations will follow Phase 4 patterns:

### Tier Branding
- Navy borders and backgrounds
- Gold accents for icons and badges
- Consistent spacing and shadows
- Smooth animations

### Accessibility
- Keyboard navigation support
- ARIA labels on all controls
- Screen reader friendly
- Focus indicators visible

---

## 📊 Expected Outcomes

### User Experience
- 7 more pages with shareable filter URLs
- 3 more pages with collapsible filters
- 5 more pages with AI Coach guidance
- Consistent UX patterns across platform

### Technical Benefits
- Reusing proven components
- No new patterns to learn
- Consistent codebase
- Easy to maintain

### Metrics
- Total pages with URL filters: 3 → 7 (133% increase)
- Total pages with collapsible filters: 2 → 5 (150% increase)
- Total pages with AI Coach guides: 2 → 7 (250% increase)

---

## 🧪 Testing Plan

### Per Page Testing
1. Add URL filters → verify URL updates
2. Refresh page → filters persist
3. Share URL → recipient sees same filters
4. Clear filters → URL resets
5. Browser back/forward → filter history works

### Visual Testing
1. Filter drawer has gold badge
2. AI Coach Guide has tier branding
3. All tier colors correct
4. Animations smooth
5. Mobile responsive

---

## 📅 Timeline

**Week 1:**
- Day 1: Sprint 4.5 - Pages 1-2 (Dashboard, Tests)
- Day 2: Sprint 4.5 - Pages 3-4 (Sessions, Statistics)

**Week 2:**
- Day 1: Sprint 4.6 - Coach Planning + Coach Stats
- Day 2: Sprint 4.6 - Video Hub + Sprint 4.7 Start

**Week 3:**
- Day 1: Sprint 4.7 - Complete all AI Coach Guides
- Day 2: Testing and documentation

---

## 🚀 Ready to Start

**First Sprint:** 4.5 - URL Filters to Player Dashboard

**Estimated Time:** 1.5 hours

**Steps:**
1. Identify current filter state in Dashboard
2. Replace useState with useUrlFilters
3. Update filter controls to use setFilter
4. Test URL persistence
5. Verify all filters work correctly

---

**Status:** Awaiting approval to proceed with Sprint 4.5
