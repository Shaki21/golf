/**
 * Analytics Tracking Module
 *
 * Lightweight analytics wrapper that logs events.
 * DEV: Logs to console
 * PROD: Integrates with Posthog (if REACT_APP_POSTHOG_KEY is set)
 *
 * To enable Posthog:
 *   1. npm install posthog-js
 *   2. Set REACT_APP_POSTHOG_KEY and REACT_APP_POSTHOG_HOST in .env
 *
 * @example
 * track('screen_view', { screen: 'Dashboard', path: '/dashboard' })
 */

import { pushDebugEvent } from './AnalyticsDebug';

const IS_DEV = process.env.NODE_ENV === 'development';
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://eu.posthog.com';

// Lazy-load Posthog
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthog: any = null;
let posthogInitialized = false;

async function initPosthog(): Promise<void> {
  if (!POSTHOG_KEY || posthogInitialized) return;

  try {
    const posthogModule = await import('posthog-js');
    posthog = posthogModule.default;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // We handle this manually
      autocapture: false, // Privacy-focused
      persistence: 'localStorage',
      disable_session_recording: true,
    });
    posthogInitialized = true;
  } catch {
    // Posthog not installed - silent fail
  }
}

// Initialize on load if key is present
if (POSTHOG_KEY) {
  initPosthog();
}

export type AnalyticsEventName =
  | 'screen_view'
  | 'plan_confirmed'
  | 'training_log_submitted'
  | 'structured_session_completed'
  | 'feedback_received'
  // Calendar events
  | 'calendar_view_open'
  | 'calendar_click_today'
  | 'calendar_click_new_session'
  | 'calendar_event_open'
  | 'calendar_event_start_workout';

export interface BasePayload {
  source?: string;
  screen?: string;
  id?: string;
  date?: string;
  type?: string;
}

// Allowed payload keys (whitelist approach)
const ALLOWED_KEYS = new Set([
  'source', 'screen', 'id', 'date', 'type', 'path', 'action',
  // Calendar-specific keys
  'view', 'week_start_date', 'event_id', 'event_type', 'recommended', 'planned'
]);

// Keys that should NEVER be sent (blocklist as safety net)
const BLOCKED_KEYS = new Set([
  'email', 'password', 'token', 'accessToken', 'refreshToken',
  'name', 'firstName', 'lastName', 'phone', 'address',
  'note', 'notes', 'comment', 'comments', 'message',
  'authorization', 'auth', 'secret', 'key', 'apiKey'
]);

/**
 * Sanitize payload to prevent sensitive data leakage
 * Uses whitelist + blocklist approach
 */
function sanitizePayload(
  payload?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!payload) return undefined;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();

    // Block known sensitive keys
    if (BLOCKED_KEYS.has(lowerKey)) {
      if (IS_DEV) {
        console.warn(`[Analytics] Blocked sensitive key: ${key}`);
      }
      continue;
    }

    // Only allow whitelisted keys
    if (ALLOWED_KEYS.has(key)) {
      // Ensure value is primitive (no objects/arrays)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Track an analytics event
 * @param name - Event name from AnalyticsEventName
 * @param payload - Event data (no PII)
 */
export function track(
  name: AnalyticsEventName,
  payload?: BasePayload & Record<string, unknown>
): void {
  // Sanitize payload to prevent sensitive data leakage
  const safePayload = sanitizePayload(payload);

  const timestamp = new Date().toISOString();
  const eventData = {
    event: name,
    timestamp,
    ...safePayload,
  };

  if (IS_DEV) {
    console.info(`[Analytics] ${name}`, eventData);
    pushDebugEvent(name, safePayload);
    return;
  }

  // Send to Posthog if configured
  if (posthog && posthogInitialized) {
    posthog.capture(name, safePayload);
  }
}

/**
 * Identify a user (for when user logs in)
 * @param userId - User ID
 * @param traits - User traits (no PII like name/email)
 */
export function identify(
  userId: string,
  traits?: { role?: string; tier?: string }
): void {
  if (IS_DEV) {
    console.info('[Analytics] identify', { userId, ...traits });
    return;
  }

  // Send to Posthog if configured
  if (posthog && posthogInitialized) {
    posthog.identify(userId, traits);
  }
}

/**
 * Reset analytics (for when user logs out)
 */
export function resetAnalytics(): void {
  if (posthog && posthogInitialized) {
    posthog.reset();
  }
}
