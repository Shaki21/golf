/**
 * Run Migration 007: Session Recurrence & Exercises
 */

import { getPrismaClient } from '../src/core/db/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = getPrismaClient();

async function main() {
  try {
    console.log('🚀 Running migration 007: Session Recurrence & Exercises...\n');

    const migrationPath = join(__dirname, '../database/schema/007_session_recurrence_exercises.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute the migration
    await prisma.$executeRawUnsafe(sql);

    console.log('✅ Migration 007 completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
