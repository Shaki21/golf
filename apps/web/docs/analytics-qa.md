# Analytics QA Protocol

> 10-minute verification of event tracking

## Pre-requisites

- Run app in DEV mode: `npm run dev`
- Open browser DevTools console
- Look for `[Analytics]` prefixed logs
- (Optional) Click 📊 button to open debug overlay

## Test Steps

### 1. Initial Page Load

**Action:** Open `/dashboard-v2`

**Expected Events:**
- `screen_view` with `{ screen: "Dashboard" }`

**Should NOT fire:**
- Multiple `screen_view` for same page
- Any other events

---

### 2. Navigate Through Tabs

**Action:** Click each tab in BottomNav in order:
1. Dashboard → Kalender → Stats → Mål → Dashboard

**Expected Events (in order):**
1. `screen_view { screen: "Dashboard" }` (initial)
2. `screen_view { screen: "Kalender" }`
3. `screen_view { screen: "Statistikk" }`
4. `screen_view { screen: "Mål" }`
5. `screen_view { screen: "Dashboard" }`

**Should NOT fire:**
- Double events on same navigation
- Events while staying on same page

---

### 3. Theme Change

**Action:** Toggle theme (Light → Dark → System)

**Expected Events:**
- None (theme change not tracked)

---

### 4. Simulate State (DEV)

**Action:** Add `?state=loading` to URL

**Expected Events:**
- `screen_view` for current screen (path change)

**Should NOT fire:**
- Error/loading state events
- Continuous screen_view spam

---

### 5. Verify Payload Consistency

**Check each logged event for:**
- `screen`: Present, matches page name
- `source`: "navigation" for screen_view
- `type`: "page_view" for screen_view

**Must NOT contain:**
- User email
- User name
- Auth tokens
- Full API responses

---

## Event Summary

| Event | When | Payload |
|-------|------|---------|
| `screen_view` | Navigation between pages | `screen, source, type` |
| `plan_confirmed` | *Not yet implemented* | - |
| `training_log_submitted` | *Not yet implemented* | - |

## Debug Overlay

In DEV mode, click the 📊 button (bottom-right) to see:
- Last 20 events
- Timestamp, event name, payload preview
- Clear button to reset

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Double screen_view | Missing dedupe | Check `useScreenView` ref |
| No events | Console filtered | Check "Info" is enabled in console |
| Debug overlay missing | PROD build | Only shows in `NODE_ENV=development` |

## Sign-off

| Tester | Date | Result |
|--------|------|--------|
| | | PASS / FAIL |
