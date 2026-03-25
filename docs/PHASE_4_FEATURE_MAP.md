# Phase 4: Feature Location Map

Quick reference for where each Phase 4 feature is implemented.

---

## 🗺️ Feature Locations

### Page Component Architecture

| Page | Path | Status |
|------|------|--------|
| Coach Athletes | `/coach/athletes` | ✅ Migrated |
| Future pages | TBD | 🔄 Ready to migrate |

**Files:**
- `/components/layout/Page.tsx` - Generic page wrapper
- `/features/coach-athlete-list/CoachAthleteList.tsx` - Example implementation

---

### URL-Persisted Filters

| Page | Path | Filter Parameters | Status |
|------|------|-------------------|--------|
| Coach Athletes | `/coach/athletes` | `?search=...` | ✅ |
| Goals | `/plan/maal` | `?view=...&category=...` | ✅ |
| Calendar | `/plan/kalender` | `?view=...` | ✅ |

**Files:**
- `/hooks/useUrlFilters.ts` - Shared hook (155 lines)
- `/features/coach-athlete-list/CoachAthleteList.tsx` - Search filter
- `/features/goals/Maalsetninger.tsx` - View + category filters
- `/features/calendar/Kalender.tsx` - View mode filter

**Example URLs:**
- `http://localhost:3000/coach/athletes?search=Anders`
- `http://localhost:3000/plan/maal?view=completed&category=puttespill`
- `http://localhost:3000/plan/kalender?view=week`

---

### Collapsible Filter Drawers

| Page | Path | Filters Inside | Status |
|------|------|----------------|--------|
| Goals | `/plan/maal` | View mode, Category | ✅ |
| Calendar | `/plan/kalender` | View mode (List/Week/Month) | ✅ |

**Files:**
- `/components/filters/CollapsibleFilterDrawer.tsx` - Reusable component (125 lines)
- `/features/goals/Maalsetninger.tsx` - Implementation (lines 927-972)
- `/features/calendar/Kalender.tsx` - Implementation

**Visual Features:**
- Gold Filter icon
- Gold badge showing active filter count
- Navy border with hover effect
- Animated expand/collapse
- "Clear all" button when filters active

---

### AI Coach Branding

| Page | Path | Guide Preset | Status |
|------|------|--------------|--------|
| Coach Athletes | `/coach/athletes` | `coachAthletes` | ✅ |
| Goals | `/plan/maal` | `goals` | ✅ |

**Files:**
- `/features/ai-coach/components/AICoachGuide.tsx` - Enhanced component
- `/features/ai-coach/types.ts` - Added `coachAthletes` preset (lines 278-288)

**Visual Enhancements:**
- Gold left border (4px)
- Gradient background (navy/5% → transparent)
- Navy circle with gold Sparkles icon
- Navy hover states on suggestion buttons
- Shadow effects for depth

---

## 🎨 Design Token Usage

### Tier Colors in Phase 4 Components

**CollapsibleFilterDrawer:**
- `border-tier-navy/20` - Border color with opacity
- `text-tier-navy` - Text color
- `hover:bg-tier-navy/5` - Hover state
- `text-tier-gold` - Filter icon
- `bg-tier-gold` - Badge background
- `bg-tier-surface-subtle` - Card background

**AICoachGuide:**
- `border-tier-gold` - Left border accent
- `from-tier-navy/5` - Gradient start
- `bg-tier-navy` - Circle background
- `text-tier-gold` - Sparkles icon
- `hover:bg-tier-navy/5` - Button hover

**Page Component:**
- `bg-tier-surface-base` - Default background
- `text-tier-navy` - Primary text
- All standard tier tokens supported

---

## 📦 Reusable Components Created

### 1. useUrlFilters Hook
**Location:** `/hooks/useUrlFilters.ts`
**Purpose:** Sync filter state with URL query parameters
**Usage:**
```tsx
const { filters, setFilter, clearFilters } = useUrlFilters({
  search: '',
  view: 'active',
  category: 'all'
});
```

**Features:**
- Type-safe filter state
- Automatic URL sync
- Browser history integration
- Debounced updates for search inputs
- Shareable/bookmarkable URLs

---

### 2. CollapsibleFilterDrawer
**Location:** `/components/filters/CollapsibleFilterDrawer.tsx`
**Purpose:** Consistent collapsible filter UI pattern
**Usage:**
```tsx
<CollapsibleFilterDrawer
  activeFilterCount={2}
  onClearAll={clearFilters}
>
  <FilterControl label="View">
    {/* Filter controls */}
  </FilterControl>
</CollapsibleFilterDrawer>
```

**Features:**
- Tier-branded design
- Active filter count badge
- Animated expand/collapse
- "Clear all" button
- Keyboard accessible

