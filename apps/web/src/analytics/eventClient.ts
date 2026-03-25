/**
 * ============================================================
 * Event Client - Standardisert event-logging
 * TIER Golf
 * ============================================================
 *
 * Sentral event-klient som sikrer konsistent event-struktur
 * og korrekt trigger-tidspunkt.
 *
 * KRITISKE REGLER:
 * 1. Events trigges KUN ved reell fullføring og bekreftet lagring
 * 2. INGEN autosave-events
 * 3. IKKE ved start eller navigasjon/refresh
 * 4. Må være idempotent (unngå duplikater ved retry/refresh)
 *
 * EVENTS:
 * - structured_session_completed: Fullført økt/test-registrering
 * - training_log_submitted: Vellykket lagring fra treningslogg
 * - plan_confirmed: Eksplisitt bekreftelse av ukeplan
 * - feedback_received: Vellykket sending av trenerfeedback
 *
 * ============================================================
 */

import { track as analyticsTrack, identify, resetAnalytics } from './track';

// ────────────────────────────────────────────────────────────
// Event Types
// ────────────────────────────────────────────────────────────

export type CriticalEventName =
  | 'structured_session_completed'
  | 'training_log_submitted'
  | 'plan_confirmed'
  | 'feedback_received';

export type NavigationEventName =
  | 'screen_view'
  | 'navigation_click';

export type AllEventName = CriticalEventName | NavigationEventName;

// ────────────────────────────────────────────────────────────
// Payload Types
// ────────────────────────────────────────────────────────────

/**
 * Minimum payload som ALLE events må ha
 */
export interface BaseEventPayload {
  user_id: string;
  org_id: string;
  timestamp: string;  // ISO 8601
  source: 'ui' | 'api' | 'system';
}

/**
 * Anbefalt kontekst for events
 */
export interface EventContext {
  role: 'player' | 'coach' | 'admin';
  page: string;
  entity_id?: string;
  entity_type?: string;
}

/**
 * Komplett event-payload
 */
export interface EventPayload extends BaseEventPayload {
  context?: EventContext;
  [key: string]: unknown;
}

// ────────────────────────────────────────────────────────────
// Idempotency Cache (prevents duplicate events on refresh/retry)
// ────────────────────────────────────────────────────────────

const EVENT_CACHE_KEY = 'ak_event_cache';
const EVENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedEvent {
  key: string;
  timestamp: number;
}

function getEventCache(): CachedEvent[] {
  try {
    const cached = sessionStorage.getItem(EVENT_CACHE_KEY);
    if (!cached) return [];
    return JSON.parse(cached);
  } catch {
    return [];
  }
}

function setEventCache(events: CachedEvent[]): void {
  try {
    sessionStorage.setItem(EVENT_CACHE_KEY, JSON.stringify(events));
  } catch {
    // Silent fail - cache is optional optimization
  }
}

function cleanExpiredEvents(): CachedEvent[] {
  const now = Date.now();
  const events = getEventCache().filter(e => now - e.timestamp < EVENT_CACHE_TTL);
  setEventCache(events);
  return events;
}

function isEventDuplicate(eventKey: string): boolean {
  const events = cleanExpiredEvents();
  return events.some(e => e.key === eventKey);
}

function markEventSent(eventKey: string): void {
  const events = cleanExpiredEvents();
  events.push({ key: eventKey, timestamp: Date.now() });
  setEventCache(events);
}

function generateEventKey(eventName: string, payload: Record<string, unknown>): string {
  const keyParts = [
    eventName,
    payload.user_id,
    payload.entity_id,
    payload.timestamp?.toString().slice(0, 16) // Minute precision
  ].filter(Boolean);
  return keyParts.join('_');
}

// ────────────────────────────────────────────────────────────
// Event Client Class
// ────────────────────────────────────────────────────────────

class EventClient {
  private userId: string | null = null;
  private orgId: string | null = null;
  private role: 'player' | 'coach' | 'admin' = 'player';

  /**
   * Initialiser event-klient med brukerinfo
   * Kall denne ved innlogging
   */
  init(userId: string, orgId: string, role: 'player' | 'coach' | 'admin' = 'player'): void {
    this.userId = userId;
    this.orgId = orgId;
    this.role = role;
    identify(userId, { role });
  }

  /**
   * Nullstill ved utlogging
   */
  reset(): void {
    this.userId = null;
    this.orgId = null;
    this.role = 'player';
    resetAnalytics();
  }

  /**
   * Bygg base-payload for alle events
   */
  private buildBasePayload(): BaseEventPayload {
    return {
      user_id: this.userId || 'anonymous',
      org_id: this.orgId || 'unknown',
      timestamp: new Date().toISOString(),
      source: 'ui',
    };
  }

