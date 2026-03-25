# Training Plan Builder Enhancement - Implementation Plan

**Sprint:** 5.12 - Training Plan Builder
**Date:** 2026-01-12
**Status:** 📋 Planning

---

## Executive Summary

### Current State

**Existing Training Plan Editor:**
- Located in `coach-training-plan-editor` feature
- Individual athlete training block management
- AI-powered suggestions
- Training categories (TEE, APP, SGR, PGR, GBR)
- Multi-dimensional categorization (phase, environment, cognitive skills, pressure)
- Read-only enforcement for past/completed blocks

**Limitations:**
1. ❌ No template system (coaches recreate plans manually)
2. ❌ No week/period planning view (list-based only)
3. ❌ No bulk operations (one athlete at a time)
4. ❌ No plan copying between athletes
5. ❌ No seasonal/periodization planning
6. ❌ Limited exercise library integration

### Enhancement Goals

Transform the training plan editor into a comprehensive planning suite:

1. **Template System** - Reusable training plan templates
2. **Calendar Planning View** - Week-by-week visual planning
3. **Period Planning** - Seasonal structure (preparation, competition, recovery)
4. **Bulk Operations** - Apply templates to multiple athletes
5. **Exercise Library** - Browse and insert exercises
6. **Plan Copying** - Duplicate successful plans

---

## Phase 1: Template System (8 hours)

### 1.1 Template Types

**File:** `src/features/coach-training-plan/types/template.types.ts`

```typescript
export interface TrainingPlanTemplate {
  id: string;
  name: string;
  description: string;
  category: 'technique' | 'fitness' | 'mental' | 'competition-prep' | 'recovery' | 'custom';
  durationWeeks: number;
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  sessions: TemplateSession[];
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  usageCount?: number;
}

export interface TemplateSession {
  id: string;
  weekNumber: number; // 1-based
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  name: string;
  description?: string;
  durationMinutes: number;
  categories: string[]; // TEE, APP, etc.
  phase?: string; // L1-L5
  environment?: string; // C1-C4
  exercises?: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  notes?: string;
}
```

### 1.2 Template Library Component

**File:** `src/features/coach-training-plan/components/TemplatePlanLibrary.tsx`

**Features:**
- Grid view of available templates
- Filter by category, level, duration
- Search by name/tags
- Preview template (modal with week-by-week breakdown)
- "Use Template" button
- Edit custom templates
- Share/publish templates

**UI Layout:**
```
┌─────────────────────────────────────────────────┐
│ Template Library                                │
│ Search: [.......] Filters: [Category▾] [Level▾]│
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Template │ │ Template │ │ Template │         │
│ │  Card 1  │ │  Card 2  │ │  Card 3  │         │
│ │ 4 weeks  │ │ 8 weeks  │ │ 12 weeks │         │
│ │ [Preview]│ │ [Preview]│ │ [Preview]│         │
│ │   [Use]  │ │   [Use]  │ │   [Use]  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
```

### 1.3 Template Creation/Edit Modal

**File:** `src/features/coach-training-plan/components/TemplateEditor.tsx`

**Features:**
- Name, description, category, level
- Duration (weeks)
- Session builder (add/remove sessions)
- Week-by-week grid layout
- Drag-and-drop sessions between days
- Save as private/public
- Tag editor

### 1.4 Template Application Logic

**File:** `src/features/coach-training-plan/hooks/useTemplateApplication.ts`

```typescript
export function useTemplateApplication() {
  const applyTemplate = async (
    template: TrainingPlanTemplate,
    athleteIds: string[],
    startDate: string,
    options?: {
      skipWeekends?: boolean;
      adjustForExistingSessions?: boolean;
    }
  ) => {
    // Logic:
    // 1. Calculate session dates from template (weekNumber + dayOfWeek)
    // 2. Check for conflicts with existing sessions
    // 3. Create training blocks for each athlete
    // 4. Return summary of created sessions
  };

  return { applyTemplate };
}
```