---

### 3. Page Component
**Location:** `/components/layout/Page.tsx`
**Purpose:** Generic page wrapper for consistent layouts
**Usage:**
```tsx
<Page
  title="Page Title"
  subtitle="Subtitle text"
  helpText="Help text for user guidance"
  paddingY="md"
  background="base"
>
  {/* Page content */}
</Page>
```

**Features:**
- Consistent padding system
- Tier color theming
- Responsive design
- Help text support
- Flexible background options

---

## 🔧 Integration Patterns

### Pattern 1: Add URL Filters to Existing Page
```tsx
// 1. Import hook
import { useUrlFilters } from '../../hooks/useUrlFilters';

// 2. Replace useState
// OLD: const [search, setSearch] = useState('');
// NEW:
const { filters, setFilter } = useUrlFilters({ search: '' });

// 3. Update inputs
<input
  value={filters.search}
  onChange={(e) => setFilter('search', e.target.value)}
/>

// 4. Use in filter logic
const filtered = items.filter(item =>
  item.name.includes(filters.search)
);
```

---

### Pattern 2: Add Collapsible Filter Drawer
```tsx
// 1. Import components
import { CollapsibleFilterDrawer, FilterControl } from '../../components/filters/CollapsibleFilterDrawer';

// 2. Count active filters
const activeFilterCount = [
  filters.view !== 'all' ? 1 : 0,
  filters.category !== 'all' ? 1 : 0,
].reduce((sum, val) => sum + val, 0);

// 3. Add drawer
<CollapsibleFilterDrawer
  activeFilterCount={activeFilterCount}
  onClearAll={clearFilters}
>
  <FilterControl label="View Mode">
    {/* Your filter controls */}
  </FilterControl>
</CollapsibleFilterDrawer>
```

---

### Pattern 3: Add AI Coach Guide
```tsx
// 1. Import components
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// 2. Add to page (usually near top)
<AICoachGuide config={GUIDE_PRESETS.goals} />

// 3. Or create custom config
<AICoachGuide
  config={{
    title: 'Custom Title',
    description: 'Custom description',
    suggestions: ['Suggestion 1', 'Suggestion 2'],
  }}
/>
```

---

## 📊 Component Statistics

| Component | Lines | Exports | Tier Tokens Used |
|-----------|-------|---------|------------------|
| useUrlFilters | 155 | 1 hook | N/A |
| CollapsibleFilterDrawer | 125 | 2 components | 8 tokens |
| Page | 115 | 1 component | 6 tokens |
| AICoachGuide (enhanced) | ~200 | 1 component | 5 tokens |

**Total Phase 4 Code:**
- 4 new/enhanced components
- ~600 lines of production code
- 3 pages fully integrated
- 19+ tier design tokens used
- 0 hardcoded colors

---

## 🎯 Testing Checklist

Use this checklist when testing Phase 4 features:

### URL Filters
- [ ] Filters update URL on change
- [ ] URL changes update filters
- [ ] Browser back/forward works
- [ ] Refresh preserves filters
- [ ] Bookmarks work
- [ ] Shareable URLs work

### Collapsible Filters
- [ ] Filter button toggles panel
- [ ] Active count shows in badge
- [ ] Badge uses tier-gold color
- [ ] Clear all button appears
- [ ] Clear all resets filters
- [ ] Animation is smooth
- [ ] Keyboard accessible

### AI Coach Guide
- [ ] Gold border visible
- [ ] Gradient background visible
- [ ] Sparkles icon in navy circle
- [ ] Suggestions clickable
- [ ] Hover states work
- [ ] Content matches page context

### Page Component
- [ ] Title renders correctly
- [ ] Subtitle shows properly
- [ ] Help text is readable
- [ ] Padding is consistent
- [ ] Background color correct

---

## 🚀 Future Enhancement Opportunities

### Potential Sprint 4.5: More URL Filters
Pages that could benefit:
- Player Dashboard (`/dashboard`) - filter by date range
- Tests (`/analyse/tester`) - filter by category
- Sessions (`/trening/okter`) - filter by type/date
- Statistics (`/analyse/statistikk`) - filter by metric

### Potential Sprint 4.6: More Collapsible Filters
Pages that could benefit:
- Coach Planning (`/coach/planning`) - filter by group/date
- Coach Stats (`/coach/stats`) - filter by player/period
- Video Hub (`/trening/video-hub`) - filter by exercise type

### Potential Sprint 4.7: More AI Coach Guides
Pages that could benefit:
- Dashboard
- Tests page
- Statistics page
- Training plans
- Video analysis

---

**Document Version:** 1.0
**Last Updated:** 2026-01-13
**Status:** Complete - All features implemented and verified
