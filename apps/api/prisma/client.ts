/**
 * Prisma 7 Client for seeds and scripts
 * Uses pg adapter for database connection
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let pool: Pool | null = null;

export function createPrismaClient(): PrismaClient {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function disconnectPrisma(prisma: PrismaClient): Promise<void> {
  await prisma.$disconnect();
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Default export for simple imports
const prisma = createPrismaClient();
export default prisma;
