import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../../utils/logger';
import { config } from '../../config';

// Prisma event types
type QueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

type LogEvent = {
  timestamp: Date;
  message: string;
  target: string;
};

// Extension operation context type
interface ExtensionContext {
  args: Record<string, unknown>;
  query: (args: Record<string, unknown>) => Promise<unknown>;
  model: string;
}

/**
 * Create Prisma Client singleton
 */
let prisma: PrismaClient;
let pool: Pool | null = null;

/**
 * Get Prisma Client instance
 * Prisma 7: Uses pg adapter for database connection
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const devLogConfig: Prisma.LogDefinition[] = [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ];
    const prodLogConfig: Prisma.LogDefinition[] = [
      { level: 'error', emit: 'event' },
    ];

    // Create pg Pool for Prisma 7 adapter
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
      log: config.server.isDevelopment ? devLogConfig : prodLogConfig,
    });

    // Log queries in development
    if (config.server.isDevelopment) {
      prisma.$on('query' as never, (e: QueryEvent) => {
        logger.debug({
          query: e.query,
          params: e.params,
          duration: e.duration,
        }, 'Prisma query');
      });
    }

    // Log errors
    prisma.$on('error' as never, (e: LogEvent) => {
      logger.error({ err: e }, 'Prisma error');
    });

    // Log warnings
    prisma.$on('warn' as never, (e: LogEvent) => {
      logger.warn({ message: e.message }, 'Prisma warning');
    });

    // Handle graceful shutdown (only in production, not in tests)
    if (process.env.NODE_ENV !== 'test') {
      let isDisconnecting = false;
      process.on('beforeExit', async () => {
        if (!isDisconnecting) {
          isDisconnecting = true;
          await prisma.$disconnect();
          logger.info('Prisma client disconnected');
        }
      });
    }
  }

  return prisma;
}

/**
 * Create a Prisma client with tenant context
 * All queries will be automatically filtered by tenantId
 */
export function createTenantPrismaClient(tenantId: string) {
  const prisma = getPrismaClient();

  return prisma.$extends({
    query: {
      // Apply tenant filter to all models that have tenantId field
      $allModels: {
        async findMany({ args, query, model }: ExtensionContext) {
          // Check if model has tenantId field
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async findFirst({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async findUnique({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async count({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async aggregate({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async create({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.data = { ...(args.data as object), tenantId };
          }
          return query(args);
        },
        async createMany({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: Record<string, unknown>) => ({ ...item, tenantId }));
            } else {
              args.data = { ...(args.data as object), tenantId };
            }
          }
          return query(args);
        },
        async update({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async updateMany({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async delete({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
        async deleteMany({ args, query, model }: ExtensionContext) {
          if (hasTenantIdField(model)) {
            args.where = { ...(args.where as object), tenantId };
          }
          return query(args);
        },
      },
    },
  });
}

/**
 * Check if model has tenantId field
 * Models without tenantId: Tenant, User, RefreshToken (these are global or user-specific)
 */
function hasTenantIdField(modelName: string): boolean {
  const modelsWithoutTenantId = ['Tenant', 'User', 'RefreshToken'];
  return !modelsWithoutTenantId.includes(modelName);
}

/**
 * Sleep helper for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connect to database with retry logic for production environments
 * Uses exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s... up to maxDelay
 */
export async function connectDatabase(): Promise<void> {
  const prisma = getPrismaClient();

  const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '10', 10);
  const initialDelay = parseInt(process.env.DB_CONNECT_INITIAL_DELAY || '1000', 10);
  const maxDelay = parseInt(process.env.DB_CONNECT_MAX_DELAY || '30000', 10);

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      await prisma.$connect();
      if (attempt > 1) {
        logger.info({ attempts: attempt }, 'Database connected successfully after retries');
      } else {
        logger.info('Database connected successfully');
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this is a connection error (P1001 = can't reach database)
      const isConnectionError =
        lastError.message.includes('P1001') ||
        lastError.message.includes("Can't reach database") ||
        lastError.message.includes('ECONNREFUSED') ||
        lastError.message.includes('ENOTFOUND') ||
        lastError.message.includes('ETIMEDOUT');

      if (!isConnectionError || attempt >= maxRetries) {
        logger.error(
          { err: lastError, attempt, maxRetries },
          'Failed to connect to database'
        );
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);

      logger.warn(
        { attempt, maxRetries, delayMs: delay, error: lastError.message },
        `Database connection failed, retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  // Should not reach here, but just in case
  throw lastError || new Error('Failed to connect to database after max retries');
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  const prisma = getPrismaClient();
  try {
    await prisma.$disconnect();
    // Also close the pg pool
    if (pool) {
      await pool.end();
      pool = null;
    }
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to disconnect from database');
    throw error;
  }
}

// Export default instance
export default getPrismaClient();
