import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { getPrismaClient } from '../core/db/prisma';

interface MetricsData {
  httpRequestDuration: Map<string, number[]>;
  httpRequestCount: Map<string, number>;
  activeUsers: number;
  dbQueryDuration: number[];
  errorCount: Map<string, number>;
  lastUpdated: Date;
}

const metrics: MetricsData = {
  httpRequestDuration: new Map(),
  httpRequestCount: new Map(),
  activeUsers: 0,
  dbQueryDuration: [],
  errorCount: new Map(),
  lastUpdated: new Date(),
};

// Helper function to calculate percentiles
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Helper function to format metrics in Prometheus format
function formatPrometheusMetrics(): string {
  const lines: string[] = [];

  // HTTP Request Duration metrics
  lines.push('# HELP http_request_duration_seconds HTTP request duration in seconds');
  lines.push('# TYPE http_request_duration_seconds histogram');

  for (const [route, durations] of metrics.httpRequestDuration.entries()) {
    if (durations.length > 0) {
      const p50 = calculatePercentile(durations, 50) / 1000;
      const p90 = calculatePercentile(durations, 90) / 1000;
      const p99 = calculatePercentile(durations, 99) / 1000;
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length / 1000;

      lines.push(`http_request_duration_seconds{route="${route}",quantile="0.5"} ${p50.toFixed(3)}`);
      lines.push(`http_request_duration_seconds{route="${route}",quantile="0.9"} ${p90.toFixed(3)}`);
      lines.push(`http_request_duration_seconds{route="${route}",quantile="0.99"} ${p99.toFixed(3)}`);
      lines.push(`http_request_duration_seconds_sum{route="${route}"} ${(avg * durations.length).toFixed(3)}`);
      lines.push(`http_request_duration_seconds_count{route="${route}"} ${durations.length}`);
    }
  }

  // HTTP Request Count metrics
  lines.push('');
  lines.push('# HELP http_requests_total Total number of HTTP requests');
  lines.push('# TYPE http_requests_total counter');

  for (const [route, count] of metrics.httpRequestCount.entries()) {
    lines.push(`http_requests_total{route="${route}"} ${count}`);
  }

  // Active Users metric
  lines.push('');
  lines.push('# HELP active_users_total Number of currently active users');
  lines.push('# TYPE active_users_total gauge');
  lines.push(`active_users_total ${metrics.activeUsers}`);

  // Database Query Duration metrics
  lines.push('');
  lines.push('# HELP db_query_duration_seconds Database query duration in seconds');
  lines.push('# TYPE db_query_duration_seconds histogram');

  if (metrics.dbQueryDuration.length > 0) {
    const p50 = calculatePercentile(metrics.dbQueryDuration, 50) / 1000;
    const p90 = calculatePercentile(metrics.dbQueryDuration, 90) / 1000;
    const p99 = calculatePercentile(metrics.dbQueryDuration, 99) / 1000;
    const avg = metrics.dbQueryDuration.reduce((a, b) => a + b, 0) / metrics.dbQueryDuration.length / 1000;

    lines.push(`db_query_duration_seconds{quantile="0.5"} ${p50.toFixed(3)}`);
    lines.push(`db_query_duration_seconds{quantile="0.9"} ${p90.toFixed(3)}`);
    lines.push(`db_query_duration_seconds{quantile="0.99"} ${p99.toFixed(3)}`);
    lines.push(`db_query_duration_seconds_sum ${(avg * metrics.dbQueryDuration.length).toFixed(3)}`);
    lines.push(`db_query_duration_seconds_count ${metrics.dbQueryDuration.length}`);
  }

  // Error Rate metrics
  lines.push('');
  lines.push('# HELP http_errors_total Total number of HTTP errors');
  lines.push('# TYPE http_errors_total counter');

  for (const [errorType, count] of metrics.errorCount.entries()) {
    lines.push(`http_errors_total{type="${errorType}"} ${count}`);
  }

  // Process metrics
  lines.push('');
  lines.push('# HELP process_uptime_seconds Process uptime in seconds');
  lines.push('# TYPE process_uptime_seconds gauge');
  lines.push(`process_uptime_seconds ${process.uptime().toFixed(2)}`);

  lines.push('');
  lines.push('# HELP process_memory_usage_bytes Process memory usage in bytes');
  lines.push('# TYPE process_memory_usage_bytes gauge');
  const memUsage = process.memoryUsage();
  lines.push(`process_memory_usage_bytes{type="rss"} ${memUsage.rss}`);
  lines.push(`process_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`);
  lines.push(`process_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`);
  lines.push(`process_memory_usage_bytes{type="external"} ${memUsage.external}`);

  return lines.join('\n') + '\n';
}

