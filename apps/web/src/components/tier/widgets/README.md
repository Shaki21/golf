# TIER Golf Widgets Documentation

Pre-built dashboard and feature widgets using TIER Golf design system. These widgets are production-ready components that combine TIER base components into common UI patterns.

## Table of Contents

- [StatCard](#statcard)
- [CategoryProgressCard](#categoryprogresscard)
- [PlayerHeader](#playerheader)
- [QuickActionCard](#quickactioncard)

---

## StatCard

**Dashboard KPI card with icon, value, trend, and optional progress bar.**

Perfect for showing key performance indicators like session counts, training hours, tests completed, etc.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ComponentType` | **required** | Lucide icon component |
| `value` | `string \| number` | **required** | Main display value |
| `label` | `string` | **required** | Descriptive label |
| `trend` | `number` | `undefined` | Trend indicator (+/- number) |
| `trendLabel` | `string` | `undefined` | Trend description |
| `status` | `'success' \| 'warning' \| 'error' \| 'neutral'` | `'neutral'` | Visual status indicator |
| `iconColor` | `string` | `'rgb(var(--tier-navy))'` | Icon color (CSS color string) |
| `progress` | `{ current, max, color? }` | `undefined` | Progress bar config |
| `context` | `string` | `undefined` | Additional context text |
| `className` | `string` | `undefined` | Additional CSS classes |

### Examples

```jsx
import { StatCard } from '@/components/tier';
import { Target, Clock, Trophy } from 'lucide-react';

// Basic usage
<StatCard
  icon={Target}
  value="12/15"
  label="Økter denne uken"
/>

// With trend indicator
<StatCard
  icon={Clock}
  value="8.5t"
  label="Treningstimer"
  trend={+1.5}
  trendLabel="timer vs forrige"
  status="warning"
/>

// With progress bar
<StatCard
  icon={Trophy}
  value="3/5"
  label="Tester bestått"
  progress={{
    current: 3,
    max: 5,
    color: 'rgb(var(--status-success))'
  }}
/>

// Full example
<StatCard
  icon={TrendingUp}
  value="18.2"
  label="Handicap"
  trend={-0.8}
  trendLabel="fra forrige måned"
  iconColor="rgb(var(--category-f))"
  context="På vei mot under 18!"
/>
```

### Status Colors

- `success` - Green (goals achieved)
- `warning` - Yellow/Orange (close to goal)
- `error` - Red (behind goal)
- `neutral` - Gray (default)

---

## CategoryProgressCard

**Detailed category progress widget with test requirements and CategoryRing.**

Displays progress for A-K categories with individual test tracking (completed/pending/locked).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `'A' \| 'B' \| ... \| 'K'` | **required** | Category letter |
| `progress` | `number` | `0` | Overall progress percentage (0-100) |
| `tests` | `Array<Test>` | `[]` | Array of test requirement objects |
| `onViewDetails` | `() => void` | `undefined` | Callback for "Se detaljer" button |
| `compact` | `boolean` | `false` | Compact view without test list |
| `className` | `string` | `undefined` | Additional CSS classes |

### Test Object Structure

```typescript
interface Test {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'locked';
  result?: string;      // For completed tests
  target: string;
}
```

### Examples

```jsx
import { CategoryProgressCard } from '@/components/tier';
import { useNavigate } from 'react-router-dom';

// Full view with tests
<CategoryProgressCard
  category="F"
  progress={60}
  tests={[
    {
      id: '1',
      name: 'Driving Distance',
      status: 'completed',
      result: '250 yards',
      target: '245 yards'
    },
    {
      id: '2',
      name: 'Approach Accuracy',
      status: 'pending',
      target: '65% GIR'
    },
    {
      id: '3',
      name: 'Tournament Score',
      status: 'locked',
      target: 'Score under 85'
    }
  ]}
  onViewDetails={() => navigate('/categories/F')}
/>

// Compact view
<CategoryProgressCard
  category="A"
  progress={85}
  tests={tests}
  onViewDetails={() => navigate('/categories/A')}
  compact={true}
/>
```

### Category Names

The component includes Norwegian category names:
- A: Tour/Elite
- B: Landslag
- C: Høyt nasjonalt
- D: Nasjonalt
- E: Regionalt topp
- F: Regionalt
- G: Klubb høy
- H: Klubb middels
- I: Klubb lav
- J: Utvikling
- K: Nybegynner

---

## PlayerHeader

**Player info header with avatar, level, category, and streak.**

Perfect for dashboard hero sections and profile headers.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Player name |
| `level` | `number` | `undefined` | Player level (shown on avatar) |
| `category` | `'A' \| 'B' \| ... \| 'K'` | **required** | Current category |
| `streak` | `number` | `undefined` | Training streak (days) |
| `avatarUrl` | `string` | `undefined` | Avatar image URL |
| `greeting` | `string` | `'Hei'` | Greeting message |
| `subtitle` | `string` | `undefined` | Additional subtitle/role |
| `className` | `string` | `undefined` | Additional CSS classes |

### Examples

```jsx
import { PlayerHeader } from '@/components/tier';

// Basic usage
<PlayerHeader
  name="Magnus Olsen"
  level={15}
  category="F"
  streak={7}
/>

// With avatar and greeting
<PlayerHeader
  name="Ola Nordmann"
  level={12}
  category="A"
  streak={14}
  avatarUrl="/avatars/ola.jpg"
  greeting="God morgen"
/>

// With subtitle
<PlayerHeader
  name="Erik Hansen"
  level={20}
  category="B"
  streak={30}
  greeting="Velkommen tilbake"
  subtitle="Elite spiller"
/>

// Dynamic greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 10) return 'God morgen';
  if (hour < 17) return 'God dag';
  return 'God kveld';
};

<PlayerHeader
  name={playerData.name}
  level={playerData.level}
  category={playerData.category}
  streak={playerData.streak}
  greeting={getGreeting()}
/>
```

### Avatar Behavior

- Shows user avatar if `avatarUrl` provided
- Falls back to User icon if no avatar
- Level indicator overlays bottom-right of avatar
- 4px white border with shadow for depth

---

## QuickActionCard

**Interactive card for dashboard quick actions with optional notification badge.**

Perfect for navigation shortcuts, feature access, and common actions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ComponentType` | **required** | Lucide icon component |
| `label` | `string` | **required** | Action label text |
| `badge` | `number` | `undefined` | Notification badge count |
| `onClick` | `() => void` | **required** | Click handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | `undefined` | Additional CSS classes |

### Examples

```jsx
import { QuickActionCard } from '@/components/tier';
import { Calendar, BookOpen, Trophy, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Basic usage
<QuickActionCard
  icon={Calendar}
  label="Kalender"
  onClick={() => navigate('/calendar')}
/>

// With notification badge
<QuickActionCard
  icon={MessageCircle}
  label="Meldinger"
  badge={3}
  onClick={() => navigate('/messages')}
/>

// Grid layout (common pattern)
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <QuickActionCard
    icon={Calendar}
    label="Kalender"
    onClick={() => navigate('/calendar')}
  />
  <QuickActionCard
    icon={BookOpen}
    label="Treningsplan"
    onClick={() => navigate('/training-plan')}
  />
  <QuickActionCard
    icon={Trophy}
    label="Badges"
    onClick={() => navigate('/badges')}
  />
  <QuickActionCard
    icon={MessageCircle}
    label="Meldinger"
    badge={5}
    onClick={() => navigate('/messages')}
  />
</div>

// Disabled state
<QuickActionCard
  icon={BookOpen}
  label="Kommer snart"
  disabled={true}
  onClick={() => {}}
/>
```

### Badge Behavior

- Badge shows in top-right corner
- Displays numbers up to 99
- Shows "99+" for values > 99
- Gold background with navy text (TIER brand colors)

---

## Common Patterns

### Dashboard Layout

Combine widgets for a complete dashboard:

```jsx
import {
  PlayerHeader,
  StatCard,
  CategoryProgressCard,
  QuickActionCard
} from '@/components/tier';
import { TierCard } from '@/components/tier';

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <PlayerHeader
        name={playerData.name}
        level={playerData.level}
        category={playerData.category}
        streak={playerData.streak}
        greeting={getGreeting()}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <StatCard
          icon={Target}
          value="12/15"
          label="Økter"
          progress={{ current: 12, max: 15 }}
        />
        {/* ... more StatCards */}
      </div>

      {/* Category Progress */}
      <CategoryProgressCard
        category="F"
        progress={60}
        tests={tests}
        onViewDetails={() => navigate('/categories/F')}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickActionCard icon={Calendar} label="Kalender" onClick={...} />
        {/* ... more actions */}
      </div>
    </div>
  );
}
```

### Responsive Grids

All widgets are designed to work in grid layouts:

```jsx
// 2 columns on mobile, 4 on desktop
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// 1 column on mobile, 2 on desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Responsive with auto-fit
<div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
```

### Loading States

Show loading indicators while fetching data:

```jsx
{loading ? (
  <div className="flex justify-center py-12">
    <div className="w-12 h-12 border-4 border-tier-navy/20 border-t-tier-navy rounded-full animate-spin" />
  </div>
) : (
  <StatCard {...data} />
)}
```

---

## Styling & Customization

### Color Overrides

All widgets accept `className` for customization:

```jsx
<StatCard
  icon={Target}
  value="12"
  label="Økter"
  className="bg-tier-gold/5 border-tier-gold"
/>

<QuickActionCard
  icon={Calendar}
  label="Kalender"
  onClick={...}
  className="hover:border-tier-gold"
/>
```

### Icon Colors

StatCard supports custom icon colors:

```jsx
<StatCard
  icon={Trophy}
  value="15"
  label="Level"
  iconColor="rgb(var(--category-a))"  // Use category color
/>
```

### Progress Bar Colors

Customize progress bar colors in StatCard:

```jsx
<StatCard
  icon={Target}
  value="8/10"
  label="Økter"
  progress={{
    current: 8,
    max: 10,
    color: 'rgb(var(--tier-gold))'  // Custom color
  }}
/>
```

---

## Best Practices

### 1. **Data Fetching**

Fetch real data and handle loading/error states:

```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchPlayerData()
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

### 2. **Responsive Design**

Use Tailwind responsive prefixes:

```jsx
// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-4 gap-4">
```

### 3. **Accessibility**

All widgets include proper ARIA attributes and keyboard navigation:

```jsx
<QuickActionCard
  icon={Calendar}
  label="Kalender"  // Used for aria-label
  onClick={...}
/>
```

### 4. **Navigation**

Use React Router's `useNavigate` for navigation:

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<QuickActionCard
  icon={Calendar}
  label="Kalender"
  onClick={() => navigate('/calendar')}
/>
```

### 5. **Mock Data Structure**

Keep consistent data structures for easy API integration:

```jsx
const mockPlayerData = {
  name: 'Magnus Olsen',
  level: 15,
  category: 'F',
  streak: 7,
  stats: {
    sessionsCompleted: 12,
    sessionsGoal: 15,
    // ...
  },
  categoryProgress: {
    category: 'F',
    progress: 60,
    tests: [...]
  }
};
```

---

## Reference Implementation

See `TierDashboard.jsx` for a complete reference implementation showcasing all widgets in a real dashboard context.

## Support

For questions or issues, please refer to:
- [TIER Golf Design System](../../../docs/TIER_GOLF_IMPLEMENTATION_PLAN.md)
- [Quick Start Guide](../../../docs/QUICK_START_TIER.md)
- [Component README](../README.md)
