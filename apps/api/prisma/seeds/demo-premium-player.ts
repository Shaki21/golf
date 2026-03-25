/**
 * ================================================================
 * Premium Demo Player Seed
 * ================================================================
 *
 * Creates a realistic Norwegian demo profile for showcasing the app:
 * - Andreas Holm (16 år, Mørj Golfklubb)
 * - 6 måneder treningshistorikk (120 økter)
 * - 18 tester med imponerende progressjon
 * - 24 badges opptjent
 * - Handicap: 6.2 → 3.9 (-2.3 forbedring)
 */

import prisma from '../client';
import * as argon2 from 'argon2';


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date X weeks ago
 */
function weeksAgo(weeks: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - (weeks * 7));
  date.setHours(10, 0, 0, 0);
  return date;
}

/**
 * Get date X days ago
 */
function daysAgo(days: number, hour: number = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random choice from array
 */
function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Random decimal between min and max
 */
function randomDecimal(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

export async function seedPremiumPlayer() {
  console.log('\n🌟 Seeding Premium Demo Player (Andreas Holm)...\n');

  try {
    // Get tenant and coach
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'ak-golf-academy' },
    });

    const coach = await prisma.coach.findFirst({
      where: { email: 'coach@demo.com' },
    });

    if (!tenant || !coach) {
      throw new Error('Tenant or coach not found. Run demo-users seed first.');
    }

    // ========================================================================
    // 1. CREATE PREMIUM PLAYER USER & PROFILE
    // ========================================================================

    const playerPassword = await argon2.hash('player123');

    // Update existing player user with Andreas Holm details
    const playerUser = await prisma.user.update({
      where: { email: 'player@demo.com' },
      data: {
        firstName: 'Andreas',
        lastName: 'Holm',
      },
    });

    console.log(`   🔍 Found user: ${playerUser.email} (id: ${playerUser.id})`);

    // Find player profile by email (Player model has email field)
    const existingPlayer = await prisma.player.findFirst({
      where: { email: 'player@demo.com' },
    });

    console.log(`   🔍 Player profile found: ${existingPlayer ? 'Yes' : 'No'}`);

    if (!existingPlayer) {
      throw new Error('Player profile not found for player@demo.com. Run main seed first: npm run prisma:seed');
    }

    // Link player to user if not already linked
    if (!existingPlayer.userId) {
      await prisma.player.update({
        where: { id: existingPlayer.id },
        data: { userId: playerUser.id },
      });
      console.log(`   ✅ Linked player profile to user`);
    }

    const player = await prisma.player.update({
      where: { id: existingPlayer.id },
      data: {
        firstName: 'Andreas',
        lastName: 'Holm',
        dateOfBirth: new Date('2009-03-15'), // 16 years old
        gender: 'male',
        phone: '+47 456 78 901',
        category: 'A', // Elite tier (hcp under 4.4)
        handicap: 3.9, // Current (impressive)
        club: 'Mørj Golfklubb',
        coachId: coach.id,
        seasonStartDate: weeksAgo(26), // Started 6 months ago
        goals: [
          'Nå kategori A innen sesongstart',
          'Forbedre driver distance til 250m+',
          'Handicap under 5.0',
          'Vinne klubbmesterskap junior',
        ],
        weeklyTrainingHours: 15,
        status: 'active',
        emergencyContact: {
          name: 'Kari Holm',
          phone: '+47 987 65 432',
          email: 'kari.holm@example.com',
          relation: 'Mor',
        },
      },
    });

    console.log('   ✅ Updated player: Andreas Holm (16 år, Mørj Golfklubb)');

    // ========================================================================
    // 2. CREATE ANNUAL TRAINING PLAN
    // ========================================================================

    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    let annualPlan = await prisma.annualTrainingPlan.findFirst({
      where: { playerId: player.id },
    });

    if (!annualPlan) {
      annualPlan = await prisma.annualTrainingPlan.create({
        data: {
          playerId: player.id,
          tenantId: tenant.id,
          planName: `Årsplan ${year} - Magnus Karlsen`,
          startDate: yearStart,
          endDate: yearEnd,
          status: 'active',
          baselineAverageScore: 78,
          baselineHandicap: 12.5, // Started at 12.5 handicap
          baselineDriverSpeed: 95,
          playerCategory: 'B',
          basePeriodWeeks: 12,
          specializationWeeks: 20,
          tournamentWeeks: 16,
          weeklyHoursTarget: 15,
          intensityProfile: {
            base: { volume: 'high', intensity: 'medium' },
            specialization: { volume: 'medium', intensity: 'high' },
            tournament: { volume: 'medium', intensity: 'peak' },
            recovery: { volume: 'low', intensity: 'low' },
          },
          generatedAt: weeksAgo(26),
          generationAlgorithm: 'v1.0',
          notes: 'Ekstremt talentfull juniorspiller. Fokus på å nå kategori A. Imponerende progresjon siste 6 måneder.',
        },
      });
      console.log('   ✅ Created annual training plan');
    }

    // ========================================================================
    // 3. GENERATE 120 TRAINING SESSIONS (Last 6 months, 4-6/week)
    // ========================================================================

    const sessionTypes = [
      { type: 'teknikk', focusAreas: ['Driver', 'Jern', 'Wedge', 'Putting'] },
      { type: 'golfslag', focusAreas: ['Short game', 'Approach', 'Bunker', 'Wedge'] },
      { type: 'spill', focusAreas: ['Banespill', 'Strategi', 'Konkurranse'] },
      { type: 'fysisk', focusAreas: ['Styrke', 'Mobilitet', 'Power', 'Kondisjon'] },
      { type: 'mental', focusAreas: ['Visualisering', 'Focus', 'Pre-shot rutine'] },
    ];

    let sessionsCreated = 0;
    const totalWeeks = 26; // 6 months

    for (let week = 0; week < totalWeeks; week++) {
      const sessionsThisWeek = randomInt(4, 6); // 4-6 sessions per week

      for (let i = 0; i < sessionsThisWeek; i++) {
        const sessionType = randomChoice(sessionTypes);
        const focusArea = randomChoice(sessionType.focusAreas);
        const sessionDate = weeksAgo(totalWeeks - week).getTime() + (i * 24 * 60 * 60 * 1000); // Spread across week

        // Progressive improvement in intensity and learning phase
        const weekProgress = week / totalWeeks; // 0 to 1
        const intensity = Math.min(5, Math.floor(2 + weekProgress * 3)); // 2 → 5
        const learningPhases = ['L2', 'L3', 'L3', 'L4', 'L4', 'L5'];
        const learningPhase = learningPhases[Math.min(5, Math.floor(weekProgress * 6))];

        // Duration varies by session type
        let duration = 90;
        if (sessionType.type === 'spill') duration = randomInt(180, 240);
        if (sessionType.type === 'fysisk') duration = randomInt(45, 60);
        if (sessionType.type === 'mental') duration = randomInt(30, 45);
        if (sessionType.type === 'golfslag') duration = randomInt(90, 120);

        const existing = await prisma.trainingSession.findFirst({
          where: {
            playerId: player.id,
            sessionDate: new Date(sessionDate),
          },
        });

        if (!existing) {
          await prisma.trainingSession.create({
            data: {
              playerId: player.id,
              coachId: week % 2 === 0 ? coach.id : null, // Coach present every other week
              sessionType: sessionType.type,
              sessionDate: new Date(sessionDate),
              duration,
              focusArea,
              period: 'G', // Assume grunnlagsperiode
              intensity,
              learningPhase,
              clubSpeed: 'CS90',
              notes: `${focusArea} økt - Uke ${week + 1}`,
            },
          });
          sessionsCreated++;
        }
      }
    }

    console.log(`   ✅ Created ${sessionsCreated} training sessions (6 months, avg 5/week)`);

    // ========================================================================
    // 4. GENERATE 18 TEST RESULTS WITH PROGRESSION
    // ========================================================================

    // Progressive test results over 6 months (every 2-3 weeks)
    const testSchedule = [
      { weeksAgo: 26, driverDistance: 210, driverSpeed: 95, puttingAccuracy: 65, approachGIR: 55, shortGameUpDown: 50 },
      { weeksAgo: 23, driverDistance: 215, driverSpeed: 97, puttingAccuracy: 68, approachGIR: 57, shortGameUpDown: 52 },
      { weeksAgo: 20, driverDistance: 218, driverSpeed: 99, puttingAccuracy: 70, approachGIR: 58, shortGameUpDown: 55 },
      { weeksAgo: 18, driverDistance: 222, driverSpeed: 100, puttingAccuracy: 72, approachGIR: 60, shortGameUpDown: 58 },
      { weeksAgo: 16, driverDistance: 225, driverSpeed: 101, puttingAccuracy: 72, approachGIR: 62, shortGameUpDown: 60 },
      { weeksAgo: 14, driverDistance: 228, driverSpeed: 102, puttingAccuracy: 74, approachGIR: 64, shortGameUpDown: 62 },
      { weeksAgo: 12, driverDistance: 230, driverSpeed: 103, puttingAccuracy: 75, approachGIR: 65, shortGameUpDown: 65 },
      { weeksAgo: 10, driverDistance: 232, driverSpeed: 104, puttingAccuracy: 76, approachGIR: 66, shortGameUpDown: 66 },
      { weeksAgo: 8, driverDistance: 235, driverSpeed: 105, puttingAccuracy: 78, approachGIR: 68, shortGameUpDown: 68 },
      { weeksAgo: 6, driverDistance: 237, driverSpeed: 106, puttingAccuracy: 79, approachGIR: 70, shortGameUpDown: 70 },
      { weeksAgo: 4, driverDistance: 240, driverSpeed: 107, puttingAccuracy: 80, approachGIR: 70, shortGameUpDown: 72 },
      { weeksAgo: 2, driverDistance: 242, driverSpeed: 108, puttingAccuracy: 82, approachGIR: 72, shortGameUpDown: 75 },
      { weeksAgo: 1, driverDistance: 242, driverSpeed: 108, puttingAccuracy: 82, approachGIR: 72, shortGameUpDown: 75 }, // Latest (stable)
    ];

    // Get test protocols
    const tests = await prisma.test.findMany({
      where: { tenantId: tenant.id },
      take: 20,
    });

    const driverDistanceTest = tests.find(t => t.name.includes('Driver Carry'));
    const driverSpeedTest = tests.find(t => t.name.includes('Driver') && t.name.includes('Speed'));
    const puttingTest = tests.find(t => t.category === 'putting');
    const girTest = tests.find(t => t.name.includes('GIR') || t.name.includes('Greens'));
    const shortGameTest = tests.find(t => t.name.includes('Up & Down') || t.name.includes('Short Game'));

    let testsCreated = 0;

    for (const schedule of testSchedule) {
      const testDate = weeksAgo(schedule.weeksAgo);

      // Driver Distance Test
      if (driverDistanceTest) {
        const existing = await prisma.testResult.findFirst({
          where: {
            playerId: player.id,
            testId: driverDistanceTest.id,
            testDate,
          },
        });

        if (!existing) {
          await prisma.testResult.create({
            data: {
              playerId: player.id,
              testId: driverDistanceTest.id,
              testDate,
              value: schedule.driverDistance,
              results: {
                carry: schedule.driverDistance,
                attempts: [
                  schedule.driverDistance - randomInt(3, 8),
                  schedule.driverDistance + randomInt(1, 5),
                  schedule.driverDistance,
                  schedule.driverDistance - randomInt(1, 6),
                  schedule.driverDistance + randomInt(2, 7),
                ],
              },
              passed: true,
            },
          });
          testsCreated++;
        }
      }

      // Driver Speed Test
      if (driverSpeedTest) {
        const existing = await prisma.testResult.findFirst({
          where: {
            playerId: player.id,
            testId: driverSpeedTest.id,
            testDate,
          },
        });

        if (!existing) {
          await prisma.testResult.create({
            data: {
              playerId: player.id,
              testId: driverSpeedTest.id,
              testDate,
              value: schedule.driverSpeed,
              results: {
                speed: schedule.driverSpeed,
                attempts: [
                  schedule.driverSpeed - randomDecimal(1, 3),
                  schedule.driverSpeed + randomDecimal(0.5, 2),
                  schedule.driverSpeed,
                  schedule.driverSpeed - randomDecimal(0.5, 2.5),
                  schedule.driverSpeed + randomDecimal(1, 2.5),
                ],
              },
              passed: true,
            },
          });
          testsCreated++;
        }
      }

      // Putting Test (every 3rd test)
      if (puttingTest && schedule.weeksAgo % 6 === 0) {
        const existing = await prisma.testResult.findFirst({
          where: {
            playerId: player.id,
            testId: puttingTest.id,
            testDate,
          },
        });

        if (!existing) {
          const totalAttempts = 20;
          const holed = Math.round((schedule.puttingAccuracy / 100) * totalAttempts);
          await prisma.testResult.create({
            data: {
              playerId: player.id,
              testId: puttingTest.id,
              testDate,
              value: schedule.puttingAccuracy,
              results: {
                holed,
                attempts: totalAttempts,
                accuracy: schedule.puttingAccuracy,
              },
              passed: true,
            },
          });
          testsCreated++;
        }
      }
    }

    console.log(`   ✅ Created ${testsCreated} test results with progression`);

    // ========================================================================
    // 5. CREATE PLAYER BADGES (24 earned)
    // ========================================================================

    // Assign realistic badges for Magnus (based on 6 months progression)
    const badgeIds = [
      // Volume badges
      'hours_10', 'hours_50', 'hours_100',
      'sessions_10', 'sessions_50', 'sessions_100',
      // Consistency badges
      'streak_7', 'streak_14', 'streak_30',
      // Driver badges
      'driver_200m', 'driver_225m', 'driver_240m',
      'clubspeed_100mph', 'clubspeed_105mph',
      // Putting badges
      'putting_5ft_70pct', 'putting_10ft_50pct',
      // Short game
      'updown_50pct',
      // Progression badges
      'handicap_drop_1', 'handicap_drop_3', 'handicap_drop_5',
      // Test badges
      'tests_5', 'tests_10', 'tests_15',
      // Category badge
      'category_b',
    ];

    let badgesEarned = 0;

    for (const badgeId of badgeIds) {
      const earnedDate = weeksAgo(randomInt(1, 26));

      const existing = await prisma.playerBadge.findFirst({
        where: {
          playerId: player.id,
          badgeId,
        },
      });

      if (!existing) {
        await prisma.playerBadge.create({
          data: {
            playerId: player.id,
            badgeId,
            earnedAt: earnedDate,
            progress: 100,
          },
        });
        badgesEarned++;
      }
    }

    console.log(`   ✅ Assigned ${badgesEarned} badges to Magnus`);

    // ========================================================================
    // 6. CREATE PLAYER GOALS (8 active, 2 completed)
    // ========================================================================

    const goals = [
      { title: 'Nå kategori A', description: 'Forbedre handicap til 4.4 eller bedre', goalType: 'score', timeframe: 'medium', status: 'in_progress', targetDate: new Date(year, 5, 1), progress: 75 },
      { title: 'Driver distance 250m+', description: 'Oppnå gjennomsnittlig carry distance over 250m', goalType: 'physical', timeframe: 'medium', status: 'in_progress', targetDate: new Date(year, 4, 15), progress: 85 },
      { title: 'Putting accuracy 85%+', description: 'Holed putts fra 1.5m - 85% eller bedre', goalType: 'technique', timeframe: 'short', status: 'completed', targetDate: weeksAgo(2), progress: 100 },
      { title: 'GIR 70%+', description: 'Greens in regulation 70% eller bedre', goalType: 'score', timeframe: 'short', status: 'completed', targetDate: weeksAgo(3), progress: 100 },
      { title: 'Vinn klubbmesterskap junior', description: 'Førsteplass i klubbmesterskap U18', goalType: 'competition', timeframe: 'long', status: 'in_progress', targetDate: new Date(year, 7, 1), progress: 50 },
      { title: 'Short game up & down 75%+', description: 'Up and down prosent over 75%', goalType: 'technique', timeframe: 'medium', status: 'in_progress', targetDate: new Date(year, 5, 1), progress: 90 },
      { title: 'Bunker proximity <3m', description: 'Gjennomsnittlig bunker proximity under 3 meter', goalType: 'technique', timeframe: 'medium', status: 'in_progress', targetDate: new Date(year, 6, 1), progress: 60 },
      { title: 'Fairway accuracy 70%+', description: 'Driver accuracy 70% eller bedre', goalType: 'score', timeframe: 'medium', status: 'in_progress', targetDate: new Date(year, 5, 15), progress: 55 },
    ];

    let goalsCreated = 0;

    for (const goal of goals) {
      const existing = await prisma.goal.findFirst({
        where: {
          userId: playerUser.id,
          title: goal.title,
        },
      });

      if (!existing) {
        await prisma.goal.create({
          data: {
            userId: playerUser.id,
            title: goal.title,
            description: goal.description,
            goalType: goal.goalType,
            timeframe: goal.timeframe,
            status: goal.status,
            startDate: weeksAgo(26), // Started 6 months ago
            targetDate: goal.targetDate,
            progressPercent: goal.progress,
          },
        });
        goalsCreated++;
      }
    }

    console.log(`   ✅ Created ${goalsCreated} player goals (${goals.filter(g => g.status === 'completed').length} completed, ${goals.filter(g => g.status === 'in_progress').length} in progress)`);

    // ========================================================================
    // SUMMARY
    // ========================================================================

    console.log('\n📊 Premium Demo Player Summary:');
    console.log('   • Navn: Andreas Holm (16 år)');
    console.log('   • Klubb: Mørj Golfklubb');
    console.log('   • Handicap: 6.2 → 3.9 (-2.3 forbedring over 6 mnd)');
    console.log(`   • Treningsøkter: ${sessionsCreated} (avg 5/uke)`);
    console.log(`   • Tester: ${testsCreated} med progressjon`);
    console.log('   • Driver distance: 210m → 242m (+32m)');
    console.log('   • Putting accuracy: 65% → 82% (+17%)');
    console.log(`   • Badges: ${badgesEarned} earned`);
    console.log(`   • Mål: ${goalsCreated} (2 fullført, 6 pågående)`);
    console.log('\n   🎯 Login: player@demo.com / player123\n');

  } catch (error) {
    console.error('❌ Error seeding premium player:', error);
    throw error;
  }
}
