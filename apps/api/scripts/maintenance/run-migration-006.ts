/**
 * Run Migration 006: Navigation Restructure
 */

import { getPrismaClient } from '../src/core/db/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = getPrismaClient();

async function main() {
  try {
    console.log('🚀 Running migration 006: Navigation Restructure...\n');

    const migrationPath = join(__dirname, '../database/schema/006_navigation_restructure.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute the migration
    await prisma.$executeRawUnsafe(sql);

    console.log('✅ Migration 006 completed successfully!\n');
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
