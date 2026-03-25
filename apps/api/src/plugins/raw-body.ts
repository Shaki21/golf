/**
 * Raw Body Plugin for Fastify
 *
 * Preserves raw request body for routes that need it (e.g., Stripe webhooks)
 * Stripe webhook signature verification requires the raw body
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string | Buffer;
  }
}

async function rawBodyPlugin(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    async (request: FastifyRequest, payload: Buffer) => {
      // Store raw body for signature verification
      request.rawBody = payload;

      // Parse JSON for normal use
      try {
        return JSON.parse(payload.toString('utf-8'));
      } catch (error) {
        throw new Error('Invalid JSON');
      }
    }
  );

  app.log.info('Raw body plugin registered');
}

export default fastifyPlugin(rawBodyPlugin, {
  name: 'raw-body',
  fastify: '4.x',
});