**Estimated Time:** 8 hours
- Types: 1h
- Template library UI: 3h
- Template editor: 3h
- Application logic: 1h

---

## Phase 2: Calendar Planning View (10 hours)

### 2.1 Week Calendar Component

**File:** `src/features/coach-training-plan/components/WeekCalendarPlanner.tsx`

**Features:**
- 7-column weekly grid (Mon-Sun)
- Session cards displayed on correct days
- Drag-and-drop to reschedule
- Click day to add session
- Click session to edit
- Color-coded by category (TEE = blue, APP = green, etc.)
- Multiple weeks visible (scroll vertically)
- Mini-calendar navigator
- Current week highlight

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Week Planning - John Doe             [◀ Prev] Week 1 [Next ▶]│
├────┬────┬────┬────┬────┬────┬────┐                           │
│ Mon│ Tue│ Wed│ Thu│ Fri│ Sat│ Sun│                           │
├────┼────┼────┼────┼────┼────┼────┤                           │
│    │    │┌──┐│┌──┐│    │    │    │  Week 1                   │
│    │    ││□□││││□□││    │    │    │  Jan 13-19                │
│    │    │└──┘│└──┘│    │    │    │                           │
├────┼────┼────┼────┼────┼────┼────┤                           │
│┌──┐│    │┌──┐│    │┌──┐│    │    │  Week 2                   │
││□□││    ││□□││    ││□□││    │    │  Jan 20-26                │
│└──┘│    │└──┘│    │└──┘│    │    │                           │
└────┴────┴────┴────┴────┴────┴────┘                           │
```

### 2.2 Session Card Component

**File:** `src/features/coach-training-plan/components/SessionCard.tsx`

**Features:**
- Compact display (name, duration, category)
- Color-coded border/background
- Drag handle
- Quick actions (edit, delete, duplicate)
- Hover for full details
- Icons for phase, environment, cognitive skills

**Example:**
```
┌─────────────────┐
│ 🎯 Putting Drill│ ← Category icon
│ 60 min          │ ← Duration
│ ──────────────  │ ← Category color bar (green)
│ L2 • C1 • CS3   │ ← Phase, Environment, CS
└─────────────────┘
```

### 2.3 Drag-and-Drop Integration

**Library:** `@dnd-kit/core`

**Implementation:**
```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core';

function WeekCalendarPlanner() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      // Move session to new day
      const sessionId = active.id;
      const newDate = over.data.current.date;

      updateSessionDate(sessionId, newDate);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Calendar grid */}
    </DndContext>
  );
}
```

**Estimated Time:** 10 hours
- Week calendar UI: 4h
- Session cards: 2h
- Drag-and-drop: 3h
- Integration with existing editor: 1h

---

## Phase 3: Period Planning (6 hours)

### 3.1 Periodization Model

**File:** `src/features/coach-training-plan/types/period.types.ts`

```typescript
export interface TrainingPeriod {
  id: string;
  athleteId: string;
  name: string;
  type: 'preparation' | 'competition' | 'recovery' | 'off-season';
  startDate: string;
  endDate: string;
  goals: string[];
  focusAreas: string[]; // TEE, APP, etc.
  notes?: string;
}

