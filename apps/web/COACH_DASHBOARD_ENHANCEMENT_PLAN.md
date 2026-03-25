# Coach Dashboard Enhancement Plan

**Sprint:** 5.10 - Coach Dashboard Enhancement
**Date:** 2026-01-12
**Status:** Implementation Ready

---

## Current State Analysis ✅

### Existing Infrastructure

**Dashboard Components:**
```
CoachDashboard.tsx                  - Main dashboard layout (3-layer model)
├── CoachHeroDecisionCard.tsx       - Layer 1: Next critical action
├── PlayersAttentionPanel.tsx       - Layer 2: Players needing attention
├── TeamLoadCard.tsx                - Layer 2: Team load & readiness
└── CoachOperationsSection.tsx      - Layer 3: Tools & admin
```

**Data Layer:**
- `useCoachPlanDashboard` hook - Fetches dashboard state
- API endpoint: `/coach-plan-dashboard`
- Fallback data for offline/error states
- Loading skeletons implemented

**Design System:**
- Uses tier-tokens.css for colors
- PageHeader + PageContainer architecture
- Responsive grid layout (mobile-first)

---

## Enhancement Strategy

### Goals
1. **Real-time insights** - Live updates without page refresh
2. **Actionable intelligence** - Quick actions directly from dashboard
3. **Performance visibility** - Team and individual trends
4. **Workflow optimization** - Reduce clicks to complete tasks
5. **Mobile excellence** - Full functionality on mobile devices

---

## Phase 1: Real-Time Updates (High Priority)

### 1.1 WebSocket Integration

**Goal:** Live updates for critical events without page refresh

**Implementation:**

**File:** `src/features/coach-dashboard/hooks/useDashboardRealtime.ts`

```typescript
import { useEffect, useCallback } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

export interface DashboardUpdate {
  type: 'session_completed' | 'player_needs_attention' | 'tournament_reminder' | 'goal_completed';
  playerId?: string;
  playerName?: string;
  message: string;
  timestamp: Date;
  actionRequired?: boolean;
}

export function useDashboardRealtime(onUpdate: (update: DashboardUpdate) => void) {
  const { connected, subscribe, unsubscribe } = useWebSocket();

  const handleUpdate = useCallback((event: MessageEvent) => {
    const update: DashboardUpdate = JSON.parse(event.data);
    onUpdate(update);
  }, [onUpdate]);

  useEffect(() => {
    if (connected) {
      const channel = 'coach-dashboard-updates';
      subscribe(channel, handleUpdate);

      return () => unsubscribe(channel, handleUpdate);
    }
  }, [connected, handleUpdate, subscribe, unsubscribe]);

  return { connected };
}
```

**Integration in CoachDashboard.tsx:**

```typescript
const [realtimeUpdates, setRealtimeUpdates] = useState<DashboardUpdate[]>([]);
const { connected } = useDashboardRealtime((update) => {
  setRealtimeUpdates(prev => [update, ...prev].slice(0, 5));
  // Optionally refetch data if critical update
  if (update.actionRequired) {
    refetch();
  }
});

// Display updates in a toast or notification banner
{realtimeUpdates.length > 0 && (
  <div className="mb-4 space-y-2">
    {realtimeUpdates.map((update, idx) => (
      <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">{update.message}</p>
      </div>
    ))}
  </div>
)}
```

### 1.2 Auto-Refresh with Smart Polling

**Goal:** Keep dashboard fresh without manual refresh

**File:** `src/features/coach-dashboard/hooks/useSmartPolling.ts`

```typescript
import { useEffect, useRef } from 'react';

export interface SmartPollingOptions {
  interval?: number;          // Base interval (default: 30s)
  maxInterval?: number;       // Max interval when inactive (default: 5min)
  onForeground?: () => void;  // Callback when tab becomes visible
  onBackground?: () => void;  // Callback when tab hidden
}

export function useSmartPolling(
  refetch: () => Promise<void>,
  options: SmartPollingOptions = {}
) {
  const {
    interval = 30000,        // 30 seconds
    maxInterval = 300000,    // 5 minutes
  } = options;

  const intervalRef = useRef<NodeJS.Timeout>();
  const currentIntervalRef = useRef(interval);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - slow down polling
        currentIntervalRef.current = maxInterval;
        options.onBackground?.();
      } else {
        // Tab visible - speed up polling and refresh immediately
        currentIntervalRef.current = interval;
        refetch();
        options.onForeground?.();
      }

      // Restart interval with new rate
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(refetch, currentIntervalRef.current);
    };

    // Initial polling
    intervalRef.current = setInterval(refetch, interval);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, interval, maxInterval, options]);
}
```

