/**
 * Analytics Module
 *
 * Eksporterer alle analytics-relaterte funksjoner og komponenter.
 */

// Core tracking
export { track, identify, resetAnalytics } from './track';
export type { AnalyticsEventName, BasePayload } from './track';

// Event client (standardized event logging)
export { eventClient, useEventClient } from './eventClient';
export type {
  CriticalEventName,
  NavigationEventName,
  AllEventName,
  BaseEventPayload,
  EventContext,
  EventPayload,
} from './eventClient';

// Screen view hook
export { useScreenView } from './useScreenView';

// Debug (dev only)
export { default as AnalyticsDebug, pushDebugEvent } from './AnalyticsDebug';
