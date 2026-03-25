import fastifyCors from '@fastify/cors';
import { config } from '../config';
import { AnyFastifyInstance } from '../types/fastify';

/**
 * Register CORS plugin
 */
export async function registerCors(app: AnyFastifyInstance): Promise<void> {
  await app.register(fastifyCors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Tenant-ID',
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-Page',
      'X-Per-Page',
    ],
    maxAge: 86400, // 24 hours
  });

  app.log.info({
    origins: config.cors.origin,
    credentials: config.cors.credentials,
  }, 'CORS configured');
}
