import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { authenticationError, authorizationError } from '../core/errors';

/**
 * Verify a token and return the payload
 * Exported for use in WebSocket authentication
 */
export async function verifyToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * Authenticate user using JWT token
 * Extracts token from Authorization header and verifies it
 */
export async function authenticateUser(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw authenticationError('No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw authenticationError('Invalid authorization header format. Expected: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw authenticationError('No token provided');
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Inject user into request
    request.user = payload;
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }

    // Handle JWT-specific errors
    const message = error instanceof Error ? error.message : 'Invalid token';
    throw authenticationError(message);
  }
}

/**
 * Optional authentication - don't throw if no token
 * Useful for endpoints that work differently for authenticated vs unauthenticated users
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      request.user = payload;
    }
  } catch (error) {
    // Silently fail - this is optional auth
    request.log.warn({ err: error }, 'Optional authentication failed');
  }
}

/**
 * Authorize user based on required roles
 * Must be used after authenticateUser middleware
 */
export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw authenticationError('Authentication required');
    }

    if (allowedRoles.length === 0) {
      // No specific roles required, just needs to be authenticated
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw authorizationError(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      );
    }
  };
}

/**
 * Require admin role
 */
export const requireAdmin = authorize('admin');

/**
 * Require coach role (or admin)
 */
export const requireCoach = authorize('admin', 'coach');

/**
 * Require player role (or admin/coach)
 */
export const requirePlayer = authorize('admin', 'coach', 'player');

/**
 * Alias for authorize - require specific roles
 * Usage: requireRole(['admin', 'coach'])
 */
export function requireRole(roles: string[]) {
  return authorize(...roles);
}