// Store request start times
const requestStartTimes = new WeakMap<FastifyRequest, number>();

// Track HTTP request start time
async function trackRequestStart(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  requestStartTimes.set(request, Date.now());
}

// Track HTTP request completion and metrics
async function trackRequestComplete(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const start = requestStartTimes.get(request);
  if (!start) return;

  const duration = Date.now() - start;
  const route = request.routeOptions?.url || request.url;
  const method = request.method;
  const routeKey = `${method} ${route}`;

  // Track duration
  if (!metrics.httpRequestDuration.has(routeKey)) {
    metrics.httpRequestDuration.set(routeKey, []);
  }
  const durations = metrics.httpRequestDuration.get(routeKey)!;
  durations.push(duration);

  // Keep only last 1000 measurements to prevent memory issues
  if (durations.length > 1000) {
    durations.shift();
  }

  // Track count
  const currentCount = metrics.httpRequestCount.get(routeKey) || 0;
  metrics.httpRequestCount.set(routeKey, currentCount + 1);

  // Track errors
  if (reply.statusCode >= 400) {
    const errorType = reply.statusCode >= 500 ? '5xx' : '4xx';
    const currentErrorCount = metrics.errorCount.get(errorType) || 0;
    metrics.errorCount.set(errorType, currentErrorCount + 1);
  }

  metrics.lastUpdated = new Date();
}

// Database query tracking function (to be called from Prisma middleware)
export function trackDbQuery(duration: number) {
  metrics.dbQueryDuration.push(duration);

  // Keep only last 1000 measurements
  if (metrics.dbQueryDuration.length > 1000) {
    metrics.dbQueryDuration.shift();
  }
}

// Active users tracking functions
export function incrementActiveUsers() {
  metrics.activeUsers++;
}

export function decrementActiveUsers() {
  metrics.activeUsers = Math.max(0, metrics.activeUsers - 1);
}

export function setActiveUsers(count: number) {
  metrics.activeUsers = Math.max(0, count);
}

// Helper function to check database connectivity
async function checkDatabase(): Promise<{ ok: boolean; responseTime: number; error?: string }> {
  const start = Date.now();
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, responseTime: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// Plugin definition
async function metricsPlugin(fastify: FastifyInstance) {
  // Add metrics endpoint
  fastify.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/plain; version=0.0.4; charset=utf-8');
    return formatPrometheusMetrics();
  });

  // Add health check endpoint - Railway uses this for health checks
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    const dbCheck = await checkDatabase();
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    const status = dbCheck.ok ? 'healthy' : 'unhealthy';

    const healthCheck = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbCheck.ok,
        responseTime: `${dbCheck.responseTime}ms`,
        error: dbCheck.error,
      },
      memory: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
      metrics: {
        totalRequests: Array.from(metrics.httpRequestCount.values()).reduce((a, b) => a + b, 0),
        totalErrors: Array.from(metrics.errorCount.values()).reduce((a, b) => a + b, 0),
        activeUsers: metrics.activeUsers,
        lastUpdated: metrics.lastUpdated,
      },
    };

    // Return 503 if database is down
    if (!dbCheck.ok) {
      reply.code(503);
    }

    return healthCheck;
  });

  // Add readiness check endpoint - checks if app can serve traffic
  fastify.get('/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    const dbCheck = await checkDatabase();

    if (dbCheck.ok) {
      return {
        ready: true,
        timestamp: new Date().toISOString(),
        database: { responseTime: `${dbCheck.responseTime}ms` },
      };
    } else {
      reply.code(503);
      return {
        ready: false,
        timestamp: new Date().toISOString(),
        error: 'Database not available',
        details: dbCheck.error,
      };
    }
  });

  // Add liveness check endpoint - basic process health
  fastify.get('/live', async (_request: FastifyRequest, _reply: FastifyReply) => {
    // Basic liveness check - process is alive if it can respond
    return { alive: true, timestamp: new Date().toISOString() };
  });

  // Hooks to track all requests
  fastify.addHook('onRequest', trackRequestStart);
  fastify.addHook('onResponse', trackRequestComplete);
}

export default fp(metricsPlugin, {
  name: 'metrics',
  fastify: '4.x',
});

export { metrics };
