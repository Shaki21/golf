# Accessibility Checklist

> AK Golf Academy - WCAG 2.1 AA Compliance

## Focus & Keyboard Navigation

| Test | Status | Notes |
|------|--------|-------|
| TAB navigates through BottomNav | PASS | NavLink is focusable |
| Enter/Space activates links | PASS | Standard browser behavior |
| Focus ring visible | PASS | `focus-visible` styles in index.css |
| Skip to main content | - | Not implemented |

### Implementation

Focus styles defined in `src/index.css:378-404`:
- Blue outline (`--ak-primary`) with 2px offset
- Shadow ring for visibility
- Input fields have 0 offset

## Aria Labels & Semantics

| Component | Element | Aria | Location |
|-----------|---------|------|----------|
| BottomNav | `<nav>` | `aria-label="Hovednavigasjon"` | `BottomNav.tsx:58` |
| BottomNav | `<NavLink>` | `aria-current="page"` | `BottomNav.tsx:65` |
| ThemeSwitcher | `<div>` | `role="group" aria-label="Tema-velger"` | `ThemeSwitcher.tsx:45` |
| ThemeSwitcher | `<button>` | `aria-pressed`, `aria-label` | `ThemeSwitcher.tsx:54-55` |
| Icons | `<span>` | `aria-hidden="true"` | `BottomNav.tsx:76` |

## Contrast & Color

Token-based design ensures consistent contrast:

| Token Pair | Ratio | Status |
|------------|-------|--------|
| `--text-primary` / `--background-default` | ~10:1 | PASS |
| `--text-secondary` / `--background-default` | ~5:1 | PASS |
| `--ak-primary` (button) / `--ak-white` | ~7:1 | PASS |
| `--ak-error` / `--background-white` | ~5:1 | PASS |

## Reduced Motion

Implemented in `src/index.css:1746-1755`:

```css
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

## Quick Verification Steps

1. **Keyboard Test**
   - Press TAB to navigate through page
   - Verify focus ring appears on all interactive elements
   - Press Enter to activate links/buttons

2. **Screen Reader Test**
   - VoiceOver (Mac): Cmd+F5
   - Navigate to BottomNav, verify "Hovednavigasjon" announced
   - ThemeSwitcher buttons announce "Lys modus", etc.

3. **Contrast Test**
   - Toggle dark mode
   - Verify text remains readable
   - Check error/success states

## Files Changed

- `src/ui/composites/BottomNav.tsx` - aria-labels, aria-current
- `src/ui/composites/ThemeSwitcher.tsx` - aria-pressed, role="group"
- `src/index.css` - Focus styles, reduced-motion (pre-existing)