  /**
   * Bygg kontekst for event
   */
  private buildContext(page: string, entityId?: string, entityType?: string): EventContext {
    return {
      role: this.role,
      page,
      entity_id: entityId,
      entity_type: entityType,
    };
  }

  // ────────────────────────────────────────────────────────────
  // Kritiske Events (med idempotency)
  // ────────────────────────────────────────────────────────────

  /**
   * Event: Strukturert økt fullført
   * Trigger: Ved fullført strukturert økt ELLER lagret testresultat
   */
  structuredSessionCompleted(params: {
    sessionId?: string;
    sessionType: 'training' | 'test' | 'evaluation';
    durationMinutes?: number;
    page: string;
  }): boolean {
    const payload = {
      ...this.buildBasePayload(),
      context: this.buildContext(params.page, params.sessionId, params.sessionType),
      session_type: params.sessionType,
      duration_minutes: params.durationMinutes,
      entity_id: params.sessionId,
    };

    const eventKey = generateEventKey('structured_session_completed', payload);
    if (isEventDuplicate(eventKey)) {
      console.info('[EventClient] Skipping duplicate: structured_session_completed');
      return false;
    }

    analyticsTrack('structured_session_completed', payload);
    markEventSent(eventKey);
    return true;
  }

  /**
   * Event: Treningslogg lagret
   * Trigger: Ved vellykket lagring fra /tren/logg
   */
  trainingLogSubmitted(params: {
    logId?: string;
    durationMinutes?: number;
    exerciseCount?: number;
    page: string;
  }): boolean {
    const payload = {
      ...this.buildBasePayload(),
      context: this.buildContext(params.page, params.logId, 'training_log'),
      duration_minutes: params.durationMinutes,
      exercise_count: params.exerciseCount,
      entity_id: params.logId,
    };

    const eventKey = generateEventKey('training_log_submitted', payload);
    if (isEventDuplicate(eventKey)) {
      console.info('[EventClient] Skipping duplicate: training_log_submitted');
      return false;
    }

    analyticsTrack('training_log_submitted', payload);
    markEventSent(eventKey);
    return true;
  }

  /**
   * Event: Plan bekreftet
   * Trigger: KUN ved eksplisitt "Bekreft ukeplan" på /planlegg/ukeplan
   */
  planConfirmed(params: {
    planId?: string;
    weekNumber?: number;
    year?: number;
    page: string;
  }): boolean {
    const payload = {
      ...this.buildBasePayload(),
      context: this.buildContext(params.page, params.planId, 'weekly_plan'),
      week_number: params.weekNumber,
      year: params.year,
      entity_id: params.planId,
    };

    const eventKey = generateEventKey('plan_confirmed', payload);
    if (isEventDuplicate(eventKey)) {
      console.info('[EventClient] Skipping duplicate: plan_confirmed');
      return false;
    }

    analyticsTrack('plan_confirmed', payload);
    markEventSent(eventKey);
    return true;
  }

  /**
   * Event: Feedback mottatt
   * Trigger: Ved vellykket sending av trenerfeedback
   */
  feedbackReceived(params: {
    feedbackId?: string;
    feedbackType: 'session' | 'plan' | 'general';
    fromCoachId?: string;
    page: string;
  }): boolean {
    const payload = {
      ...this.buildBasePayload(),
      context: this.buildContext(params.page, params.feedbackId, 'feedback'),
      feedback_type: params.feedbackType,
      from_coach_id: params.fromCoachId,
      entity_id: params.feedbackId,
    };

    const eventKey = generateEventKey('feedback_received', payload);
    if (isEventDuplicate(eventKey)) {
      console.info('[EventClient] Skipping duplicate: feedback_received');
      return false;
    }

    analyticsTrack('feedback_received', payload);
    markEventSent(eventKey);
    return true;
  }

  // ────────────────────────────────────────────────────────────
  // Navigasjon Events (uten idempotency - kan logges flere ganger)
  // ────────────────────────────────────────────────────────────

  /**
   * Event: Skjermvisning
   * Trigger: Ved navigasjon til ny side
   */
  screenView(screen: string, path: string): void {
    analyticsTrack('screen_view', {
      ...this.buildBasePayload(),
      screen,
      path,
    });
  }
}

// ────────────────────────────────────────────────────────────
// Singleton Export
// ────────────────────────────────────────────────────────────

export const eventClient = new EventClient();

// ────────────────────────────────────────────────────────────
// Convenience Hooks
// ────────────────────────────────────────────────────────────

/**
 * Hook for å bruke eventClient i React-komponenter
 */
export function useEventClient() {
  return eventClient;
}

export default eventClient;
