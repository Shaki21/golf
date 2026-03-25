# UI Component Architecture

This directory contains the UI component library for AK Golf IUP, organized following atomic design principles and design system best practices.

## Directory Structure

```
src/ui/
├── raw-blocks/     # Atomic building blocks (molecules/organisms)
├── primitives/     # Base elements (atoms)
├── composites/     # Complex compositions (organisms)
└── templates/      # Page-level templates
```

## Component Layers

### 1. Raw Blocks (`/raw-blocks`)

Foundational UI components that follow the AK Golf design system. These are self-contained, reusable building blocks.

**Available Components:**
- `AppShell` - Main application layout container
- `PageHeader` - Page-level header with title, breadcrumbs, and actions
- `CardSimple` - Basic card container
- `CardHeader` - Card header with title, icon, and actions
- `StatsGrid` - Responsive grid for displaying statistics
- `StatsTrend` - Statistical trend visualization with sparklines
- `CalendarWeek` - Weekly calendar view component

**Usage:**
```tsx
import { AppShell, PageHeader, StatsGrid } from '@/ui/raw-blocks';

function MyPage() {
  return (
    <AppShell header={<Header />}>
      <PageHeader title="Dashboard" />
      <StatsGrid stats={myStats} />
    </AppShell>
  );
}
```

### 2. Primitives (`/primitives`)

Basic atomic elements that serve as the foundation for more complex components.

**Examples:**
- Button variants
- Input elements
- Typography components
- Icons
- Badges
- Avatars

### 3. Composites (`/composites`)

Complex UI compositions built from raw-blocks and primitives.

**Examples:**
- Navigation menus
- Data tables
- Form groups
- Modal dialogs
- Notification systems

### 4. Templates (`/templates`)

Page-level templates that combine composites and raw-blocks into complete layouts.

**Examples:**
- Dashboard layout
- Profile page template
- Settings page template
- List view template

## Design Principles

### Mobile-First
All components are designed mobile-first with responsive breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Design Tokens
Components use CSS variables from the design system (`index.css`):
- Colors: `var(--ak-primary)`, `var(--text-primary)`, etc.
- Spacing: `var(--spacing-4)`, `var(--spacing-lg)`, etc.
- Typography: `var(--font-size-body)`, `var(--font-family)`, etc.
- Borders: `var(--radius-md)`, `var(--border-default)`, etc.

### Accessibility
- Touch-friendly targets (min 44x44px)
- Keyboard navigation support
- ARIA attributes
- Semantic HTML
- Screen reader support

### Performance
- CSS-in-JS with inline styles for component-level styling
- No runtime CSS generation overhead
- Tree-shakeable exports
- Minimal bundle impact

## File Naming Convention

- **Raw Blocks:** `*.raw.tsx` - Foundational components
- **Primitives:** `*.primitive.tsx` - Atomic elements
- **Composites:** `*.composite.tsx` - Complex compositions
- **Templates:** `*.template.tsx` - Page templates

## TypeScript

All components are fully typed with:
- Strict prop interfaces
- Optional props with sensible defaults
- Generic types where appropriate
- Exported type definitions

## Testing

Each component should include:
- Unit tests for logic
- Snapshot tests for UI
- Accessibility tests
- Responsive behavior tests

## Contributing

When adding new components:

1. Choose the appropriate layer (raw-blocks, primitives, composites, templates)
2. Follow the naming convention
3. Use design tokens from `index.css`
4. Ensure mobile-first responsive design
5. Add TypeScript interfaces
6. Export from layer's `index.ts`
7. Add documentation and examples
8. Write tests

## Examples

### Using AppShell
```tsx
import { AppShell } from '@/ui/raw-blocks';

<AppShell
  header={<Header />}
  navigation={<MobileNav />}
  showMobileNav={true}
>
  <YourContent />
</AppShell>
```

### Using StatsGrid
```tsx
import { StatsGrid } from '@/ui/raw-blocks';

const stats = [
  { id: '1', label: 'Total Rounds', value: 42, change: 12, trend: 'up' },
  { id: '2', label: 'Avg Score', value: 78, change: -3, trend: 'down' },
];

<StatsGrid stats={stats} showTrend />
```

### Using CalendarWeek
```tsx
import { CalendarWeek } from '@/ui/raw-blocks';

const events = {
  '2025-01-15': [
    { id: '1', title: 'Training', time: '10:00', type: 'training' }
  ]
};

<CalendarWeek
  selectedDate={new Date()}
  events={events}
  onDaySelect={(date) => console.log(date)}
/>
```

## Design System Reference

All components follow the AK Golf Design System v3.0:
- Primary Color: `#10456A` (Deep Blue)
- Background: `#EDF0F2` (Snow)
- Surface: `#EBE5DA` (Warm Beige)
- Accent: `#C9A227` (Gold)
- Typography: Inter font family
- Spacing: 4px base unit
- Border Radius: 8px/12px/16px

For full design tokens, see `src/index.css`.
