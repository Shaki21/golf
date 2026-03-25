import { FastifyPluginAsync } from 'fastify';
import prisma from '../../../core/db/prisma';
import { domainViolation } from '../../../core/errors';
import { BadgeEvaluatorService } from '../../../domain/gamification/badge-evaluator';
import { generateICalFeed, createGoogleCalendarService, CalendarEvent } from '../../../services/calendar-integration';
import { logger } from '../../../utils/logger';
import { config } from '../../../config';

const calendarRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all events (training, tournaments, samlinger)
  fastify.get('/events', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { tenantId: string; playerId?: string };

      const events = await prisma.event.findMany({
        where: { tenantId: user.tenantId },
        include: {
          tournament: true,
          participants: {
            where: user.playerId ? { playerId: user.playerId } : undefined,
          },
        },
        orderBy: { startTime: 'asc' },
      });

      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.eventType,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        status: event.status,
        maxParticipants: event.maxParticipants,
        currentCount: event.currentCount,
        // Tournament-specific data
        tournament: event.tournament ? {
          id: event.tournament.id,
          tournamentType: event.tournament.tournamentType,
          level: event.tournament.level,
          courseName: event.tournament.courseName,
          par: event.tournament.par,
          format: event.tournament.format,
          numberOfRounds: event.tournament.numberOfRounds,
          entryFee: event.tournament.entryFee,
        } : null,
        // Participant status for current user
        isRegistered: event.participants.length > 0,
        registrationStatus: event.participants[0]?.status || null,
      }));
    },
  });

  // ============================================
  // External Tournament Calendar (for Turneringskalender)
  // ============================================

  /**
   * GET /external-tournaments
   * Get all external tournaments from various tour sources
   * This endpoint returns tournaments from DP World Tour, Nordic League,
   * Srixon Tour, etc. for the tournament calendar feature.
   */
  fastify.get<{
    Querystring: {
      tour?: string | string[];
      category?: string | string[];
      country?: string | string[];
      status?: string | string[];
      startDate?: string;
      endDate?: string;
      search?: string;
    };
  }>('/external-tournaments', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const query = req.query;

      // For now, return a message that frontend should use local data
      // In production, this would fetch from external APIs or a database
      // that syncs with tour websites

      // Parse array params
      const tours = query.tour
        ? (Array.isArray(query.tour) ? query.tour : [query.tour])
        : undefined;
      const categories = query.category
        ? (Array.isArray(query.category) ? query.category : [query.category])
        : undefined;
      const countries = query.country
        ? (Array.isArray(query.country) ? query.country : [query.country])
        : undefined;

      return {
        tournaments: [],
        total: 0,
        message: 'External tournament data is served from frontend static data. ' +
                 'In production, this endpoint would aggregate from tour APIs.',
        filters: {
          tours,
          categories,
          countries,
          startDate: query.startDate,
          endDate: query.endDate,
          search: query.search,
        },
        sources: [
          { tour: 'dp_world_tour', source: 'DP World Tour API', status: 'static' },
          { tour: 'challenge_tour', source: 'Challenge Tour API', status: 'static' },
          { tour: 'nordic_league', source: 'ECCO Tour / Swedish Tour', status: 'static' },
          { tour: 'garmin_norges_cup', source: 'Golf.no / GolfBox', status: 'static' },
          { tour: 'srixon_tour', source: 'Golf.no / GolfBox', status: 'static' },
          { tour: 'junior_tour_regional', source: 'MinGolf.no', status: 'static' },
          { tour: 'wagr_turnering', source: 'WAGR API', status: 'static' },
          { tour: 'ega_turnering', source: 'EGA API', status: 'static' },
          { tour: 'pga_tour', source: 'PGA Tour API', status: 'static' },
        ],
      };
    },
  });

  /**
   * POST /sync-tournaments
   * Trigger a sync of external tournament data (admin only)
   */
  fastify.post('/sync-tournaments', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { role: string };

      if (user.role !== 'admin') {
        return {
          success: false,
          error: 'Only admins can trigger tournament sync',
        };
      }

      // In production, this would:
      // 1. Call external APIs (GolfBox, DP World Tour, etc.)
      // 2. Parse and normalize tournament data
      // 3. Store in database with hierarchy mapping
      // 4. Return sync status

      return {
        success: true,
        message: 'Tournament sync placeholder. Real implementation would fetch from external APIs.',
        lastSync: new Date().toISOString(),
        sources: {
          dp_world_tour: { status: 'static', count: 36 },
          challenge_tour: { status: 'static', count: 6 },
          nordic_league: { status: 'static', count: 11 },
          garmin_norges_cup: { status: 'static', count: 9 },
          srixon_tour: { status: 'static', count: 9 },
          junior_tour_regional: { status: 'static', count: 12 },
          global_junior_tour: { status: 'static', count: 4 },
          ega_turnering: { status: 'static', count: 4 },
          wagr_turnering: { status: 'static', count: 4 },
          college_turneringer: { status: 'static', count: 4 },
          pga_tour: { status: 'static', count: 5 },
          academy: { status: 'static', count: 3 },
        },
        totalTournaments: 107,
      };
    },
  });

  // Get tournaments only (internal/registered)
  fastify.get('/tournaments', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { tenantId: string; playerId?: string };

      const tournaments = await prisma.tournament.findMany({
        include: {
          event: {
            include: {
              participants: user.playerId ? {
                where: { playerId: user.playerId },
              } : false,
            },
          },
        },
        orderBy: { event: { startTime: 'asc' } },
      });

      return tournaments.map(t => ({
        id: t.id,
        eventId: t.eventId,
        name: t.event.title,
        description: t.event.description,
        startDate: t.event.startTime,
        endDate: t.event.endTime,
        location: t.event.location,
        status: t.event.status,
        tournamentType: t.tournamentType,
        level: t.level,
        courseName: t.courseName,
        par: t.par,
        courseRating: t.courseRating,
        slopeRating: t.slopeRating,
        format: t.format,
        numberOfRounds: t.numberOfRounds,
        entryFee: t.entryFee,
        prizePool: t.prizePool,
        isRegistered: t.event.participants && t.event.participants.length > 0,
        registrationStatus: t.event.participants?.[0]?.status || null,
      }));
    },
  });

  // Get my registered tournaments
  fastify.get('/my-tournaments', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { tenantId: string; playerId?: string };

      if (!user.playerId) {
        return { upcoming: [], past: [] };
      }

      const now = new Date();

      // Get tournaments where player is registered
      const registrations = await prisma.eventParticipant.findMany({
        where: {
          playerId: user.playerId,
          event: {
            eventType: 'tournament',
          },
        },
        include: {
          event: {
            include: {
              tournament: true,
            },
          },
        },
        orderBy: { event: { startTime: 'asc' } },
      });

      const upcoming = registrations
        .filter(r => r.event.startTime >= now)
        .map(r => ({
          id: r.event.tournament?.id || r.eventId,
          name: r.event.title,
          startDate: r.event.startTime,
          endDate: r.event.endTime,
          location: r.event.tournament?.courseName || r.event.location,
          status: r.status,
          format: r.event.tournament?.format || '',
          numberOfRounds: r.event.tournament?.numberOfRounds || 1,
          level: r.event.tournament?.level || '',
          registrationDate: r.createdAt,
        }));

      // Get past tournament results
      const results = await prisma.tournamentResult.findMany({
        where: { playerId: user.playerId },
        include: {
          tournament: {
            include: { event: true },
          },
        },
        orderBy: { tournament: { event: { startTime: 'desc' } } },
      });

      const past = results.map(r => ({
        id: r.id,
        name: r.tournament.event.title,
        date: r.tournament.event.startTime,
        location: r.tournament.courseName,
        position: r.position,
        totalScore: r.totalScore,
        scoreToPar: r.scoreToPar,
      }));

      return { upcoming, past };
    },
  });

  // Get single event details
  fastify.get('/event/:id', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const { id } = req.params as { id: string };
      const user = req.user as { tenantId: string; playerId?: string };

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          tournament: true,
          participants: true,
        },
      });

      if (!event) {
        throw domainViolation('Event not found');
      }

      const isRegistered = user.playerId
        ? event.participants.some(p => p.playerId === user.playerId)
        : false;

      return {
        ...event,
        isRegistered,
        participantCount: event.participants.length,
      };
    },
  });

  // ============================================
  // Add External Tournament to Calendar
  // ============================================

  /**
   * POST /add-tournament
   * Add an external tournament to the user's calendar
   */
  fastify.post<{
    Body: {
      tournamentId: string;
      name: string;
      startDate: string;
      endDate: string;
      venue: string;
      city: string;
      country: string;
      tour: string;
      format?: string;
      entryFee?: number;
      registrationUrl?: string;
    };
  }>('/add-tournament', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { id: string; tenantId: string; playerId?: string };
      const data = req.body;

      // Create calendar event for the tournament
      const event = await prisma.event.create({
        data: {
          title: data.name,
          description: `${data.tour} turnering på ${data.venue}, ${data.city}, ${data.country}.\n${data.format || ''}\n${data.registrationUrl ? `Påmelding: ${data.registrationUrl}` : ''}`,
          eventType: 'tournament',
          startTime: new Date(data.startDate),
          endTime: new Date(data.endDate),
          location: `${data.venue}, ${data.city}`,
          status: 'upcoming',
          tenantId: user.tenantId,
          metadata: {
            externalTournamentId: data.tournamentId,
            tour: data.tour,
            country: data.country,
            entryFee: data.entryFee,
            registrationUrl: data.registrationUrl,
          },
        },
      });

      // Register player as participant if playerId exists
      if (user.playerId) {
        await prisma.eventParticipant.create({
          data: {
            eventId: event.id,
            playerId: user.playerId,
            status: 'registered',
          },
        });
      }

      // If Google Calendar is connected, sync to Google
      const integration = await prisma.calendarIntegration.findFirst({
        where: { userId: user.id, provider: 'google' },
      });

      let googleEventId: string | null = null;
      if (integration && googleCalendar) {
        try {
          const calEvent: CalendarEvent = {
            id: event.id,
            title: data.name,
            description: event.description || undefined,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location || undefined,
            type: 'tournament',
          };

          googleEventId = await googleCalendar.createEvent(integration.accessToken, calEvent);

          await prisma.calendarSync.create({
            data: {
              localEventId: event.id,
              localEventType: 'event',
              integrationId: integration.id,
              externalEventId: googleEventId,
            },
          });
        } catch (error) {
          logger.warn({ error }, 'Failed to sync tournament to Google Calendar');
        }
      }

      return {
        success: true,
        eventId: event.id,
        googleEventId,
        message: `"${data.name}" lagt til i kalenderen`,
      };
    },
  });

  // Record tournament result
  fastify.post<{
    Body: {
      tournamentId: string;
      playerId: string;
      position?: number;
      totalScore: number;
      scoreToPar: number;
      roundScores: number[];
      strokesGained?: Record<string, number>;
      fairwaysHit?: number;
      greensInRegulation?: number;
      puttsPerRound?: number;
      notes?: string;
    };
  }>('/tournament-result', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { tenantId: string; role: string };
      const { tournamentId, playerId, ...data } = req.body;

      // Only coaches/admins can record results
      if (!['coach', 'admin'].includes(user.role)) {
        throw domainViolation('Only coaches can record tournament results');
      }

      // Verify tournament exists
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        throw domainViolation('Tournament not found');
      }

      // Create tournament result
      const result = await prisma.tournamentResult.create({
        data: {
          tournamentId,
          playerId,
          position: data.position,
          totalScore: data.totalScore,
          scoreToPar: data.scoreToPar,
          roundScores: data.roundScores,
          strokesGained: data.strokesGained,
          fairwaysHit: data.fairwaysHit,
          greensInRegulation: data.greensInRegulation,
          puttsPerRound: data.puttsPerRound,
          notes: data.notes,
        },
      });

      // Evaluate badges after tournament result
      let badgeUnlocks;
      let xpGained;
      let newLevel;

      try {
        const badgeEvaluator = new BadgeEvaluatorService(prisma);
        const badgeResult = await badgeEvaluator.evaluatePlayerBadges(playerId);
        badgeUnlocks = badgeResult.unlockedBadges;
        xpGained = badgeResult.xpGained;
        newLevel = badgeResult.newLevel;
      } catch (error) {
        logger.error({ error }, 'Badge evaluation failed');
      }

      return {
        result,
        badgeUnlocks,
        xpGained,
        newLevel,
      };
    },
  });

  // ============================================
  // iCal Feed Export
  // ============================================

  /**
   * GET /ical/:token
   * Public iCal feed for calendar subscriptions
   */
  fastify.get('/ical/:token', {
    handler: async (req, reply) => {
      const { token } = req.params as { token: string };

      // Find user by calendar token
      const user = await prisma.user.findUnique({
        where: { calendarToken: token },
        include: {
          player: true,
          coach: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'Invalid calendar token' });
      }

      // Get events for this user
      const events = await prisma.event.findMany({
        where: {
          tenantId: user.tenantId,
          OR: [
            // Events where user is participant (as player)
            ...(user.player ? [{ participants: { some: { playerId: user.player.id } } }] : []),
            // Events where user is the coach
            ...(user.coach ? [{ coachId: user.coach.id }] : []),
          ],
        },
        include: { tournament: true },
        orderBy: { startTime: 'asc' },
      });

      // Convert to CalendarEvent format
      const calendarEvents: CalendarEvent[] = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || undefined,
        type: event.eventType as CalendarEvent['type'],
      }));

      const userName = user.player
        ? `${user.player.firstName} ${user.player.lastName}`
        : user.coach
        ? `${user.coach.firstName} ${user.coach.lastName}`
        : 'AK Golf Academy';

      const icalContent = generateICalFeed(calendarEvents, `${userName} - AK Golf`);

      reply.header('Content-Type', 'text/calendar; charset=utf-8');
      reply.header('Content-Disposition', 'attachment; filename="calendar.ics"');
      return reply.send(icalContent);
    },
  });

  /**
   * POST /ical/generate-token
   * Generate a new calendar subscription token
   */
  fastify.post('/ical/generate-token', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { id: string };

      // Generate unique token
      const token = `cal_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      await prisma.user.update({
        where: { id: user.id },
        data: { calendarToken: token },
      });

      const subscriptionUrl = `${config.api.url}/api/v1/calendar/ical/${token}`;

      return {
        token,
        subscriptionUrl,
        instructions: {
          google: 'Google Kalender → Innstillinger → Legg til kalender → Fra URL',
          apple: 'Kalender → Fil → Ny kalenderabonnement',
          outlook: 'Kalender → Legg til kalender → Abonner fra nett',
        },
      };
    },
  });

  // ============================================
  // Google Calendar Integration
  // ============================================

  const googleCalendar = createGoogleCalendarService();

  /**
   * GET /google/auth
   * Get Google Calendar OAuth URL
   */
  fastify.get('/google/auth', {
    onRequest: [fastify.authenticate],
    handler: async (req, reply) => {
      if (!googleCalendar) {
        return reply.status(501).send({ error: 'Google Calendar not configured' });
      }

      const user = req.user as { id: string };
      const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
      const authUrl = googleCalendar.getAuthUrl(state);

      return { authUrl };
    },
  });

  /**
   * GET /google/callback
   * Handle Google OAuth callback
   */
  fastify.get('/google/callback', {
    handler: async (req, reply) => {
      if (!googleCalendar) {
        return reply.status(501).send({ error: 'Google Calendar not configured' });
      }

      const { code, state } = req.query as { code: string; state: string };

      try {
        const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

        const tokens = await googleCalendar.getTokens(code);

        // Store tokens securely
        await prisma.calendarIntegration.upsert({
          where: { userId_provider: { userId, provider: 'google' } },
          create: {
            userId,
            provider: 'google',
            providerAccountId: userId,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenExpiresAt: tokens.expiresAt,
          },
          update: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenExpiresAt: tokens.expiresAt,
          },
        });

        // Redirect to frontend success page
        return reply.redirect(`${config.frontend.url}/settings/calendar?connected=true`);
      } catch (error) {
        logger.error({ error }, 'Google Calendar OAuth failed');
        return reply.redirect(`${config.frontend.url}/settings/calendar?error=auth_failed`);
      }
    },
  });

  /**
   * POST /google/sync
   * Sync events to Google Calendar
   */
  fastify.post('/google/sync', {
    onRequest: [fastify.authenticate],
    handler: async (req, reply) => {
      if (!googleCalendar) {
        return reply.status(501).send({ error: 'Google Calendar not configured' });
      }

      const user = req.user as { id: string; tenantId: string; playerId?: string };

      // Get integration
      const integration = await prisma.calendarIntegration.findFirst({
        where: { userId: user.id, provider: 'google' },
      });

      if (!integration) {
        return reply.status(400).send({ error: 'Google Calendar not connected' });
      }

      // Refresh token if needed
      let accessToken = integration.accessToken;
      if (integration.tokenExpiresAt && integration.tokenExpiresAt < new Date()) {
        try {
          const newTokens = await googleCalendar.refreshAccessToken(integration.refreshToken!);
          accessToken = newTokens.accessToken;

          await prisma.calendarIntegration.update({
            where: { id: integration.id },
            data: {
              accessToken: newTokens.accessToken,
              tokenExpiresAt: newTokens.expiresAt,
            },
          });
        } catch (error) {
          return reply.status(401).send({ error: 'Token refresh failed, please reconnect' });
        }
      }

      // Get upcoming events
      const events = await prisma.event.findMany({
        where: {
          tenantId: user.tenantId,
          startTime: { gte: new Date() },
          participants: user.playerId
            ? { some: { playerId: user.playerId } }
            : undefined,
        },
        include: { tournament: true },
      });

      const synced: string[] = [];
      const errors: string[] = [];

      for (const event of events) {
        try {
          const calEvent: CalendarEvent = {
            id: event.id,
            title: event.title,
            description: event.description || undefined,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location || undefined,
            type: event.eventType as CalendarEvent['type'],
          };

          // Check if already synced
          const existingSync = await prisma.calendarSync.findFirst({
            where: { localEventId: event.id, integrationId: integration.id },
          });

          if (existingSync) {
            await googleCalendar.updateEvent(accessToken, existingSync.externalEventId, calEvent);
          } else {
            const googleEventId = await googleCalendar.createEvent(accessToken, calEvent);

            await prisma.calendarSync.create({
              data: {
                localEventId: event.id,
                localEventType: 'event',
                integrationId: integration.id,
                externalEventId: googleEventId,
              },
            });
          }

          synced.push(event.id);
        } catch (error) {
          logger.error({ error, eventId: event.id }, 'Failed to sync event');
          errors.push(event.id);
        }
      }

      return {
        synced: synced.length,
        errors: errors.length,
        message: `Synkroniserte ${synced.length} hendelser til Google Kalender`,
      };
    },
  });

  /**
   * DELETE /google/disconnect
   * Disconnect Google Calendar
   */
  fastify.delete('/google/disconnect', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { id: string };

      await prisma.calendarIntegration.deleteMany({
        where: { userId: user.id, provider: 'google' },
      });

      return { success: true, message: 'Google Kalender koblet fra' };
    },
  });

  /**
   * GET /google/status
   * Check Google Calendar connection status
   */
  fastify.get('/google/status', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { id: string };

      const integration = await prisma.calendarIntegration.findFirst({
        where: { userId: user.id, provider: 'google' },
      });

      return {
        connected: !!integration,
        expiresAt: integration?.tokenExpiresAt,
        syncedEvents: integration
          ? await prisma.calendarSync.count({ where: { integrationId: integration.id } })
          : 0,
      };
    },
  });
};

export default calendarRoutes;
