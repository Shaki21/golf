/**
 * Calendar Integration Service
 * Supports Google Calendar and iCal export
 */

import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Calendar event structure
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'training' | 'tournament' | 'test' | 'meeting' | 'other';
  attendees?: string[];
  reminders?: { minutes: number; method: 'email' | 'popup' }[];
}

/**
 * Generate iCal format for events
 */
export function generateICalFeed(events: CalendarEvent[], calendarName: string = 'AK Golf Academy'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AK Golf Academy//IUP Golf//NO',
    `X-WR-CALNAME:${calendarName}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    lines.push(...generateICalEvent(event));
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Generate single iCal event
 */
function generateICalEvent(event: CalendarEvent): string[] {
  const uid = `${event.id}@akgolf.no`;
  const now = formatICalDate(new Date());
  const start = formatICalDate(event.startTime);
  const end = formatICalDate(event.endTime);

  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICalText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  // Add category based on type
  const categoryMap = {
    training: 'TRAINING,GOLF',
    tournament: 'TOURNAMENT,COMPETITION',
    test: 'TEST,EVALUATION',
    meeting: 'MEETING',
    other: 'OTHER',
  };
  lines.push(`CATEGORIES:${categoryMap[event.type] || 'OTHER'}`);

  // Add reminders
  if (event.reminders) {
    for (const reminder of event.reminders) {
      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:-PT${reminder.minutes}M`);
      lines.push(reminder.method === 'email' ? 'ACTION:EMAIL' : 'ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeICalText(event.title)}`);
      lines.push('END:VALARM');
    }
  }

  lines.push('END:VEVENT');

  return lines;
}

/**
 * Format date for iCal
 */
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters in iCal text
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Google Calendar OAuth configuration
 */
export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Google Calendar Integration
 */
export class GoogleCalendarService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(config: GoogleCalendarConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Create calendar event
   */
  async createEvent(
    accessToken: string,
    event: CalendarEvent,
    calendarId: string = 'primary'
  ): Promise<string> {
    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'Europe/Oslo',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'Europe/Oslo',
      },
      reminders: event.reminders ? {
        useDefault: false,
        overrides: event.reminders.map((r) => ({
          method: r.method,
          minutes: r.minutes,
        })),
      } : { useDefault: true },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logger.error({ error }, 'Failed to create Google Calendar event');
      throw new Error('Failed to create calendar event');
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    accessToken: string,
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<void> {
    const googleEvent: Record<string, unknown> = {};

    if (event.title) googleEvent.summary = event.title;
    if (event.description) googleEvent.description = event.description;
    if (event.location) googleEvent.location = event.location;
    if (event.startTime) {
      googleEvent.start = {
        dateTime: event.startTime.toISOString(),
        timeZone: 'Europe/Oslo',
      };
    }
    if (event.endTime) {
      googleEvent.end = {
        dateTime: event.endTime.toISOString(),
        timeZone: 'Europe/Oslo',
      };
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(
    accessToken: string,
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * List events in a time range
   */
  async listEvents(
    accessToken: string,
    startTime: Date,
    endTime: Date,
    calendarId: string = 'primary'
  ): Promise<unknown[]> {
    const params = new URLSearchParams({
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list calendar events');
    }

    const data = await response.json();
    return data.items || [];
  }
}

/**
 * Create Google Calendar service instance
 */
export function createGoogleCalendarService(): GoogleCalendarService | null {
  const clientId = config.google?.clientId;
  const clientSecret = config.google?.clientSecret;
  const redirectUri = config.google?.redirectUri;

  if (!clientId || !clientSecret || !redirectUri) {
    logger.info('Google Calendar integration not configured');
    return null;
  }

  return new GoogleCalendarService({
    clientId,
    clientSecret,
    redirectUri,
  });
}

export default {
  generateICalFeed,
  GoogleCalendarService,
  createGoogleCalendarService,
};
