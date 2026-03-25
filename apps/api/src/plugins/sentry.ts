import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from '../config';

/**
 * Sentry Error Tracking Plugin
 *
 * Captures errors, performance data, and request context for production monitoring
 * Updated for Sentry SDK v8 API
 */

interface SentryPluginOptions {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
}

async function sentryPlugin(
  fastify: FastifyInstance,
  opts: SentryPluginOptions = {}
): Promise<void> {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.SENTRY_ENVIRONMENT || config.server.env,
    release = process.env.SENTRY_RELEASE || process.env.GIT_COMMIT_SHA,
    tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate = parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  } = opts;

  // Only enable Sentry if DSN is configured
  if (!dsn) {
    fastify.log.info('Sentry DSN not configured, error tracking disabled');
    return;
  }

  // Initialize Sentry with v8 API
  Sentry.init({
    dsn,
    environment,
    release,

    // Performance Monitoring
    tracesSampleRate,
    profilesSampleRate,

    // Enable performance profiling with new API
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Capture errors and transactions
    beforeSend(event, _hint) {
      // Don't send errors in development unless explicitly enabled
      if (environment === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Scrub sensitive data
      if (event.request) {
        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }

        // Remove sensitive query params
        if (event.request.query_string && typeof event.request.query_string === 'string') {
          event.request.query_string = event.request.query_string.replace(
            /([?&])(token|password|secret|key)=([^&]*)/gi,
            '$1$2=REDACTED'
          );
        }
      }

      return event;
    },

    // Add context
    beforeBreadcrumb(breadcrumb, _hint) {
      // Scrub sensitive data from breadcrumbs
      if (breadcrumb.data) {
        delete breadcrumb.data.password;
        delete breadcrumb.data.token;
        delete breadcrumb.data.secret;
      }
      return breadcrumb;
    },
  });

  fastify.log.info({
    sentryDsn: dsn.substring(0, 20) + '...',
    environment,
    release,
  }, 'Sentry error tracking initialized');

  // Add request context to Sentry
  fastify.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    // Set user context if available
    if (request.user) {
      Sentry.setUser({
        id: request.user.id,
        email: request.user.email,
      });
    }

    // Set tags
    Sentry.setTag('route', request.routeOptions?.url || request.url);
    Sentry.setTag('method', request.method);
    Sentry.setTag('tenant_id', request.user?.tenantId);
  });

  // Capture errors
  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: FastifyError) => {
    // Set error context
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      headers: {
        'user-agent': request.headers['user-agent'],
        'content-type': request.headers['content-type'],
      },
      query: request.query,
      params: request.params,
    });

    // Set user context
    if (request.user) {
      Sentry.setUser({
        id: request.user.id,
        email: request.user.email,
      });
    }

    // Capture exception
    Sentry.captureException(error, {
      tags: {
        route: request.routeOptions?.url || request.url,
        method: request.method,
        status_code: String(reply.statusCode),
      },
      extra: {
        requestId: request.id,
        tenantId: request.user?.tenantId,
      },
    });

    // Add breadcrumb
    Sentry.addBreadcrumb({
      category: 'error',
      message: error.message,
      level: 'error',
      data: {
        code: error.code,
        statusCode: error.statusCode,
      },
    });
  });

  // Graceful shutdown - flush Sentry events
  fastify.addHook('onClose', async () => {
    await Sentry.close(2000);
    fastify.log.info('Sentry client closed');
  });

  // Decorate fastify instance with Sentry
  fastify.decorate('sentry', Sentry);
}

export default fp(sentryPlugin, {
  name: 'sentry',
  fastify: '4.x',
});

// Export Sentry for manual usage
export { Sentry };
