import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import * as crypto from 'crypto';

/**
 * CSRF Protection Plugin
 * 
 * Implements double-submit cookie pattern for CSRF protection
 * Protects state-changing operations (POST, PUT, PATCH, DELETE)
 */

interface CSRFPluginOptions {
  cookieName?: string;
  headerName?: string;
  ignoreMethods?: string[];
  secret?: string;
}

const DEFAULT_OPTIONS: Required<CSRFPluginOptions> = {
  cookieName: 'XSRF-TOKEN',
  headerName: 'x-csrf-token',
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  secret: process.env.CSRF_SECRET || process.env.JWT_ACCESS_SECRET || 'change-me-in-production',
};

/**
 * Generate CSRF token
 */
function generateToken(secret: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

/**
 * Verify CSRF token
 */
function verifyToken(token: string, secret: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [tokenPart, signature] = parts;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(tokenPart);
  const expectedSignature = hmac.digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function csrfPlugin(
  fastify: FastifyInstance,
  opts: CSRFPluginOptions = {}
): Promise<void> {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  // Disable CSRF in test environment
  if (process.env.NODE_ENV === 'test') {
    fastify.log.info('CSRF protection disabled for test environment');
    return;
  }

  // Add CSRF token generation endpoint
  fastify.get('/csrf-token', async (_request: FastifyRequest, reply: FastifyReply) => {
    const token = generateToken(options.secret);

    // Set CSRF token in cookie (for double-submit pattern)
    (reply as any).setCookie(options.cookieName, token, {
      httpOnly: false, // Allow JavaScript access for SPA
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour
    });

    return {
      success: true,
      data: {
        token,
        headerName: options.headerName,
      },
    };
  });

  // CSRF validation hook
  fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    // Skip CSRF check for safe methods
    if (options.ignoreMethods.includes(request.method)) {
      return;
    }

    // Skip CSRF check for specific routes
    const skipRoutes = [
      '/health',
      '/metrics',
      '/ready',
      '/live',
      '/csrf-token',
      '/api/v1/auth/login', // Login doesn't have token yet
      '/api/v1/auth/register', // Register doesn't have token yet
    ];

    if (skipRoutes.some(route => request.url.startsWith(route))) {
      return;
    }

    // Get token from header
    const headerToken = request.headers[options.headerName] as string;
    
    // Get token from cookie
    const cookieToken = (request as any).cookies?.[options.cookieName];

    // Validate tokens exist
    if (!headerToken || !cookieToken) {
      throw {
        statusCode: 403,
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token missing. Please include CSRF token in request.',
      };
    }

    // Validate tokens match (double-submit)
    if (headerToken !== cookieToken) {
      throw {
        statusCode: 403,
        code: 'CSRF_TOKEN_MISMATCH',
        message: 'CSRF token mismatch. Invalid request.',
      };
    }

    // Verify token signature
    if (!verifyToken(headerToken, options.secret)) {
      throw {
        statusCode: 403,
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token. Token may have been tampered with.',
      };
    }

    // Token is valid, continue
  });

  fastify.log.info('CSRF protection enabled');
}

export default fp(csrfPlugin, {
  name: 'csrf',
  fastify: '4.x',
  dependencies: ['@fastify/cookie'], // Requires cookie plugin
});

export { generateToken, verifyToken };
