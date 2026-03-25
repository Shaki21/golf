import pino from 'pino';
import { config } from '../config';
import { randomUUID } from 'crypto';

// PII fields that should be redacted
const PII_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'secret',
  'apiKey',
  'creditCard',
  'ssn',
  'email',
  'phone',
  'address',
  'dateOfBirth',
];

// Recursive function to redact PII from objects
function redactPII(obj: unknown, depth = 0): unknown {
  if (depth > 10) return '[Max Depth Reached]';

  if (obj === null || obj === undefined) return obj;

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactPII(item, depth + 1));
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isPII = PII_FIELDS.some(field => lowerKey.includes(field.toLowerCase()));

    if (isPII) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactPII(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export const logger = pino({
  level: config.logging.level,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_version: process.version,
      };
    },
  },
  transport: config.logging.pretty && config.server.isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{levelLabel} - {msg} [{requestId}]',
    },
  } : undefined,
  serializers: {
    req: (req) => {
      const serialized = {
        requestId: req.id || req.headers['x-request-id'] || randomUUID(),
        method: req.method,
        url: req.url,
        path: req.routeOptions?.url || req.url,
        parameters: redactPII(req.params),
        query: redactPII(req.query),
        headers: {
          host: req.headers.host,
          userAgent: req.headers['user-agent'],
          referer: req.headers.referer,
          contentType: req.headers['content-type'],
          accept: req.headers['accept'],
        },
        remoteAddress: req.ip,
        remotePort: req.socket?.remotePort,
        tenantId: req.tenant?.id,
        userId: req.user?.userId,
      };

      return serialized;
    },
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        contentType: res.getHeader('content-type'),
        contentLength: res.getHeader('content-length'),
      },
    }),
    err: (err) => {
      return {
        type: err.type || err.constructor.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
        validation: err.validation ? redactPII(err.validation) : undefined,
      };
    },
    body: (body) => redactPII(body),
  },
  // Redact PII from all log messages
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.secret',
      '*.password',
      '*.token',
      '*.secret',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[REDACTED]',
  },
});

// Helper function to create child logger with request ID
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

// Helper function to log with context
export function logWithContext(
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  context?: Record<string, unknown>
) {
  const sanitizedContext = context ? redactPII(context) as Record<string, unknown> : {};
  logger[level]({ ...sanitizedContext }, message);
}

// Helper for performance logging
export function createPerformanceLogger(operation: string) {
  const start = Date.now();
  return {
    end: (metadata?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      const redacted = redactPII(metadata || {}) as Record<string, unknown>;
      logger.info(
        {
          operation,
          duration,
          ...redacted,
        },
        `${operation} completed in ${duration}ms`
      );
    },
    error: (error: Error, metadata?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      const redacted = redactPII(metadata || {}) as Record<string, unknown>;
      logger.error(
        {
          operation,
          duration,
          error,
          ...redacted,
        },
        `${operation} failed after ${duration}ms: ${error.message}`
      );
    },
  };
}

// Export configured logger
export default logger;
