import { FastifyRequest } from 'fastify';
import { AccessTokenPayload } from './jwt';

/**
 * Type guard to ensure request.user exists
 * Use this in route handlers that have authenticateUser middleware
 */
export function getAuthenticatedUser(request: FastifyRequest): AccessTokenPayload {
  if (!request.user) {
    throw new Error('User not authenticated - authenticateUser middleware missing');
  }
  return request.user;
}

/**
 * Type guard for tenant context
 */
export function getTenant(request: FastifyRequest) {
  if (!request.tenant) {
    throw new Error('Tenant context missing - injectTenantContext middleware missing');
  }
  return request.tenant;
}
