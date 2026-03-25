/**
 * Cache Headers Middleware
 *
 * Provides helper functions for setting appropriate cache headers on API responses.
 * See docs/caching-policy.md for full caching strategy.
 */

import { FastifyReply } from 'fastify';

/**
 * Set no-store cache header
 * Use for: sensitive data, real-time data, signed URLs
 */
export function setNoStore(reply: FastifyReply): void {
  reply.header('Cache-Control', 'private, no-store');
}

/**
 * Set private short-lived cache header
 * Use for: user-specific list data that can be briefly cached
 *
 * @param reply - Fastify reply object
 * @param seconds - Cache duration in seconds (default: 10)
 */
export function setPrivateShort(reply: FastifyReply, seconds: number = 10): void {
  reply.header('Cache-Control', `private, max-age=${seconds}, must-revalidate`);
}

/**
 * Set public long-lived cache header
 * Use for: static content, thumbnails, documentation
 *
 * @param reply - Fastify reply object
 * @param seconds - Cache duration in seconds (default: 86400 = 1 day)
 * @param immutable - Whether content never changes (default: true)
 */
export function setPublicLong(
  reply: FastifyReply,
  seconds: number = 86400,
  immutable: boolean = true
): void {
  const immutableDirective = immutable ? ', immutable' : '';
  reply.header('Cache-Control', `public, max-age=${seconds}${immutableDirective}`);
}

/**
 * Set public short-lived cache header
 * Use for: health checks, non-sensitive status endpoints
 *
 * @param reply - Fastify reply object
 * @param seconds - Cache duration in seconds (default: 30)
 */
export function setPublicShort(reply: FastifyReply, seconds: number = 30): void {
  reply.header('Cache-Control', `public, max-age=${seconds}`);
}