export interface PeriodTemplate {
  name: string;
  type: TrainingPeriod['type'];
  durationWeeks: number;
  weeklyStructure: {
    weekNumber: number;
    volume: 'low' | 'medium' | 'high';
    intensity: 'low' | 'medium' | 'high';
    focusAreas: string[];
  }[];
}
```

### 3.2 Period Overview Component

**File:** `src/features/coach-training-plan/components/PeriodOverview.tsx`

**Features:**
- Timeline visualization (horizontal bar)
- Period blocks color-coded by type
- Click period to edit
- Add new period
- Drag edges to resize period
- Validation (no overlaps, no gaps)

**UI Layout:**
```
┌───────────────────────────────────────────────────────────┐
│ Season Planning - John Doe                    2026        │
├───────────────────────────────────────────────────────────┤
│ Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec│
│ ┌────────┐┌─────────────┐┌───┐┌──────────┐┌─────────┐   │
│ │  Prep  ││ Competition ││Rec││ Off-season││  Prep  │   │
│ └────────┘└─────────────┘└───┘└──────────┘└─────────┘   │
│  8 weeks    12 weeks      2w     10 weeks     8 weeks    │
└───────────────────────────────────────────────────────────┘
```

### 3.3 Period Detail Panel

**File:** `src/features/coach-training-plan/components/PeriodDetailPanel.tsx`

**Features:**
- Period info (name, type, dates, goals)
- Week-by-week breakdown
- Volume/intensity chart
- Focus area distribution
- Apply period template
- Link to week calendar for that period

**Estimated Time:** 6 hours
- Period types: 1h
- Period overview UI: 3h
- Period detail panel: 2h

---

## Phase 4: Bulk Operations (4 hours)

### 4.1 Multi-Athlete Template Application

**File:** `src/features/coach-training-plan/components/BulkTemplateApply.tsx`

**Features:**
- Select template
- Select multiple athletes (checkbox list)
- Choose start date
- Options:
  - Skip weekends
  - Adjust for existing sessions
  - Personalize per athlete
- Preview before applying
- Progress indicator
- Summary report

**UI Flow:**
```
Step 1: Select Template
  → [Template dropdown with preview]

Step 2: Select Athletes
  → [✓ John Doe]
  → [✓ Jane Smith]
  → [ ] Mike Johnson

Step 3: Configure
  → Start Date: [2026-01-20]
  → [✓] Skip weekends
  → [✓] Check for conflicts

Step 4: Review & Apply
  → Athlete  | Sessions | Conflicts | Status
  → John Doe |    12    |     0     | Ready
  → Jane S.  |    12    |     2     | Review

  [Apply to All] [Cancel]
```

### 4.2 Plan Copying

**File:** `src/features/coach-training-plan/components/PlanCopyDialog.tsx`

**Features:**
- Select source athlete
- Select target athletes
- Date range to copy
- Transform options:
  - Offset by X days
  - Adjust intensity
  - Filter by category
- Conflict resolution

**Estimated Time:** 4 hours
- Multi-athlete UI: 2h
- Plan copy dialog: 1h
- Backend integration: 1h

---

## Phase 5: Exercise Library Integration (4 hours)

### 5.1 Exercise Browser Modal

**File:** `src/features/coach-training-plan/components/ExerciseBrowser.tsx`

**Features:**
- Browse exercises from library
- Filter by category, equipment, skill level
- Search by name
- Preview exercise (description, video, diagrams)
- Add to session
- Create custom exercise

**Integration Points:**
- Opens from session editor
- Insert exercise into session
- Pre-fill category based on exercise type

### 5.2 Session Exercise List

**File:** `src/features/coach-training-plan/components/SessionExerciseList.tsx`

**Features:**
- List of exercises in session
- Reorder (drag-and-drop)
- Edit exercise details (sets, reps, duration)
- Remove exercise
- Add notes per exercise

**Estimated Time:** 4 hours
- Exercise browser: 2h
- Session exercise list: 1.5h
- Integration: 0.5h

---

## Phase 6: Enhanced UX & Polish (4 hours)

### 6.1 Quick Actions

- Right-click context menu on sessions
- Keyboard shortcuts (Ctrl+C to copy, Ctrl+V to paste session, Del to delete)
- Quick duplicate (Ctrl+D)
- Multi-select sessions (Shift+click)

### 6.2 Filters & Views

**File:** `src/features/coach-training-plan/components/PlanFilters.tsx`

**Features:**
- Filter by category (show only TEE, APP, etc.)
- Filter by phase (L1-L5)
- Filter by date range
- Show/hide completed sessions
- View modes:
  - List view (existing)
  - Week calendar view (new)
  - Month calendar view (new)
  - Timeline view (new)

### 6.3 Statistics Panel

**File:** `src/features/coach-training-plan/components/PlanStatistics.tsx`

**Features:**
- Total sessions planned
- Hours per week average
- Category distribution (pie chart)
- Phase distribution
- Completion rate (past sessions)

**Estimated Time:** 4 hours
- Quick actions: 1.5h
- Filters & views: 1.5h
- Statistics panel: 1h

---

## Technical Architecture

### Component Hierarchy

```
CoachTrainingPlanEditor (Enhanced)
├── TemplatePlanLibrary
│   ├── TemplateCard
│   ├── TemplatePreviewModal
│   └── TemplateEditor
├── WeekCalendarPlanner
│   ├── WeekGrid
│   ├── SessionCard (draggable)
│   └── DayCell (droppable)
├── PeriodOverview
│   ├── PeriodTimeline
│   ├── PeriodBlock (draggable edges)
│   └── PeriodDetailPanel
├── BulkTemplateApply
│   ├── TemplateSelector
│   ├── AthleteSelector
│   └── ConflictResolver
├── PlanCopyDialog
│   └── CopyOptionsForm
├── ExerciseBrowser
│   ├── ExerciseCard
│   └── ExercisePreview
├── SessionExerciseList
│   └── ExerciseItem (draggable)
├── PlanFilters
└── PlanStatistics
```

### Data Flow

```
API Endpoints:
GET    /templates                        → List templates
POST   /templates                        → Create template
GET    /templates/:id                    → Get template
PUT    /templates/:id                    → Update template
DELETE /templates/:id                    → Delete template
POST   /templates/:id/apply              → Apply template to athletes