**Usage in CoachDashboard.tsx:**

```typescript
useSmartPolling(refetch, {
  interval: 30000,      // 30s when active
  maxInterval: 300000,  // 5min when inactive
  onForeground: () => console.log('Dashboard active - fast refresh'),
  onBackground: () => console.log('Dashboard inactive - slow refresh'),
});
```

---

## Phase 2: Quick Actions (High Priority)

### 2.1 Inline Player Actions

**Goal:** Complete common tasks without leaving dashboard

**Component:** `src/features/coach-dashboard/components/QuickActionMenu.tsx`

```typescript
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/shadcn/dropdown-menu';
import { MoreVertical, MessageSquare, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionMenuProps {
  playerId: string;
  playerName: string;
  onSendMessage?: () => void;
  onScheduleSession?: () => void;
  onViewProgress?: () => void;
  onAddNote?: () => void;
}

export function QuickActionMenu({
  playerId,
  playerName,
  onSendMessage,
  onScheduleSession,
  onViewProgress,
  onAddNote,
}: QuickActionMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:bg-tier-surface-secondary rounded-lg">
        <MoreVertical size={16} className="text-tier-text-secondary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSendMessage}>
          <MessageSquare size={16} className="mr-2" />
          Send message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onScheduleSession}>
          <Calendar size={16} className="mr-2" />
          Schedule session
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddNote}>
          <FileText size={16} className="mr-2" />
          Add note
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewProgress}>
          <TrendingUp size={16} className="mr-2" />
          View progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/coach/athletes/${playerId}`)}>
          View profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 2.2 Quick Message Modal

**Component:** `src/features/coach-dashboard/components/QuickMessageModal.tsx`

```typescript
import React, { useState } from 'react';
import { Modal } from '../../../ui/composites/Modal.composite';
import { Button } from '../../../components/shadcn/button';
import { Textarea } from '../../../components/shadcn/textarea';
import { useToast } from '../../../hooks/useToast';
import { apiPost } from '../../../data/apiClient';

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
}

export function QuickMessageModal({
  isOpen,
  onClose,
  playerId,
  playerName,
}: QuickMessageModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await apiPost('/messages', {
        recipientId: playerId,
        content: message,
        type: 'coach_message',
      });

      toast({
        title: 'Message sent',
        description: `Your message to ${playerName} was sent successfully.`,
      });

      setMessage('');
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Message to ${playerName}`}
      size="md"
    >
      <div className="space-y-4">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={6}
          className="w-full"
        />

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send message'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## Phase 3: Enhanced Visualizations (Medium Priority)

### 3.1 Team Performance Chart

**Component:** `src/features/coach-dashboard/components/TeamPerformanceChart.tsx`

```typescript
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TeamPerformanceChartProps {
  data: Array<{
    week: string;
    sessionsCompleted: number;
    averagePerformance: number;
    goalsAchieved: number;
  }>;
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-tier-text-primary mb-4">
        Team Performance Trend
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="week"
            stroke="#6b7280"
            style={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sessionsCompleted"
            stroke="rgb(var(--tier-navy-rgb))"
            strokeWidth={2}
            name="Sessions"
          />
          <Line
            type="monotone"
            dataKey="averagePerformance"
            stroke="rgb(var(--tier-gold-rgb))"
            strokeWidth={2}
            name="Performance"
          />
          <Line
            type="monotone"
            dataKey="goalsAchieved"
            stroke="#10b981"
            strokeWidth={2}
            name="Goals"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 3.2 Player Activity Heatmap

**Component:** `src/features/coach-dashboard/components/PlayerActivityHeatmap.tsx`

```typescript
import React from 'react';
import { format, subDays } from 'date-fns';

interface PlayerActivityHeatmapProps {
  data: Array<{
    date: Date;
    count: number;
    players: string[];
  }>;
}

