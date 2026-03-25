/**
 * ================================================================
 * Demo Data Refresh Script
 * ================================================================
 *
 * Regenerates premium demo player data for Andreas Holm.
 * Use this to refresh demo data with current dates before deployment.
 *
 * Usage:
 *   npm run seed:demo
 *   npm run seed:demo -- --clean  (removes all old demo data first)
 *   npm run seed:demo -- --dry-run (preview without changes)
 */

import prisma from '../prisma/client';
import { seedPremiumPlayer } from '../prisma/seeds/demo-premium-player';


interface RefreshOptions {
  clean?: boolean;
  dryRun?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): RefreshOptions {
  const args = process.argv.slice(2);
  const options: RefreshOptions = {
    clean: false,
    dryRun: false,
  };

  args.forEach(arg => {
    if (arg === '--clean') {
      options.clean = true;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
    }
  });

  return options;
}

/**
 * Clean existing demo data for player@demo.com
 */
async function cleanDemoData() {
  console.log('🧹 Cleaning existing demo data...\n');

  try {
    const player = await prisma.player.findFirst({
      where: { email: 'player@demo.com' },
    });

    if (!player) {
      console.log('   ⚠️  No demo player found, skipping cleanup');
      return;
    }

    // Delete in correct order (respect foreign key constraints)

    // 1. Training sessions
    const deletedSessions = await prisma.trainingSession.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedSessions.count} training sessions`);

    // 2. Test results
    const deletedTests = await prisma.testResult.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedTests.count} test results`);

    // 3. Player badges
    const deletedBadges = await prisma.playerBadge.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedBadges.count} player badges`);

    // 4. Goals
    const playerUser = await prisma.user.findUnique({
      where: { email: 'player@demo.com' },
    });

    if (playerUser) {
      const deletedGoals = await prisma.goal.deleteMany({
        where: { userId: playerUser.id },
      });
      console.log(`   ✅ Deleted ${deletedGoals.count} goals`);
    }

    // 5. Daily training assignments
    const deletedAssignments = await prisma.dailyTrainingAssignment.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedAssignments.count} daily assignments`);

    // 6. Periodizations
    const deletedPeriodizations = await prisma.periodization.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedPeriodizations.count} periodizations`);

    // 7. Annual training plan
    const deletedPlans = await prisma.annualTrainingPlan.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedPlans.count} annual training plans`);

    // 8. Weekly stats
    const deletedWeeklyStats = await prisma.weeklyTrainingStats.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedWeeklyStats.count} weekly stats`);

    // 9. Monthly stats
    const deletedMonthlyStats = await prisma.monthlyTrainingStats.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedMonthlyStats.count} monthly stats`);

    // 10. Daily stats
    const deletedDailyStats = await prisma.dailyTrainingStats.deleteMany({
      where: { playerId: player.id },
    });
    console.log(`   ✅ Deleted ${deletedDailyStats.count} daily stats`);

    console.log('\n   ✨ Cleanup complete!\n');

  } catch (error) {
    console.error('❌ Error cleaning demo data:', error);
    throw error;
  }
}

/**
 * Main refresh function
 */
async function refreshDemoData() {
  const options = parseArgs();

  console.log('🔄 Demo Data Refresh Script');
  console.log('==========================\n');

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Step 1: Clean existing data (if --clean flag)
    if (options.clean && !options.dryRun) {
      await cleanDemoData();
    } else if (options.clean && options.dryRun) {
      console.log('🔍 Would clean existing demo data (skipped in dry-run)\n');
    }

    // Step 2: Seed premium player
    if (!options.dryRun) {
      await seedPremiumPlayer();
    } else {
      console.log('🔍 Would seed premium player: Andreas Holm\n');
      console.log('   • 120 training sessions over 6 months');
      console.log('   • 18 test results with progression');
      console.log('   • 24 badges earned');
      console.log('   • 8 goals (2 completed, 6 in progress)');
      console.log('   • Handicap progression: 12.5 → 5.2\n');
    }

    // Step 3: Summary
    console.log('\n✅ Demo data refresh complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start local dev: npm run dev');
    console.log('   2. Login: player@demo.com / player123');
    console.log('   3. Verify dashboard shows Andreas Holm with rich data');
    console.log('   4. Deploy to Railway and run: npm run seed:demo\n');

  } catch (error) {
    console.error('❌ Demo data refresh failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
refreshDemoData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