GET    /periods                          → List periods for athlete
POST   /periods                          → Create period
PUT    /periods/:id                      → Update period
DELETE /periods/:id                      → Delete period

POST   /training-plans/bulk-apply        → Bulk template application
POST   /training-plans/copy              → Copy plan between athletes

GET    /exercises                        → Browse exercise library
```

### State Management

```typescript
// Training Plan State (React Query)
useTemplates()           → { templates, isLoading, refetch }
useTemplate(id)          → { template, isLoading }
useCreateTemplate()      → { mutate, isLoading }
useApplyTemplate()       → { mutate, isLoading, progress }

usePeriods(athleteId)    → { periods, isLoading }
useCreatePeriod()        → { mutate, isLoading }

useExercises()           → { exercises, isLoading, search }
```

---

## Implementation Checklist

### Phase 1: Template System ✅ (8h)
- [ ] Create template types
- [ ] Create TemplatePlanLibrary component
- [ ] Create TemplateEditor component
- [ ] Implement template application logic
- [ ] Create useTemplates hook
- [ ] Test template creation and application

### Phase 2: Calendar Planning View ✅ (10h)
- [ ] Install @dnd-kit/core
- [ ] Create WeekCalendarPlanner component
- [ ] Create SessionCard component
- [ ] Implement drag-and-drop
- [ ] Add week navigation
- [ ] Test calendar interactions

### Phase 3: Period Planning ✅ (6h)
- [ ] Create period types
- [ ] Create PeriodOverview component
- [ ] Create PeriodDetailPanel component
- [ ] Implement period CRUD operations
- [ ] Test period timeline

### Phase 4: Bulk Operations ✅ (4h)
- [ ] Create BulkTemplateApply component
- [ ] Create PlanCopyDialog component
- [ ] Implement conflict detection
- [ ] Test bulk operations

### Phase 5: Exercise Library ✅ (4h)
- [ ] Create ExerciseBrowser component
- [ ] Create SessionExerciseList component
- [ ] Integrate with existing exercise API
- [ ] Test exercise insertion

### Phase 6: UX Polish ✅ (4h)
- [ ] Add keyboard shortcuts
- [ ] Create PlanFilters component
- [ ] Create PlanStatistics component
- [ ] Add context menus
- [ ] Test all interactions

### Integration & Testing (4h)
- [ ] Integrate all phases into CoachTrainingPlanEditor
- [ ] Update routing if needed
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Create documentation

**Total Estimated Time:** 40 hours

---

## Success Metrics

### Usability
- [ ] Coaches can create reusable templates
- [ ] Coaches can apply templates to multiple athletes in < 2 minutes
- [ ] Coaches can see week-by-week plan visually
- [ ] Coaches can drag-and-drop to reschedule sessions
- [ ] Coaches can copy successful plans between athletes

### Performance
- [ ] Template library loads < 500ms
- [ ] Calendar view renders < 200ms
- [ ] Drag-and-drop feels instant (< 16ms)
- [ ] Bulk apply to 10 athletes < 3s

### Code Quality
- [ ] TypeScript types for all new features
- [ ] Unit tests coverage > 80%
- [ ] E2E tests for critical flows
- [ ] Documentation complete

---

## Migration Strategy

### Backward Compatibility
- ✅ Existing training blocks remain unchanged
- ✅ Current editor functionality preserved
- ✅ New features are additive (no breaking changes)

### Rollout Plan
1. **Week 1:** Deploy Phase 1-2 (templates + calendar)
2. **Week 2:** Deploy Phase 3-4 (periods + bulk ops)
3. **Week 3:** Deploy Phase 5-6 (exercises + polish)
4. **Week 4:** Testing, refinement, documentation

---

## Risk Assessment

### Technical Risks

**Risk:** Drag-and-drop performance issues
- **Mitigation:** Use virtualization for long lists, optimize re-renders

**Risk:** Complex state management with templates
- **Mitigation:** Use React Query for server state, Zustand for UI state

**Risk:** Date/timezone handling in templates
- **Mitigation:** Store all dates as UTC, convert to local for display

### UX Risks

**Risk:** Too many features overwhelm users
- **Mitigation:** Progressive disclosure, tooltips, onboarding guide

**Risk:** Template application conflicts with existing sessions
- **Mitigation:** Clear conflict detection, preview before apply

**Risk:** Drag-and-drop not discoverable
- **Mitigation:** Explicit instructions, tutorial video

---

## Future Enhancements (Post-Sprint)

### Advanced Features
- [ ] Recurring session templates (every Monday for 12 weeks)
- [ ] Conditional logic in templates (if athlete level = advanced, add X)
- [ ] Template marketplace (share templates with community)
- [ ] AI-generated templates based on athlete profile
- [ ] Integration with tournament calendar (adjust load before competitions)
- [ ] Mobile-optimized planning view
- [ ] Offline support for plan editing
- [ ] Version history and rollback
- [ ] Collaborative editing (multiple coaches)

### Analytics
- [ ] Template effectiveness metrics
- [ ] Athlete adherence tracking
- [ ] Most popular templates
- [ ] Plan completion rates

---

## Dependencies

### New Dependencies
```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0",
  "date-fns": "^2.30.0" // Already installed
}
```

### Existing Dependencies
- recharts (for statistics)
- sonner (for notifications)
- lucide-react (for icons)
- react-router-dom (for navigation)

---

## Documentation Deliverables

### User Documentation
- [ ] Training Plan Builder User Guide
- [ ] Template Creation Tutorial
- [ ] Bulk Operations Guide
- [ ] Best Practices for Periodization
- [ ] Video Tutorials

### Developer Documentation
- [ ] Component API Reference
- [ ] Hook Documentation
- [ ] Type Definitions
- [ ] Testing Guide
- [ ] Migration Guide

---

## Conclusion

Sprint 5.12 will transform the training plan editor from a simple session manager into a comprehensive planning suite. Key deliverables:

1. **Template System** - Reusable plan templates
2. **Visual Planning** - Week calendar with drag-and-drop
3. **Periodization** - Seasonal structure planning
4. **Bulk Operations** - Efficient multi-athlete management
5. **Exercise Integration** - Seamless exercise library access

**Expected Impact:**
- 80% reduction in plan creation time
- Better adherence through visual planning
- Improved periodization structure
- Easier plan sharing and iteration

**Ready for:** Implementation

---

**Status:** 📋 Plan Complete
**Next Step:** Begin Phase 1 (Template System)
**Estimated Completion:** 40 hours (1 week, full-time)