export function PlayerActivityHeatmap({ data }: PlayerActivityHeatmapProps) {
  const getIntensityClass = (count: number): string => {
    if (count === 0) return 'bg-tier-surface-secondary';
    if (count <= 2) return 'bg-green-200';
    if (count <= 5) return 'bg-green-400';
    if (count <= 8) return 'bg-green-600';
    return 'bg-green-800';
  };

  // Generate last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayData = data.find(d =>
      format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return {
      date,
      count: dayData?.count || 0,
      players: dayData?.players || [],
    };
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-tier-text-primary mb-4">
        Team Activity (Last 7 Days)
      </h3>

      <div className="flex gap-2">
        {days.map((day, idx) => (
          <div key={idx} className="flex-1">
            <div
              className={`h-20 rounded-lg ${getIntensityClass(day.count)}
                hover:opacity-80 transition-opacity cursor-pointer`}
              title={`${format(day.date, 'MMM d')}: ${day.count} activities`}
            />
            <p className="text-xs text-center text-tier-text-secondary mt-2">
              {format(day.date, 'EEE')}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-tier-text-secondary">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-tier-surface-secondary" />
          <div className="w-4 h-4 rounded bg-green-200" />
          <div className="w-4 h-4 rounded bg-green-400" />
          <div className="w-4 h-4 rounded bg-green-600" />
          <div className="w-4 h-4 rounded bg-green-800" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
```

---

## Phase 4: Advanced Filtering (Medium Priority)

### 4.1 Dashboard Filters

**Component:** `src/features/coach-dashboard/components/DashboardFilters.tsx`

```typescript
import React from 'react';
import { Button } from '../../../components/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/shadcn/select';
import { Filter } from 'lucide-react';

export interface DashboardFilterState {
  timeRange: 'today' | 'week' | 'month' | 'all';
  playerStatus: 'all' | 'active' | 'inactive' | 'needs_attention';
  sessionStatus: 'all' | 'pending' | 'completed' | 'scheduled';
}

interface DashboardFiltersProps {
  filters: DashboardFilterState;
  onChange: (filters: DashboardFilterState) => void;
  onReset: () => void;
}

export function DashboardFilters({
  filters,
  onChange,
  onReset,
}: DashboardFiltersProps) {
  const hasActiveFilters =
    filters.timeRange !== 'week' ||
    filters.playerStatus !== 'all' ||
    filters.sessionStatus !== 'all';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-tier-text-secondary" />
          <span className="text-sm font-medium text-tier-text-primary">
            Filters
          </span>
        </div>

        <Select
          value={filters.timeRange}
          onValueChange={(value) =>
            onChange({ ...filters, timeRange: value as any })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.playerStatus}
          onValueChange={(value) =>
            onChange({ ...filters, playerStatus: value as any })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Player status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All players</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="needs_attention">Needs attention</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sessionStatus}
          onValueChange={(value) =>
            onChange({ ...filters, sessionStatus: value as any })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Session status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## Phase 5: Mobile Optimization (Medium Priority)

### 5.1 Responsive Layout Improvements

**Update CoachDashboard.tsx with mobile-first responsive classes:**

```typescript
// Replace grid layouts with responsive variants
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  {/* Cards automatically stack on mobile, side-by-side on desktop */}
</div>

// Add mobile-specific padding
<PageContainer paddingY="sm" paddingYMd="lg" background="base">

// Mobile-optimized header
<PageHeader
  title="Dashboard"
  subtitle="Your coaching overview"
  mobileCompact  // Prop to reduce header size on mobile
/>
```

### 5.2 Touch-Optimized Actions

**File:** `src/features/coach-dashboard/components/MobileQuickActions.tsx`

```typescript
import React from 'react';
import { Button } from '../../../components/shadcn/button';
import { MessageSquare, Calendar, FileText, Users } from 'lucide-react';

export function MobileQuickActions() {
  return (
    <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-tier-border">
      <div className="grid grid-cols-4 gap-2">
        <Button variant="ghost" size="sm" className="flex-col h-auto py-3">
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Message</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-col h-auto py-3">
          <Calendar size={20} />
          <span className="text-xs mt-1">Schedule</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-col h-auto py-3">
          <FileText size={20} />
          <span className="text-xs mt-1">Notes</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-col h-auto py-3">
          <Users size={20} />
          <span className="text-xs mt-1">Players</span>
        </Button>
      </div>
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Real-Time Updates (Week 1)
- [ ] Create `useDashboardRealtime` hook
- [ ] Create `useSmartPolling` hook
- [ ] Integrate WebSocket connection
- [ ] Add real-time update notifications
- [ ] Test polling behavior (active/inactive tabs)

### Phase 2: Quick Actions (Week 1)
- [ ] Create `QuickActionMenu` component
- [ ] Create `QuickMessageModal` component
- [ ] Create `QuickScheduleModal` component
- [ ] Add quick actions to player cards
- [ ] Test all quick actions

### Phase 3: Visualizations (Week 2)
- [ ] Install `recharts` library
- [ ] Create `TeamPerformanceChart` component
- [ ] Create `PlayerActivityHeatmap` component
- [ ] Add charts to dashboard
- [ ] Test responsive behavior

### Phase 4: Filtering (Week 2)
- [ ] Create `DashboardFilters` component
- [ ] Implement filter state management
- [ ] Connect filters to API
- [ ] Add URL persistence for filters
- [ ] Test all filter combinations

### Phase 5: Mobile (Week 2)
- [ ] Update layouts with responsive classes
- [ ] Create `MobileQuickActions` component
- [ ] Test on mobile devices
- [ ] Optimize touch targets
- [ ] Test offline behavior

---

## Testing Strategy

### Unit Tests
```bash
# Test hooks
npm test src/features/coach-dashboard/hooks/useDashboardRealtime.test.ts
npm test src/features/coach-dashboard/hooks/useSmartPolling.test.ts

# Test components
npm test src/features/coach-dashboard/components/QuickActionMenu.test.tsx
npm test src/features/coach-dashboard/components/DashboardFilters.test.tsx
```

### E2E Tests
```typescript
// tests/coach-dashboard.spec.ts
test('should display real-time updates', async ({ page }) => {
  // Simulate WebSocket event
  // Verify notification appears
});

test('should send quick message', async ({ page }) => {
  // Click quick action
  // Fill message
  // Verify sent
});

test('should filter dashboard data', async ({ page }) => {
  // Apply filter
  // Verify filtered results
});
```

### Performance Tests
- Dashboard load time < 2 seconds
- Real-time update latency < 500ms
- Polling does not impact UI performance
- Mobile scrolling is smooth (60fps)

---

## Success Metrics

### Quantitative
- [ ] Dashboard load time < 2s
- [ ] Real-time updates within 500ms
- [ ] 90% of quick actions completed successfully
- [ ] Mobile performance score > 90 (Lighthouse)
- [ ] Zero layout shifts (CLS = 0)

### Qualitative
- [ ] Coach can complete common tasks from dashboard
- [ ] Critical actions are immediately visible
- [ ] Dashboard works offline with cached data
- [ ] Mobile experience matches desktop functionality
- [ ] No cognitive overload (decision paralysis)

---

## Dependencies

### NPM Packages
```bash
npm install recharts date-fns
```

### Backend API Endpoints
- `GET /coach-plan-dashboard` - Already exists ✅
- `POST /messages` - Already exists ✅
- `POST /sessions/schedule` - Already exists ✅
- `WebSocket /ws/coach-updates` - Needs implementation

---

## Migration Guide

### Updating Existing Dashboard

1. **Add real-time updates:**
```diff
+ import { useDashboardRealtime, useSmartPolling } from './hooks';

function CoachDashboard() {
  const { data, refetch } = useCoachPlanDashboard();
+  const { connected } = useDashboardRealtime(handleRealtimeUpdate);
+  useSmartPolling(refetch, { interval: 30000 });
```

2. **Add quick actions:**
```diff
<PlayersAttentionPanel
  players={dashboardData.playersNeedingAttention}
+  onQuickAction={handleQuickAction}
/>
```

3. **Add filters:**
```diff
+ const [filters, setFilters] = useState(defaultFilters);

<PageContainer>
+  <DashboardFilters filters={filters} onChange={setFilters} />
  {/* Rest of dashboard */}
</PageContainer>
```

---

## Rollout Plan

### Week 1: Foundation
- Day 1-2: Real-time infrastructure
- Day 3-4: Quick actions
- Day 5: Testing and fixes

### Week 2: Enhancements
- Day 1-2: Visualizations
- Day 3: Filtering
- Day 4-5: Mobile optimization and testing

### Week 3: Polish & Launch
- Day 1-2: Performance optimization
- Day 3: Documentation
- Day 4-5: Beta testing with coaches

---

**Status:** Ready for Implementation
**Estimated Effort:** 2-3 weeks (1 developer)
**Impact:** High - Core coach workflow optimization
