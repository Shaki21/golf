import { FastifyRequest, FastifyReply } from 'fastify';

const idempotencyStore = new Map<string, { result: unknown; timestamp: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function idempotencyMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const key = request.headers['idempotency-key'] as string;
  if (!key || request.method !== 'POST') return;

  const userId = request.user?.id;
  if (!userId) return;

  const cacheKey = `${userId}:${key}`;
  const cached = idempotencyStore.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < TTL) {
    return reply.status(200).send(cached.result);
  }

  // Store result after handler
  const originalSend = reply.send.bind(reply);
  reply.send = function (payload: unknown) {
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      idempotencyStore.set(cacheKey, { result: payload, timestamp: Date.now() });
      // Cleanup old entries
      setTimeout(() => idempotencyStore.delete(cacheKey), TTL);
    }
    return originalSend(payload);
  };
}
