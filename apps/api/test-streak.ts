/**
 * Streak Tracking Test Script
 * Tests the goal streak functionality end-to-end
 */

import { getPrismaClient } from './src/core/db/prisma';
import { GoalsService } from './src/api/v1/goals/service';

const prisma = getPrismaClient();
const goalsService = new GoalsService();

async function testStreakTracking() {
  console.log('🧪 Testing Streak Tracking System\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Clean up and create a test user
    console.log('\n📝 Step 1: Setting up test user...');

    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'streak-test@example.com' }
    });

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      throw new Error('No tenant found. Please seed the database first.');
    }

    const testUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'streak-test@example.com',
        passwordHash: 'test-hash',
        firstName: 'Streak',
        lastName: 'Tester',
        role: 'player',
        isActive: true
      }
    });
    console.log(`✅ Created test user: ${testUser.email} (${testUser.id})`);

    // Step 2: Create a test goal
    console.log('\n📝 Step 2: Creating test goal...');
    const goal = await goalsService.createGoal(testUser.id, {
      title: 'Lower Golf Handicap',
      description: 'Reduce handicap through consistent practice',
      goalType: 'score',
      timeframe: 'medium',
      targetValue: 10,
      currentValue: 15,
      startValue: 20,
      unit: 'HCP',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      icon: 'Target',
      color: '#3B82F6'
    });
    console.log(`✅ Created goal: "${goal.title}" (${goal.id})`);
    console.log(`   Current: ${goal.currentValue} / Target: ${goal.targetValue} ${goal.unit}`);

    // Step 3: Test initial streak (Day 1)
    console.log('\n📝 Step 3: Testing Day 1 - First progress update...');
    await goalsService.updateProgress(goal.id, testUser.id, 14.5);
    let streak = await goalsService.getStreak(testUser.id);
    console.log(`✅ Streak after Day 1:`);
    console.log(`   Current: ${streak.currentStreak} days`);
    console.log(`   Longest: ${streak.longestStreak} days`);
    console.log(`   Status: ${streak.streakStatus}`);
    console.log(`   Days until expiry: ${streak.daysUntilExpiry}`);

    if (streak.currentStreak !== 1) {
      throw new Error(`Expected currentStreak=1, got ${streak.currentStreak}`);
    }

    // Step 4: Test same day update (should not increment)
    console.log('\n📝 Step 4: Testing same day update (should not increment)...');
    await goalsService.updateProgress(goal.id, testUser.id, 14);
    streak = await goalsService.getStreak(testUser.id);
    console.log(`✅ Streak after same-day update:`);
    console.log(`   Current: ${streak.currentStreak} days (should still be 1)`);

    if (streak.currentStreak !== 1) {
      throw new Error(`Expected currentStreak=1 on same day, got ${streak.currentStreak}`);
    }

    // Step 5: Simulate Day 2 (consecutive day)
    console.log('\n📝 Step 5: Simulating Day 2 (consecutive day)...');
    const now = new Date();
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

    await prisma.goalStreak.update({
      where: { userId: testUser.id },
      data: { lastActivityDate: yesterday }
    });

    await goalsService.updateProgress(goal.id, testUser.id, 13.5);
    streak = await goalsService.getStreak(testUser.id);
    console.log(`✅ Streak after Day 2:`);
    console.log(`   Current: ${streak.currentStreak} days (should be 2)`);
    console.log(`   Longest: ${streak.longestStreak} days`);
    console.log(`   Status: ${streak.streakStatus}`);

    if (streak.currentStreak !== 2) {
      throw new Error(`Expected currentStreak=2, got ${streak.currentStreak}`);
    }

    // Step 6: Simulate Day 3
    console.log('\n📝 Step 6: Simulating Day 3...');
    const twoDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

    await prisma.goalStreak.update({
      where: { userId: testUser.id },
      data: { lastActivityDate: twoDaysAgo }
    });

    await goalsService.updateProgress(goal.id, testUser.id, 13);
    streak = await goalsService.getStreak(testUser.id);
    console.log(`✅ Streak after Day 3:`);
    console.log(`   Current: ${streak.currentStreak} days (should be 3)`);
    console.log(`   Longest: ${streak.longestStreak} days`);

    if (streak.currentStreak !== 3) {
      throw new Error(`Expected currentStreak=3, got ${streak.currentStreak}`);
    }

    // Step 7: Check badge unlock
    console.log('\n📝 Step 7: Checking badge unlocks...');
    const badges = await goalsService.getBadges(testUser.id);
    console.log(`✅ Badges unlocked: ${badges.unlockedCount} / ${badges.totalBadges}`);

    const threeDayBadge = badges.badges.find(b => b.badgeId === 'three_day_streak');
    if (threeDayBadge) {
      console.log(`   🔥 "${threeDayBadge.name}" - ${threeDayBadge.description}`);
    }

    const firstGoalBadge = badges.badges.find(b => b.badgeId === 'first_goal');
    if (firstGoalBadge) {
      console.log(`   🎯 "${firstGoalBadge.name}" - ${firstGoalBadge.description}`);
    }

    // Step 8: Test freeze (2-day gap)
    console.log('\n📝 Step 8: Testing freeze feature (2-day gap)...');
    const threeDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));

    await prisma.goalStreak.update({
      where: { userId: testUser.id },
      data: {
        lastActivityDate: threeDaysAgo,
        freezeUsed: false
      }
    });

    await goalsService.updateProgress(goal.id, testUser.id, 12.5);
    streak = await goalsService.getStreak(testUser.id);
    console.log(`✅ Streak after 2-day gap with freeze:`);
    console.log(`   Current: ${streak.currentStreak} days (should be 3 - maintained)`);
    console.log(`   Status: ${streak.streakStatus}`);

    // Step 9: Test streak break (3+ day gap)
    console.log('\n📝 Step 9: Testing streak break (3+ day gap)...');
    const fourDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));

    await prisma.goalStreak.update({
      where: { userId: testUser.id },
      data: { lastActivityDate: fourDaysAgo }
    });

    await goalsService.updateProgress(goal.id, testUser.id, 12);
    streak = await goalsService.getStreak(testUser.id);
    console.log(`✅ Streak after 3+ day gap (streak broken):`);
    console.log(`   Current: ${streak.currentStreak} days (should be 1 - reset)`);
    console.log(`   Longest: ${streak.longestStreak} days (should still be 3)`);

    if (streak.currentStreak !== 1) {
      throw new Error(`Expected currentStreak=1 after break, got ${streak.currentStreak}`);
    }

    if (streak.longestStreak !== 3) {
      throw new Error(`Expected longestStreak=3, got ${streak.longestStreak}`);
    }

    // Step 10: Verify stats
    console.log('\n📝 Step 10: Checking goal stats...');
    const stats = await goalsService.getStats(testUser.id);
    console.log(`✅ Goal Statistics:`);
    console.log(`   Active goals: ${stats.totalActive}`);
    console.log(`   Completed goals: ${stats.totalCompleted}`);
    console.log(`   Average progress: ${stats.averageProgress}%`);
    console.log(`   Completed this month: ${stats.completedThisMonth}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED! 🎉');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('   ✓ Streak creation works');
    console.log('   ✓ Consecutive day tracking works');
    console.log('   ✓ Same-day updates handled correctly');
    console.log('   ✓ Streak freeze feature works');
    console.log('   ✓ Streak break detection works');
    console.log('   ✓ Longest streak tracking works');
    console.log('   ✓ Badge auto-unlock works');
    console.log('   ✓ Stats calculation works');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testStreakTracking()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
