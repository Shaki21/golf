/**
 * SG Expected Strokes Baseline Seed
 *
 * Seeds the database with synthetic expected strokes values.
 * These are placeholder values based on general golf knowledge.
 * Replace with real PGA Tour ShotLink data for production accuracy.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// DISTANCE BUCKETS (meters)
// ============================================================================

const DISTANCE_BUCKETS = [
  { min: 0, max: 3 },
  { min: 3, max: 6 },
  { min: 6, max: 10 },
  { min: 10, max: 15 },
  { min: 15, max: 25 },
  { min: 25, max: 50 },
  { min: 50, max: 75 },
  { min: 75, max: 100 },
  { min: 100, max: 125 },
  { min: 125, max: 150 },
  { min: 150, max: 175 },
  { min: 175, max: 200 },
  { min: 200, max: 999 },
];

// ============================================================================
// SYNTHETIC EXPECTED STROKES VALUES
// ============================================================================

const EXPECTED_STROKES: Record<string, Record<string, number>> = {
  TEE: {
    '0-3': 1.0,
    '3-6': 1.05,
    '6-10': 1.1,
    '10-15': 1.15,
    '15-25': 1.25,
    '25-50': 1.4,
    '50-75': 2.1,
    '75-100': 2.3,
    '100-125': 2.5,
    '125-150': 2.7,
    '150-175': 2.85,
    '175-200': 2.95,
    '200-999': 3.2,
  },
  FAIRWAY: {
    '0-3': 1.0,
    '3-6': 1.05,
    '6-10': 1.1,
    '10-15': 1.2,
    '15-25': 1.35,
    '25-50': 1.8,
    '50-75': 2.3,
    '75-100': 2.55,
    '100-125': 2.75,
    '125-150': 2.9,
    '150-175': 3.0,
    '175-200': 3.1,
    '200-999': 3.3,
  },
  ROUGH: {
    '0-3': 1.1,
    '3-6': 1.15,
    '6-10': 1.25,
    '10-15': 1.4,
    '15-25': 1.6,
    '25-50': 2.1,
    '50-75': 2.5,
    '75-100': 2.75,
    '100-125': 2.95,
    '125-150': 3.1,
    '150-175': 3.25,
    '175-200': 3.4,
    '200-999': 3.6,
  },
  BUNKER: {
    '0-3': 1.2,
    '3-6': 1.3,
    '6-10': 1.5,
    '10-15': 1.8,
    '15-25': 2.1,
    '25-50': 2.6,
    '50-75': 2.9,
    '75-100': 3.1,
    '100-125': 3.3,
    '125-150': 3.5,
    '150-175': 3.7,
    '175-200': 3.9,
    '200-999': 4.1,
  },
  RECOVERY: {
    '0-3': 1.5,
    '3-6': 1.6,
    '6-10': 1.8,
    '10-15': 2.1,
    '15-25': 2.4,
    '25-50': 2.8,
    '50-75': 3.2,
    '75-100': 3.5,
    '100-125': 3.7,
    '125-150': 3.9,
    '150-175': 4.1,
    '175-200': 4.3,
    '200-999': 4.5,
  },
  GREEN: {
    '0-3': 1.0,
    '3-6': 1.5,
    '6-10': 1.8,
    '10-15': 1.95,
    '15-25': 2.1,
    '25-50': 2.3,
    '50-75': 2.5,
    '75-100': 2.7,
    '100-125': 2.9,
    '125-150': 3.1,
    '150-175': 3.3,
    '175-200': 3.5,
    '200-999': 3.7,
  },
  PENALTY: {
    '0-3': 2.0,
    '3-6': 2.1,
    '6-10': 2.2,
    '10-15': 2.4,
    '15-25': 2.6,
    '25-50': 2.9,
    '50-75': 3.2,
    '75-100': 3.5,
    '100-125': 3.7,
    '125-150': 3.9,
    '150-175': 4.1,
    '175-200': 4.3,
    '200-999': 4.5,
  },
  OTHER: {
    '0-3': 1.2,
    '3-6': 1.3,
    '6-10': 1.5,
    '10-15': 1.7,
    '15-25': 1.9,
    '25-50': 2.3,
    '50-75': 2.7,
    '75-100': 3.0,
    '100-125': 3.2,
    '125-150': 3.4,
    '150-175': 3.6,
    '175-200': 3.8,
    '200-999': 4.0,
  },
};

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedSGBaseline(): Promise<void> {
  console.log('Seeding SG Expected Strokes Baseline...');

  const version = 'synthetic_v1.0';
  const description = 'Synthetic baseline values for development and testing';
  const source = 'Synthetic - based on general golf knowledge';

  // Delete existing entries for this version
  await prisma.$executeRaw`
    DELETE FROM sg_expected_strokes_baseline WHERE version = ${version}
  `;

  // Insert all entries
  let insertCount = 0;

  for (const [lie, buckets] of Object.entries(EXPECTED_STROKES)) {
    for (const [bucketKey, expectedStrokes] of Object.entries(buckets)) {
      const [min, max] = bucketKey.split('-').map(Number);

      await prisma.$executeRaw`
        INSERT INTO sg_expected_strokes_baseline (
          id, version, description, is_active, lie_category, distance_bucket_min,
          distance_bucket_max, expected_strokes, sample_size, source, created_at
        ) VALUES (
          gen_random_uuid(),
          ${version},
          ${description},
          true,
          ${lie}::"LieCategory",
          ${min},
          ${max},
          ${expectedStrokes},
          10000,
          ${source},
          NOW()
        )
      `;

      insertCount++;
    }
  }

  console.log(`Inserted ${insertCount} baseline entries for version ${version}`);

  // Deactivate other versions
  await prisma.$executeRaw`
    UPDATE sg_expected_strokes_baseline SET is_active = false WHERE version != ${version}
  `;

  console.log('SG baseline seeding complete!');
}

// ============================================================================
// RUN IF MAIN
// ============================================================================

async function main(): Promise<void> {
  try {
    await seedSGBaseline();
  } catch (error) {
    console.error('Error seeding SG baseline:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}
