# UI System Rules

> AK Golf Academy - Frontend UI Guidelines

## Directory Structure

```
src/ui/
├── raw-blocks/     # READ-ONLY: Tailwind Plus blocks (copy-paste source)
├── templates/      # Reusable layout templates (AppShellTemplate, etc.)
├── primitives/     # Base components (Button, Card, Input)
├── composites/     # Composed components (BottomNav, StateCard, ThemeSwitcher)
└── lab/            # DEV-ONLY: QA testing pages
```

## Core Rules

### 1. Raw Blocks are READ-ONLY
- `src/ui/raw-blocks/` contains unmodified Tailwind Plus blocks
- NEVER edit files in raw-blocks directly
- Use them as copy-paste source for creating templates

### 2. Pages/Screens Must Use Templates
- Pages in `src/features/*/` should NOT contain custom layout systems
- Use `AppShellTemplate` for page structure
- Use `Card`, `StatsGridTemplate`, `CalendarTemplate` for content
- Inline styles for page-specific tweaks only

### 3. New Patterns Go in Templates/Primitives
- If you find yourself repeating a pattern across pages, extract it
- New layout patterns → `src/ui/templates/`
- New base components → `src/ui/primitives/`
- Composed/stateful components → `src/ui/composites/`

## Adding New UI Blocks

Follow this workflow:

1. **Copy** - Get the Tailwind Plus block code
2. **Raw** - Save to `src/ui/raw-blocks/ComponentName.raw.tsx`
3. **Template** - Create `src/ui/templates/ComponentName.tsx` (adapt to tokens)
4. **Lab** - Test in `src/ui/lab/` (DEV-only)
5. **Page** - Use in actual feature pages

## Testing States (DEV-ONLY)

Add `?state=` querystring to test UI states:

| State | URL Example |
|-------|-------------|
| Loading | `/dashboard-v2?state=loading` |
| Error | `/kalender?state=error` |
| Empty | `/goals?state=empty` |

> **Note:** This only works in development. Production ignores these parameters.

### Available Test URLs

- `/dashboard-v2?state=loading|error|empty`
- `/kalender?state=loading|error|empty`
- `/goals?state=loading|error|empty`
- `/stats?state=loading|error|empty`

## Testing Dark Mode

Use the ThemeSwitcher in the header (top-right):

| Mode | Behavior |
|------|----------|
| Light (Sun) | Always light theme |
| Dark (Moon) | Always dark theme |
| System (Monitor) | Follows OS preference |

Theme is persisted in localStorage (`ak-golf-theme`).

## UI Lab (DEV-ONLY)

Access QA pages for component testing:

- `/ui-lab` - Main lab index
- `/stats-lab` - Stats components
- `/appshell-lab` - AppShell template
- `/calendar-lab` - Calendar template

> **Note:** UI Lab routes are DEV-only and not accessible in production.

## Token Usage

Always use CSS variables, never hardcode values:

```tsx
// GOOD
style={{ color: 'var(--text-primary)' }}

// BAD
style={{ color: '#02060D' }}
```

Key token categories:
- Colors: `--ak-primary`, `--text-*`, `--background-*`
- Spacing: `--spacing-1` through `--spacing-20`
- Typography: `--font-size-*`, `--line-height-*`
- Borders: `--border-*`, `--radius-*`
- Shadows: `--shadow-card`, `--shadow-elevated`

## Import Conventions

Use relative imports from within `src/`:

```tsx
// From a page in src/features/dashboard/
import AppShellTemplate from '../../ui/templates/AppShellTemplate';
import { useDashboardData } from '../../data';
```

## Page Shell Requirements

All pages MUST be wrapped in an AppShell:

| User Role | Shell Component | Route Pattern |
|-----------|-----------------|---------------|
| Player | `AuthenticatedLayout` (AppShell) | `/videos`, `/dashboard`, etc. |
| Coach | `CoachLayout` (CoachAppShell) | `/coach/*` |
| Admin | `AdminLayout` (AdminAppShell) | `/admin/*` |

**Do NOT** render pages without a shell - this breaks navigation and theme consistency.

## Video Feature Patterns

Video features follow the standard UI patterns:

| Component | Usage |
|-----------|-------|
| `PlayerVideoFeed` | Player's own video list in CoachVideosDashboard |
| `ReferenceLibrary` | Coach reference videos with sharing |
| `VideoAnalysisPage` | Full-screen video analyzer (both player/coach) |
| `ShareDialog` | Video sharing modal |

**Styling:** Video features use CSS variables from index.css. No hardcoded colors.

## Quick Reference

| Task | Location |
|------|----------|
| Add new page layout | `src/ui/templates/` |
| Add basic UI component | `src/ui/primitives/` |
| Add composed component | `src/ui/composites/` |
| Add data hook | `src/data/hooks/` |
| Add feature page | `src/features/<name>/` |
| Test component | `src/ui/lab/` (DEV) |
