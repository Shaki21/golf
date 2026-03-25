# Security & Privacy

> AK Golf Academy - Frontend Security Guidelines

## Sensitive Data Handling

### What We NEVER Log or Send

| Data Type | Logged? | Analytics? | Notes |
|-----------|---------|------------|-------|
| Auth tokens | NO | NO | Cleared on 401 |
| Passwords | NO | NO | Never stored |
| Email addresses | NO | NO | Not tracked |
| User names | NO | NO | Only user ID |
| Free-text notes | NO | NO | User content |
| Full API responses | NO | NO | Only status codes |
| Stack traces | DEV only | NO | Hidden in PROD |

### Analytics Payload Sanitization

Location: `src/analytics/track.ts`

**Whitelist approach** - Only these keys are allowed:
- `source`, `screen`, `id`, `date`, `type`, `path`, `action`

**Blocklist** - These keys are automatically stripped:
- `email`, `password`, `token`, `accessToken`, `refreshToken`
- `name`, `firstName`, `lastName`, `phone`, `address`
- `note`, `notes`, `comment`, `comments`, `message`
- `authorization`, `auth`, `secret`, `key`, `apiKey`

**Additional safety:**
- Only primitive values (string/number/boolean) are sent
- Objects and arrays are automatically excluded

## Error Handling

### Error Reporter (`src/utils/errorReporter.ts`)

| Function | DEV Behavior | PROD Behavior |
|----------|--------------|---------------|
| `captureException` | Console + stack trace | Silent |
| `captureMessage` | Console | Silent |
| `captureAPIError` | Console (endpoint, status) | Silent |

**Production notes:**
- All error logging is DEV-only by default
- PROD has no console output
- TODO: Integrate Sentry for production error tracking

### API Client (`src/services/apiClient.js`)

- Authorization header set only when token exists
- 401: Clears tokens, redirects to login
- 403: Logs URL only (no token/body)
- Network errors: Generic user-facing message
- Backend error messages: NOT exposed in UI (standardized error returned)

## DEV-Only Features

These features are completely disabled in production builds:

| Feature | File | Guard |
|---------|------|-------|
| State simulation (`?state=`) | `src/dev/simulateState.ts` | `IS_DEV` check, returns `null` |
| Analytics debug overlay | `src/analytics/AnalyticsDebug.tsx` | `IS_DEV` check, returns `null` |
| UI Lab routes | `src/App.jsx:356` | `{IS_DEV && (...)}` |
| Console logging | Various | `if (IS_DEV)` blocks |

### Verification

All DEV-only code uses this pattern:
```typescript
const IS_DEV = process.env.NODE_ENV === 'development';

if (!IS_DEV) {
  return null; // or early return
}
```

## CSP & Inline Code

### No Inline Scripts

- `public/index.html` contains NO inline `<script>` tags
- All JavaScript is bundled via webpack

### No dangerouslySetInnerHTML

- Searched codebase: **0 instances found**
- All content is rendered via React's safe JSX

### No eval()

- No dynamic code execution in the codebase

## Token Storage

| Token | Storage | Cleared On |
|-------|---------|------------|
| `accessToken` | localStorage | Logout, 401 |
| `userData` | localStorage | Logout, 401 |

**Note:** Consider migrating to httpOnly cookies for enhanced security.

## Known TODOs

| Item | Priority | Description |
|------|----------|-------------|
| Sentry integration | P1 | Replace console logging with Sentry in PROD |
| Analytics provider | P1 | Connect to Segment/Amplitude/Posthog |
| httpOnly cookies | P2 | Move tokens from localStorage |
| CSP headers | P2 | Add Content-Security-Policy in server |

## Audit Checklist

Before each release:

- [ ] No new `console.log` with sensitive data
- [ ] Analytics payloads only use whitelisted keys
- [ ] DEV-only features have `IS_DEV` guards
- [ ] No inline scripts added to HTML
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] API errors show generic messages (not backend details)

## Files Reference

| File | Purpose |
|------|---------|
| `src/analytics/track.ts` | Payload sanitization |
| `src/utils/errorReporter.ts` | DEV-only error logging |
| `src/services/apiClient.js` | Auth header, 401/403 handling |
| `src/dev/simulateState.ts` | DEV-only state simulation |
| `src/analytics/AnalyticsDebug.tsx` | DEV-only debug overlay |
