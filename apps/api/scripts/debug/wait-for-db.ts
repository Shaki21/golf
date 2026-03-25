#!/usr/bin/env tsx
/**
 * Wait for Database Connection Script
 *
 * Waits for the PostgreSQL database to be available before proceeding.
 * Uses exponential backoff with configurable parameters.
 *
 * Usage:
 *   npx tsx scripts/wait-for-db.ts
 *   npx tsx scripts/wait-for-db.ts --timeout 120
 *
 * Environment variables:
 *   DATABASE_URL          - PostgreSQL connection string (required)
 *   DB_CONNECT_RETRIES    - Max retry attempts (default: 30)
 *   DB_CONNECT_TIMEOUT    - Total timeout in seconds (default: 120)
 *
 * Exit codes:
 *   0 - Database is available
 *   1 - Database connection failed after all retries
 */

import prisma from '../prisma/client';

// Parse command line arguments
const args = process.argv.slice(2);
const timeoutArgIndex = args.indexOf('--timeout');
const timeout =
  timeoutArgIndex !== -1
    ? parseInt(args[timeoutArgIndex + 1], 10)
    : parseInt(process.env.DB_CONNECT_TIMEOUT || '120', 10);

const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '30', 10);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Mask password in logs
const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`🔄 Waiting for database: ${maskedUrl}`);
console.log(`   Timeout: ${timeout}s, Max retries: ${maxRetries}`);

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test database connection using Prisma
 */
async function testConnection(): Promise<boolean> {
  const prisma = new PrismaClient({
    log: [], // Disable logging for connection test
  });

  try {
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch {
    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

/**
 * Main function with retry logic
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  let attempt = 0;
  const initialDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds max

  while (attempt < maxRetries) {
    attempt++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    if (elapsed >= timeout) {
      console.error(`❌ Timeout reached after ${elapsed}s`);
      process.exit(1);
    }

    const isConnected = await testConnection();

    if (isConnected) {
      console.log(`✅ Database is ready! (attempt ${attempt}, ${elapsed}s elapsed)`);
      process.exit(0);
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(initialDelay * Math.pow(1.5, attempt - 1), maxDelay);
    const remainingTime = timeout - elapsed;

    console.log(
      `   Attempt ${attempt}/${maxRetries}: Not ready, retrying in ${Math.round(delay / 1000)}s... (${remainingTime}s remaining)`
    );

    await sleep(delay);
  }

  console.error(`❌ Database not available after ${maxRetries} attempts`);
  process.exit(1);
}

main().catch((err: Error) => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
