# Phase 4: Advanced Features - Testing Guide

**Status:** ✅ All features implemented and verified
**Date:** 2026-01-13
**Dev Server:** Running on localhost:3000

---

## 🎯 Features to Test

### Sprint 4.1: Page Component Architecture
**Location:** Coach Athletes page (`/coach/athletes`)

**What to test:**
- Clean layout with consistent padding
- Help text appears under subtitle
- No visual regressions from old PageHeader/PageContainer pattern

**How to test:**
1. Navigate to `/coach/athletes`
2. Verify page header shows "Spillere" title
3. Check that subtitle shows player count
4. Verify help text is visible and readable

---

### Sprint 4.2: URL-Persisted Filters
**Locations:**
- Coach Athletes (`/coach/athletes`)
- Goals (`/plan/maal`)
- Calendar (`/plan/kalender`)

**What to test:**
- Filters update the URL query parameters
- Bookmarking a filtered view works
- Browser back/forward buttons navigate through filter states
- Sharing URLs preserves filter state

**How to test:**

**On Coach Athletes page:**
1. Navigate to `/coach/athletes`
2. Type in search box (e.g., "Anders")
3. Verify URL updates to `?search=Anders`
4. Refresh page → search filter persists
5. Clear search → URL updates to remove parameter
6. Test browser back button → search appears again

**On Goals page:**
1. Navigate to `/plan/maal`
2. Change view from "Active" to "Completed"
3. Verify URL updates to `?view=completed`
4. Select a category filter (e.g., "Putting")
5. Verify URL updates to `?view=completed&category=puttespill`
6. Copy URL and open in new tab → filters persist
7. Use browser back button → previous filter state restored

**On Calendar page:**
1. Navigate to `/plan/kalender`
2. Change view mode (List/Week/Month)
3. Verify URL updates to `?view=list` (or week/month)
4. Refresh page → view mode persists

---

### Sprint 4.3: Collapsible Filter Drawers
**Locations:**
- Goals page (`/plan/maal`)
- Calendar page (`/plan/kalender`)

**What to test:**
- Filter button shows gold Filter icon
- Active filter count appears in gold badge
- Clicking expands/collapses filter panel
- "Clear all" button appears when filters active
- Filter controls have tier branding (navy/gold)

**How to test on Goals page:**
1. Navigate to `/plan/maal`
2. Look for "Filters" button near top (navy border, gold icon)
3. Click "Filters" button → panel expands with animation
4. Inside panel, you should see:
   - View mode selector (Active/Completed/All)
   - Category dropdown
5. Select "Completed" view → gold badge appears showing "1"
6. Select a category → badge updates to "2"
7. "Clear all" button appears → click it
8. Badge disappears, filters reset

**How to test on Calendar page:**
1. Navigate to `/plan/kalender`
2. Look for "Filters" button
3. Click to expand → view mode controls inside
4. Change view mode → badge shows "1"
5. Click "Clear all" → resets to default view

---

### Sprint 4.4: AI Coach Branding
**Locations:**
- Coach Athletes page (`/coach/athletes`)
- Goals page (`/plan/maal`)

**What to test:**
- AI Coach Guide has premium tier branding
- Gold left border with gradient background
- Navy circle icon with gold Sparkles
- Suggestion buttons have navy hover states
- Guide content matches page context

**How to test on Coach Athletes:**
1. Navigate to `/coach/athletes`
2. Scroll to top → AI Coach Guide should be visible
3. Verify visual design:
   - Gold left border (4px)
   - Gradient background (navy/5% to transparent)
   - Navy circle with gold Sparkles icon
   - Title: "Player management"
4. Hover over suggestion buttons:
   - "Analyze player progress"
   - "Create group training plan"
   - "Identify improvement areas"
5. Verify hover state shows navy background

**How to test on Goals page:**
1. Navigate to `/plan/maal`
2. AI Coach Guide at top of page
3. Verify design matches tier branding
4. Title: "Goals and progression"
5. Suggestions:
   - "Set a new goal"
   - "Check my progress"
   - "Adjust my goals"

---

## 🐛 Known Issues (Fixed)

### ✅ viewMode is not defined
**Status:** Fixed
**Location:** Goals page
**Fix:** Changed `viewMode` to `filters.view` in two locations

**Verification:**
1. Navigate to `/plan/maal`
2. Change view to "Completed"
3. Should not see "viewMode is not defined" error
4. Empty state message should appear correctly

---

## 🧪 Browser Testing

### Cache Clearing
**If you don't see changes:**
1. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
2. Or clear cache: `chrome://settings/clearBrowserData`
3. Select "Cached images and files"
4. Time range: "Last hour"
5. Click "Clear data"

### Browser Compatibility
Test in:
- ✅ Chrome (primary)
- ✅ Safari
- ✅ Firefox
- ✅ Edge

---

## 📊 Success Criteria

All Phase 4 features should be:
- ✅ Visually consistent with tier design tokens
- ✅ Functionally working without errors
- ✅ Accessible (keyboard navigation, screen readers)
- ✅ Responsive (mobile, tablet, desktop)
- ✅ URL filters are shareable and bookmarkable

---

## 🎨 Visual Design Verification

### Tier Branding Checklist
- [ ] All gold accents use `tier-gold` token
- [ ] All navy colors use `tier-navy` token
- [ ] Buttons use tier color variants
- [ ] Hover states are consistent
- [ ] Icons use appropriate tier colors
- [ ] Badges use tier-gold background
- [ ] Borders use tier-navy with opacity

### Component Verification
- [ ] CollapsibleFilterDrawer has gold Filter icon
- [ ] AICoachGuide has gold left border
- [ ] AICoachGuide has Sparkles icon in navy circle
- [ ] Filter badges show gold background
- [ ] "Clear all" buttons have proper styling

---

## 🚀 Next Steps

After testing all features:
1. Report any visual inconsistencies
2. Report any functional bugs
3. Verify on mobile devices
4. Test with screen reader
5. Ready for production deployment

---

**Testing Priority:** High
**Expected Testing Time:** 30-45 minutes
**Blocker Issues:** None

**Contact:** If issues found, provide:
- URL where issue occurs
- Browser and version
- Screenshot of issue
- Steps to reproduce
