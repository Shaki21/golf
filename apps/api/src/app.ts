import Fastify from 'fastify';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase } from './core/db/prisma';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { registerSwagger } from './plugins/swagger';
import { registerCors } from './plugins/cors';
import { registerHelmet } from './plugins/helmet';
import { registerWebSocket } from './plugins/websocket';
import { registerCache } from './plugins/cache';
import { registerRateLimit } from './plugins/rate-limit';
import metricsPlugin from './plugins/metrics';
import sentryPlugin from './plugins/sentry';
import { authenticateUser } from './middleware/auth';
import { initNotificationBus, shutdown as shutdownNotificationBus } from './services/notifications/notificationBus';
import { AnyFastifyInstance } from './types/fastify';

export interface BuildAppOptions {
  logger?: boolean;
}

/**
 * Build and configure Fastify application
 */
export async function buildApp(opts: BuildAppOptions = {}): Promise<AnyFastifyInstance> {
  // Create Fastify instance
  const app = Fastify({
    logger: opts.logger !== false ? logger : false,
    disableRequestLogging: false,
    requestIdLogLabel: 'reqId',
    genReqId: (req) => (req.headers['x-request-id'] as string) || `${Date.now()}-${Math.random()}`,
    trustProxy: true,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Register error handlers
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // Register plugins
  await app.register(sentryPlugin); // Error tracking
  await app.register(metricsPlugin); // Performance monitoring and metrics
  await app.register(import('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
  await app.register(import('./plugins/raw-body').then(m => m.default)); // Raw body for webhooks
  await registerHelmet(app);
  await registerCors(app);
  await registerSwagger(app);
  await registerWebSocket(app);
  await registerCache(app);
  await registerRateLimit(app);

  // Register authenticate decorator
  app.decorate('authenticate', authenticateUser);

  // Register prisma client for route handlers
  const { getPrismaClient } = await import('./core/db/prisma');
  app.decorate('prisma', getPrismaClient());

  // Note: /health, /metrics, /ready, /live endpoints are provided by the metrics plugin

  // Version endpoint to verify deployments
  app.get('/version', async () => ({
    version: '2026-01-03-samling-v2',
    timestamp: new Date().toISOString(),
    features: ['samling', 'coachId-in-jwt'],
  }));

  // Register API routes
  const { authRoutes } = await import('./api/v1/auth');
  const { playerRoutes } = await import('./api/v1/players');
  const { coachRoutes } = await import('./api/v1/coaches');
  const { exerciseRoutes } = await import('./api/v1/exercises');
  const { samlingRoutes } = await import('./api/v1/samling');
  const { testRoutes } = await import('./api/v1/tests');
  const { enhancedTestRoutes } = await import('./api/v1/tests/enhanced-routes');
  const { breakingPointRoutes } = await import('./api/v1/breaking-points');
  const { peerComparisonRoutes } = await import('./api/v1/peer-comparison');
  const { coachAnalyticsRoutes } = await import('./api/v1/coach-analytics');
  const { filterRoutes } = await import('./api/v1/filters');
  const { dataGolfRoutes } = await import('./api/v1/datagolf');
  const { golfCourseRoutes } = await import('./api/v1/golf-courses');
  const { weatherRoutes } = await import('./api/v1/weather');
  const { calibrationRoutes } = await import('./api/v1/calibration');
  const { intakeRoutes } = await import('./api/v1/intake');
  const { availabilityRoutes } = await import('./api/v1/availability');
  const { bookingRoutes } = await import('./api/v1/bookings');
  const calendarRoutes = (await import('./api/v1/calendar')).default;
  const { trainingPlanRoutes } = await import('./api/v1/training-plan');
  const dashboardRoutes = (await import('./api/v1/dashboard')).default;
  const meRoutes = (await import('./api/v1/me')).default;
  const planRoutes = (await import('./api/v1/plan')).default;
  const sessionsRoutes = (await import('./api/v1/training/sessions')).default;
  const notesRoutes = (await import('./api/v1/notes')).default;
  const goalsRoutes = (await import('./api/v1/goals')).default;
  const archiveRoutes = (await import('./api/v1/archive')).default;
  const achievementsRoutes = (await import('./api/v1/achievements')).default;
  const badgesRoutes = (await import('./api/v1/badges')).default;
  const seasonRoutes = (await import('./api/v1/season')).default;
  const skoleplanRoutes = (await import('./api/v1/skoleplan')).default;
  const sessionEvaluationRoutes = (await import('./api/v1/sessions')).default;
  const messageRoutes = (await import('./api/v1/messages')).default;
  const exportRoutes = (await import('./api/v1/export')).default;
  const { videoRoutes } = await import('./api/v1/videos');
  const { annotationRoutes } = await import('./api/v1/annotations');
  const { commentRoutes } = await import('./api/v1/comments');
  const { comparisonRoutes } = await import('./api/v1/comparisons');
  const { keyframeRoutes } = await import('./api/v1/video-keyframes');
  const { paymentRoutes } = await import('./api/v1/payments');
  const { progressReportRoutes } = await import('./api/v1/progress-reports');
  const { trackmanRoutes } = await import('./api/v1/trackman');
  const { strokesGainedRoutes } = await import('./api/v1/strokes-gained');
  const { tournamentPrepRoutes } = await import('./api/v1/tournament-prep');
  const { emailRoutes } = await import('./api/v1/emails');
  const { notificationRoutes } = await import('./api/v1/notifications');
  const { focusEngineRoutes } = await import('./api/v1/focus-engine');
  const { playerInsightsRoutes } = await import('./api/v1/player-insights');
  const { coachStatsRoutes, annualPlanRoutes } = await import('./api/v1/coach');
  const adminSeedRoutes = (await import('./api/v1/admin/seed')).default;
  const adminRoutes = (await import('./api/v1/admin')).default;
  const { registerAdminPaymentAnalyticsRoutes } = await import('./api/v1/admin/payment-analytics.routes');
  const aiRoutes = (await import('./api/v1/ai')).default;
  const collectionsRoutes = (await import('./api/v1/collections')).default;
  const planDashboardRoutes = (await import('./api/v1/plan-dashboard')).default;
  const coachPlanDashboardRoutes = (await import('./api/v1/coach-plan-dashboard')).default;

  // New APIs for orphaned Prisma models
  const { trainingStatsRoutes } = await import('./api/v1/training-stats');
  const { chatRoutes } = await import('./api/v1/chat');
  const { supportRoutes } = await import('./api/v1/support');
  const { featureFlagRoutes } = await import('./api/v1/feature-flags');
  const { auditRoutes } = await import('./api/v1/audit');
  const { aiConversationRoutes } = await import('./api/v1/ai-conversations');
  const { techniquePlanRoutes } = await import('./api/v1/technique-plan');
  const { stripeWebhookRoutes } = await import('./api/v1/webhooks');

  // Multi-sport configuration
  const { sportConfigRoutes } = await import('./api/v1/sport-config');

  // Manual Stats & Strokes Gained Module
  const { manualStatsRoutes } = await import('./api/v1/manual-stats');

  await app.register(authRoutes, { prefix: `/api/${config.server.apiVersion}/auth` });
  await app.register(playerRoutes, { prefix: `/api/${config.server.apiVersion}/players` });
  await app.register(coachRoutes, { prefix: `/api/${config.server.apiVersion}/coaches` });
  await app.register(exerciseRoutes, { prefix: `/api/${config.server.apiVersion}/exercises` });
  await app.register(samlingRoutes, { prefix: `/api/${config.server.apiVersion}/samling` });
  await app.register(testRoutes, { prefix: `/api/${config.server.apiVersion}/tests` });
  await app.register(enhancedTestRoutes, { prefix: `/api/${config.server.apiVersion}/tests` });
  await app.register(breakingPointRoutes, { prefix: `/api/${config.server.apiVersion}/breaking-points` });
  await app.register(peerComparisonRoutes, { prefix: `/api/${config.server.apiVersion}/peer-comparison` });
  await app.register(coachAnalyticsRoutes, { prefix: `/api/${config.server.apiVersion}/coach-analytics` });
  await app.register(filterRoutes, { prefix: `/api/${config.server.apiVersion}/filters` });
  await app.register(dataGolfRoutes, { prefix: `/api/${config.server.apiVersion}/datagolf` });
  await app.register(golfCourseRoutes, { prefix: `/api/${config.server.apiVersion}/golf-courses` });
  await app.register(weatherRoutes, { prefix: `/api/${config.server.apiVersion}/weather` });
  await app.register(calibrationRoutes, { prefix: `/api/${config.server.apiVersion}/calibration` });
  await app.register(intakeRoutes, { prefix: `/api/${config.server.apiVersion}/intake` });
  await app.register(availabilityRoutes, { prefix: `/api/${config.server.apiVersion}/availability` });
  await app.register(bookingRoutes, { prefix: `/api/${config.server.apiVersion}/bookings` });
  await app.register(calendarRoutes, { prefix: `/api/${config.server.apiVersion}/calendar` });
  await app.register(trainingPlanRoutes, { prefix: `/api/${config.server.apiVersion}/training-plan` });
  await app.register(dashboardRoutes, { prefix: `/api/${config.server.apiVersion}/dashboard` });
  await app.register(meRoutes, { prefix: `/api/${config.server.apiVersion}/me` });
  await app.register(planRoutes, { prefix: `/api/${config.server.apiVersion}/plan` });
  await app.register(sessionsRoutes, { prefix: `/api/${config.server.apiVersion}/training/sessions` });

  // Training Area Performance routes
  const { trainingAreaPerformanceRoutes } = await import('./api/v1/training-area-performance');
  await app.register(trainingAreaPerformanceRoutes, {
    prefix: `/api/${config.server.apiVersion}/training-area-performance`,
  });
  await app.register(notesRoutes, { prefix: `/api/${config.server.apiVersion}/notes` });
  await app.register(goalsRoutes, { prefix: `/api/${config.server.apiVersion}/goals` });
  await app.register(archiveRoutes, { prefix: `/api/${config.server.apiVersion}/archive` });
  await app.register(achievementsRoutes, { prefix: `/api/${config.server.apiVersion}/achievements` });
  await app.register(badgesRoutes, { prefix: `/api/${config.server.apiVersion}/badges` });
  await app.register(seasonRoutes, { prefix: `/api/${config.server.apiVersion}/season` });
  await app.register(skoleplanRoutes, { prefix: `/api/${config.server.apiVersion}/skoleplan` });
  await app.register(sessionEvaluationRoutes, { prefix: `/api/${config.server.apiVersion}/sessions` });
  await app.register(messageRoutes, { prefix: `/api/${config.server.apiVersion}/messages` });
  await app.register(exportRoutes, { prefix: `/api/${config.server.apiVersion}/export` });
  await app.register(videoRoutes, { prefix: `/api/${config.server.apiVersion}/videos` });
  await app.register(annotationRoutes, { prefix: `/api/${config.server.apiVersion}/annotations` });
  await app.register(commentRoutes, { prefix: `/api/${config.server.apiVersion}/comments` });
  await app.register(comparisonRoutes, { prefix: `/api/${config.server.apiVersion}/comparisons` });
  await app.register(keyframeRoutes, { prefix: `/api/${config.server.apiVersion}/video-keyframes` });
  await app.register(paymentRoutes, { prefix: `/api/${config.server.apiVersion}/payments` });
  await app.register(progressReportRoutes, { prefix: `/api/${config.server.apiVersion}/progress-reports` });
  await app.register(trackmanRoutes, { prefix: `/api/${config.server.apiVersion}/trackman` });
  await app.register(strokesGainedRoutes, { prefix: `/api/${config.server.apiVersion}/strokes-gained` });
  await app.register(tournamentPrepRoutes, { prefix: `/api/${config.server.apiVersion}/tournament-prep` });
  await app.register(emailRoutes, { prefix: `/api/${config.server.apiVersion}/emails` });
  await app.register(notificationRoutes, { prefix: `/api/${config.server.apiVersion}/notifications` });
  await app.register(focusEngineRoutes, { prefix: `/api/${config.server.apiVersion}/focus-engine` });
  await app.register(playerInsightsRoutes, { prefix: `/api/${config.server.apiVersion}/player-insights` });
  await app.register(coachStatsRoutes, { prefix: `/api/${config.server.apiVersion}/coach` });
  await app.register(annualPlanRoutes, { prefix: `/api/${config.server.apiVersion}/coach` });
  await app.register(adminSeedRoutes, { prefix: `/api/${config.server.apiVersion}/admin` });
  await app.register(adminRoutes, { prefix: `/api/${config.server.apiVersion}/admin` });
  await app.register(registerAdminPaymentAnalyticsRoutes, { prefix: `/api/${config.server.apiVersion}` });
  await app.register(aiRoutes, { prefix: `/api/${config.server.apiVersion}/ai` });
  await app.register(collectionsRoutes, { prefix: `/api/${config.server.apiVersion}/collections` });

  // New APIs for orphaned Prisma models
  await app.register(trainingStatsRoutes, { prefix: `/api/${config.server.apiVersion}/training-stats` });
  await app.register(chatRoutes, { prefix: `/api/${config.server.apiVersion}/chat` });
  await app.register(supportRoutes, { prefix: `/api/${config.server.apiVersion}/support` });
  await app.register(featureFlagRoutes, { prefix: `/api/${config.server.apiVersion}/feature-flags` });
  await app.register(auditRoutes, { prefix: `/api/${config.server.apiVersion}/audit` });
  await app.register(aiConversationRoutes, { prefix: `/api/${config.server.apiVersion}/ai-conversations` });
  await app.register(techniquePlanRoutes, { prefix: `/api/${config.server.apiVersion}/technique-plan` });
  await app.register(planDashboardRoutes, { prefix: `/api/${config.server.apiVersion}/plan-dashboard` });
  await app.register(coachPlanDashboardRoutes, { prefix: `/api/${config.server.apiVersion}/coach-plan-dashboard` });

  // Multi-sport configuration
  await app.register(sportConfigRoutes, { prefix: `/api/${config.server.apiVersion}/sport-config` });

  // Manual Stats & Strokes Gained Module
  await app.register(manualStatsRoutes, { prefix: `/api/${config.server.apiVersion}/manual-stats` });

  // Webhooks (no auth required, verified by signature)
  await app.register(stripeWebhookRoutes, { prefix: `/api/${config.server.apiVersion}/webhooks` });

  // ✅ All IUP Golf Academy APIs registered!
  // - Core: Auth, Players, Coaches, Exercises, Tests, Breaking Points
  // - Enhanced: Test Results with Auto-calculation & Peer Comparison
  // - Analytics: Peer Comparison, Coach Analytics, Filters, DataGolf
  // - Coach: Stats Overview, Progress, Regression, Dashboard, Groups, Athletes, Tournaments, Booking Settings
  // - Onboarding: Club Speed Calibration & Player Intake Forms
  // - Training: 12-Month Training Plan Generation & Management
  // - Booking: Availability Slots & Session Bookings with Conflict Detection

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, starting graceful shutdown...`);
      try {
        await shutdownNotificationBus();
        await app.close();
        app.log.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        app.log.error({ err: error }, 'Error during shutdown');
        process.exit(1);
      }
    });
  });

  return app;
}

/**
 * Start the application server
 */
export async function startServer(): Promise<AnyFastifyInstance> {
  let startupPhase = 'buildApp';

  try {
    const app = await buildApp();

    startupPhase = 'connectDatabase';
    await connectDatabase();

    startupPhase = 'initNotificationBus';
    await initNotificationBus();

    startupPhase = 'listen';
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });

    app.log.info(
      {
        port: config.server.port,
        host: config.server.host,
        env: config.server.env,
        docs: `http://localhost:${config.server.port}/docs`,
      },
      'Server started successfully'
    );

    return app;
  } catch (error) {
    // Re-throw with phase info for better debugging
    const enhancedError = new Error(
      `Failed to start server during phase: ${startupPhase}. ` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error) {
      enhancedError.stack = error.stack;
      (enhancedError as NodeJS.ErrnoException).cause = error;
    }
    throw enhancedError;
  }
}
