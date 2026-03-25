import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.string().transform(Number).default('2'),
  DB_POOL_MAX: z.string().transform(Number).default('10'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // S3 (optional - file uploads disabled if not configured)
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('eu-north-1'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().transform(val => val === 'true').default('false'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.string().transform(val => val === 'true').default('true'),

  // Queue
  QUEUE_NAME: z.string().default('iup-golf-events'),
  QUEUE_CONCURRENCY: z.string().transform(Number).default('5'),

  // Default Tenant (uses demo tenant UUID if not specified)
  DEFAULT_TENANT_ID: z.string().uuid().default('00000000-0000-0000-0000-000000000001'),
  DEFAULT_TENANT_NAME: z.string().default('AK Golf Academy'),
  DEFAULT_TENANT_SLUG: z.string().default('ak-golf'),

  // Google Calendar (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  // API URL (for webhooks and external callbacks)
  API_URL: z.string().url().optional(),

  // Storage settings
  STORAGE_UPLOAD_EXPIRY: z.string().transform(Number).default('3600'), // 1 hour
  STORAGE_PLAYBACK_EXPIRY: z.string().transform(Number).default('3600'), // 1 hour
  STORAGE_THUMBNAIL_EXPIRY: z.string().transform(Number).default('86400'), // 24 hours
  STORAGE_BATCH_SIZE: z.string().transform(Number).default('1000'),

  // Retry settings
  RETRY_DELAY_MS: z.string().transform(Number).default('1000'),
  RETRY_MAX_ATTEMPTS: z.string().transform(Number).default('3'),

  // Session reminder settings
  SESSION_REMINDER_MINUTES: z.string().transform(Number).default('30'),

  // Anthropic/Claude AI
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-20250514'),
  ANTHROPIC_MAX_TOKENS: z.string().transform(Number).default('4096'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    apiVersion: env.API_VERSION,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  database: {
    url: env.DATABASE_URL,
    poolMin: env.DB_POOL_MIN,
    poolMax: env.DB_POOL_MAX,
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    url: env.REDIS_URL,
    // Only enable Redis if REDIS_URL is explicitly set (required for production)
    enabled: !!env.REDIS_URL,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  s3: env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? {
    endpoint: env.S3_ENDPOINT,
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    enabled: true,
  } : {
    endpoint: undefined,
    bucket: undefined,
    region: env.S3_REGION,
    accessKeyId: undefined,
    secretAccessKey: undefined,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    enabled: false,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    credentials: env.CORS_CREDENTIALS,
  },

  frontend: {
    url: env.FRONTEND_URL,
  },

  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  },

  logging: {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
  },

  queue: {
    name: env.QUEUE_NAME,
    concurrency: env.QUEUE_CONCURRENCY,
  },

  defaultTenant: {
    id: env.DEFAULT_TENANT_ID,
    name: env.DEFAULT_TENANT_NAME,
    slug: env.DEFAULT_TENANT_SLUG,
  },

  google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI ? {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  } : undefined,

  api: {
    url: env.API_URL || `http://localhost:${env.PORT}`,
  },

  storage: {
    uploadExpiry: env.STORAGE_UPLOAD_EXPIRY,
    playbackExpiry: env.STORAGE_PLAYBACK_EXPIRY,
    thumbnailExpiry: env.STORAGE_THUMBNAIL_EXPIRY,
    batchSize: env.STORAGE_BATCH_SIZE,
  },

  retry: {
    delayMs: env.RETRY_DELAY_MS,
    maxAttempts: env.RETRY_MAX_ATTEMPTS,
  },

  session: {
    reminderMinutes: env.SESSION_REMINDER_MINUTES,
  },

  anthropic: env.ANTHROPIC_API_KEY ? {
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL,
    maxTokens: env.ANTHROPIC_MAX_TOKENS,
    enabled: true,
  } : {
    apiKey: undefined,
    model: env.ANTHROPIC_MODEL,
    maxTokens: env.ANTHROPIC_MAX_TOKENS,
    enabled: false,
  },
} as const;

export default config;
// Railway rebuild trigger - Mon Dec 29 01:39:44 CET 2025
