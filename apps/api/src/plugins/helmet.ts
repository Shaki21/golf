import fastifyHelmet from '@fastify/helmet';
import { config } from '../config';
import { AnyFastifyInstance } from '../types/fastify';

/**
 * Register Helmet for security headers
 */
export async function registerHelmet(app: AnyFastifyInstance): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const s3Endpoint = process.env.S3_ENDPOINT || 'https://s3.eu-north-1.amazonaws.com';

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: config.server.isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', s3Endpoint],
        connectSrc: ["'self'", frontendUrl, s3Endpoint],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", s3Endpoint],
        frameSrc: ["'none'"],
      },
    } : {
      // More lenient CSP in development for Swagger UI and debugging
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', s3Endpoint],
        connectSrc: ["'self'", frontendUrl, s3Endpoint],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", s3Endpoint],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: config.server.isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,
    frameguard: {
      action: 'deny',
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  });

  app.log.info('Security headers configured');
}
