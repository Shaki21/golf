# Analytics Events

> AK Golf Academy - Product Analytics

## Provider Status

**Current:** Console-only (DEV mode)
**TODO:** Integrate Segment/Amplitude/Posthog in production

## Event Types

| Event Name | When Triggered | Payload Keys | File |
|------------|----------------|--------------|------|
| `screen_view` | Page mount/navigation | `screen`, `source`, `type` | Pages via `useScreenView` |
| `plan_confirmed` | User confirms plan | `source`, `date?` | *Placeholder* |
| `training_log_submitted` | Training logged | `source`, `id` | *Not implemented* |
| `structured_session_completed` | Session completed | `source`, `id` | *Not implemented* |
| `feedback_received` | Feedback submitted | `source`, `type` | *Not implemented* |

## Implementation Details

### Screen Views

Hook: `src/analytics/useScreenView.ts`

```typescript
import { useScreenView } from '../../analytics/useScreenView';

function DashboardPage() {
  useScreenView('Dashboard');
  // ...
}
```

Tracked on:
- `DashboardPage` → `{ screen: 'Dashboard' }`
- `CalendarPage` → `{ screen: 'Kalender' }`
- `StatsPageV2` → `{ screen: 'Statistikk' }`
- `GoalsPage` → `{ screen: 'Mål' }`

### Base Payload Structure

All events include:
```typescript
{
  event: string;        // Event name
  timestamp: string;    // ISO 8601
  source?: string;      // Where event originated
  screen?: string;      // Current screen
  id?: string;          // Entity ID (never PII)
  date?: string;        // Relevant date
  type?: string;        // Event subtype
}
```

### Never Log

- User names
- Email addresses
- Free-text notes/comments
- Any PII

## Files

| File | Purpose |
|------|---------|
| `src/analytics/track.ts` | Core tracking function |
| `src/analytics/useScreenView.ts` | Screen view hook |
| `src/features/dashboard/DashboardPage.tsx` | Uses `useScreenView` |
| `src/features/calendar/CalendarPage.tsx` | Uses `useScreenView` |
| `src/features/stats/StatsPageV2.tsx` | Uses `useScreenView` |
| `src/features/goals/GoalsPage.tsx` | Uses `useScreenView` |

## Future Integration

To add a provider, edit `src/analytics/track.ts`:

```typescript
// Segment
window.analytics?.track(name, payload);

// Posthog
posthog.capture(name, payload);

// Amplitude
amplitude.track(name, payload);
```
