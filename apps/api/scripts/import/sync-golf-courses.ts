/**
 * Golf Course Sync Script
 * Syncs golf courses from GolfCourseAPI to local database
 *
 * Usage:
 *   npx tsx scripts/sync-golf-courses.ts [country]
 *
 * Examples:
 *   npx tsx scripts/sync-golf-courses.ts Norway
 *   npx tsx scripts/sync-golf-courses.ts Sweden
 *   npx tsx scripts/sync-golf-courses.ts  # defaults to Norway
 */

import prisma from '../prisma/client';
import { GolfCourseService } from '../src/api/v1/golf-courses/service';


async function main() {
  const country = process.argv[2] || 'Norway';

  console.log(`\n🏌️ Golf Course Sync Script`);
  console.log(`===========================`);
  console.log(`Country: ${country}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const service = new GolfCourseService(prisma);

  // Check current status
  const statusBefore = await service.getSyncStatus();
  console.log(`Current database status:`);
  console.log(`  - Total clubs: ${statusBefore.totalClubs}`);
  console.log(`  - Total courses: ${statusBefore.totalCourses}`);
  console.log(`  - Total tees: ${statusBefore.totalTees}`);
  console.log(`  - API configured: ${statusBefore.apiConfigured}`);
  console.log(`  - Last sync: ${statusBefore.lastSyncAt || 'Never'}\n`);

  if (!statusBefore.apiConfigured) {
    console.error('❌ GolfCourseAPI key not configured!');
    console.error('   Set GOLFCOURSE_API_KEY environment variable');
    process.exit(1);
  }

  console.log(`Starting sync for ${country}...`);
  const startTime = Date.now();

  try {
    const result = await service.syncCountry(country);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Sync completed in ${duration}s`);
    console.log(`   - Clubs created: ${result.clubsCreated}`);
    console.log(`   - Courses created: ${result.coursesCreated}`);
    console.log(`   - Tees created: ${result.teesCreated}`);

    // Show updated status
    const statusAfter = await service.getSyncStatus();
    console.log(`\nUpdated database status:`);
    console.log(`  - Total clubs: ${statusAfter.totalClubs}`);
    console.log(`  - Total courses: ${statusAfter.totalCourses}`);
    console.log(`  - Total tees: ${statusAfter.totalTees}`);

    if (statusAfter.topCountries.length > 0) {
      console.log(`\n  Top countries:`);
      statusAfter.topCountries.forEach(c => {
        console.log(`    - ${c.country}: ${c.clubs} clubs`);
      });
    }
  } catch (error: any) {
    console.error(`\n❌ Sync failed: ${error.message}`);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
