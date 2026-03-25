/**
 * Seed Premium Players with Comprehensive Demo Data
 *
 * Creates annual training plans with 25 hours/week for 3 demo players:
 * - Anders Kristiansen
 * - Nils Jonas Lilja
 * - Øyvind Rohjan
 *
 * Generates:
 * - Annual plans with 25 hours/week across all periods
 * - 365 days of daily training assignments
 * - 52 weeks of periodization data
 * - 6-8 weeks of historical training sessions (85-95% completion)
 * - Weekly and monthly training stats
 * - 3-5 goals per player with varied progress
 */

import prisma from '../client';

// Period dates for 2026
const PERIOD_DATES = {
  evaluation: { start: new Date('2026-01-11'), end: new Date('2026-01-18') },
  base: { start: new Date('2026-01-19'), end: new Date('2026-04-30') },
  specialization: { start: new Date('2026-05-01'), end: new Date('2026-05-25') },
  tournament: { start: new Date('2026-05-26'), end: new Date('2026-10-01') },
};

// Session types for variety
const SESSION_TYPES = ['langspill', 'kortspill', 'putting', 'fysisk', 'teknikk', 'banespill', 'simulator'];

// Learning phases
const LEARNING_PHASES = ['L1', 'L2', 'L3', 'L4', 'L5'];

// Environments (M0-M5)
const ENVIRONMENTS = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];

// Pressure levels (PR1-PR5)
const PRESSURE_LEVELS = ['PR1', 'PR2', 'PR3', 'PR4', 'PR5'];

/**
 * Helper to get a random item from array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Helper to get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Helper to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Helper to get week number from date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get period type for a given week number
 */
function getPeriodForWeek(week: number): { period: string; phase: string; hours: number } {
  if (week >= 2 && week <= 2) {
    return { period: 'E', phase: 'evaluation', hours: randomInt(20, 23) };
  } else if (week >= 3 && week <= 17) {
    return { period: 'G', phase: 'base', hours: randomInt(25, 28) };
  } else if (week >= 18 && week <= 21) {
    return { period: 'S', phase: 'specialization', hours: randomInt(22, 25) };
  } else if (week >= 22 && week <= 40) {
    // Tournament period with taper weeks
    const isTaper = week >= 38;
    return { period: 'T', phase: 'tournament', hours: isTaper ? randomInt(15, 18) : randomInt(18, 22) };
  } else {
    // Recovery/off-season
    return { period: 'E', phase: 'recovery', hours: randomInt(12, 15) };
  }
}

/**
 * Main seed function
 */
export async function seedPremiumPlayers() {
  console.log('🌱 Seeding premium players with comprehensive data...');

  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'ak-golf-academy' },
  });

  if (!tenant) {
    throw new Error('Tenant not found. Run demo-users seed first.');
  }

  const coach = await prisma.coach.findFirst({
    where: { email: 'coach@demo.com' },
  });

  if (!coach) {
    throw new Error('Coach not found. Run demo-users seed first.');
  }

  // Find the 3 premium players
  const playerEmails = [
    'anders.kristiansen@demo.com',
    'nils.lilja@demo.com',
    'oyvind.rohjan@demo.com',
  ];

  const players = await prisma.player.findMany({
    where: {
      email: { in: playerEmails },
    },
  });

  if (players.length !== 3) {
    throw new Error(`Expected 3 players, found ${players.length}. Run demo-users seed first.`);
  }

  const now = new Date();
  const yearStart = new Date('2026-01-01');
  const yearEnd = new Date('2026-12-31');

  // Process each player
  for (const player of players) {
    console.log(`\n   Processing player: ${player.firstName} ${player.lastName}`);

    // ============================================
    // 1. CREATE ANNUAL TRAINING PLAN (25 hrs/week)
    // ============================================
    let annualPlan = await prisma.annualTrainingPlan.findFirst({
      where: { playerId: player.id, startDate: yearStart },
    });

    if (!annualPlan) {
      annualPlan = await prisma.annualTrainingPlan.create({
        data: {
          playerId: player.id,
          tenantId: tenant.id,
          planName: `Årsplan 2026 - ${player.firstName} ${player.lastName}`,
          startDate: yearStart,
          endDate: yearEnd,
          status: 'active',
          baselineAverageScore: player.handicap ? 72 + Number(player.handicap) * 0.8 : 78,
          baselineHandicap: player.handicap || 5.0,
          baselineDriverSpeed: randomInt(95, 115),
          playerCategory: player.category,
          basePeriodWeeks: 15,
          specializationWeeks: 4,
          tournamentWeeks: 19,
          weeklyHoursTarget: 25, // KEY: 25 hours per week
          intensityProfile: {
            base: { volume: 'high', intensity: 'medium' },
            specialization: { volume: 'medium', intensity: 'high' },
            tournament: { volume: 'medium', intensity: 'peak' },
            evaluation: { volume: 'low', intensity: 'low' },
            recovery: { volume: 'low', intensity: 'low' },
          },
          periods: [
            { name: 'Evaluering', start: '2026-01-11', end: '2026-01-18', weeks: 1 },
            { name: 'Grunnlagsperiode', start: '2026-01-19', end: '2026-04-30', weeks: 15 },
            { name: 'Spesialiseringsperiode', start: '2026-05-01', end: '2026-05-25', weeks: 4 },
            { name: 'Turneringsperiode', start: '2026-05-26', end: '2026-10-01', weeks: 19 },
          ],
          generatedAt: now,
          generationAlgorithm: 'v2.0-premium',
          notes: `Premium player plan - 25 hours/week target. Focus on ${player.category === 'A' ? 'professional transition' : 'category advancement'}.`,
        },
      });
      console.log(`      ✅ Created annual plan (25 hrs/week)`);
    } else {
      // Update existing plan to 25 hours
      annualPlan = await prisma.annualTrainingPlan.update({
        where: { id: annualPlan.id },
        data: {
          weeklyHoursTarget: 25,
          generationAlgorithm: 'v2.0-premium',
        },
      });
      console.log(`      ✅ Updated annual plan to 25 hrs/week`);
    }

    // ============================================
    // 2. GENERATE 52 WEEKS OF PERIODIZATION
    // ============================================
    console.log(`      🗓️  Generating 52 weeks of periodization...`);

    for (let week = 1; week <= 52; week++) {
      const periodInfo = getPeriodForWeek(week);
      const weekInPeriod = week >= 3 && week <= 17 ? week - 2 :
                           week >= 18 && week <= 21 ? week - 17 :
                           week >= 22 && week <= 40 ? week - 21 :
                           week;

      const existing = await prisma.periodization.findUnique({
        where: {
          playerId_weekNumber: {
            playerId: player.id,
            weekNumber: week,
          },
        },
      });

      if (!existing) {
        await prisma.periodization.create({
          data: {
            playerId: player.id,
            weekNumber: week,
            period: periodInfo.period,
            priorityCompetition: periodInfo.period === 'T' ? 3 : periodInfo.period === 'S' ? 1 : 0,
            priorityPlay: periodInfo.period === 'T' ? 3 : periodInfo.period === 'S' ? 2 : 1,
            priorityGolfShot: periodInfo.period === 'S' ? 3 : 2,
            priorityTechnique: periodInfo.period === 'G' ? 3 : 2,
            priorityPhysical: periodInfo.period === 'G' ? 3 : 1,
            learningPhaseMin: periodInfo.period === 'G' ? 'L1' : 'L3',
            learningPhaseMax: periodInfo.period === 'T' ? 'L5' : 'L4',
            clubSpeedMin: 'CS40',
            clubSpeedMax: periodInfo.period === 'T' ? 'CS100' : 'CS80',
            plannedHours: periodInfo.hours,
            actualHours: 0,
            annualPlanId: annualPlan.id,
            periodPhase: periodInfo.phase,
            weekInPeriod: weekInPeriod,
            volumeIntensity: periodInfo.phase === 'base' ? (week % 4 === 0 ? 'low' : 'high') :
                            periodInfo.phase === 'specialization' ? 'high' :
                            periodInfo.phase === 'tournament' ? (week >= 38 ? 'taper' : 'peak') :
                            'low',
          },
        });
      }
    }
    console.log(`      ✅ Generated 52 weeks of periodization`);

    // ============================================
    // 3. GENERATE 365 DAILY TRAINING ASSIGNMENTS
    // ============================================
    console.log(`      📅 Generating 365 daily assignments...`);

    let assignmentCount = 0;
    for (let day = 0; day < 365; day++) {
      const assignedDate = addDays(yearStart, day);
      const dayOfWeek = assignedDate.getDay(); // 0 = Sunday, 6 = Saturday
      const weekNumber = getWeekNumber(assignedDate);
      const periodInfo = getPeriodForWeek(weekNumber);

      // 7-day pattern: Train 6 days, rest 1 day
      const isRestDay = dayOfWeek === 0; // Sunday rest

      if (!isRestDay) {
        // Vary session types across the week
        let sessionType: string;
        if (dayOfWeek === 1) sessionType = 'langspill'; // Monday
        else if (dayOfWeek === 2) sessionType = 'teknikk'; // Tuesday
        else if (dayOfWeek === 3) sessionType = 'kortspill'; // Wednesday
        else if (dayOfWeek === 4) sessionType = 'fysisk'; // Thursday
        else if (dayOfWeek === 5) sessionType = 'putting'; // Friday
        else sessionType = 'banespill'; // Saturday

        const existing = await prisma.dailyTrainingAssignment.findUnique({
          where: {
            annualPlanId_assignedDate_sessionType: {
              annualPlanId: annualPlan.id,
              assignedDate: assignedDate,
              sessionType: sessionType,
            },
          },
        });

        if (!existing) {
          await prisma.dailyTrainingAssignment.create({
            data: {
              annualPlanId: annualPlan.id,
              playerId: player.id,
              assignedDate: assignedDate,
              weekNumber: weekNumber,
              dayOfWeek: dayOfWeek,
              sessionType: sessionType,
              estimatedDuration: randomInt(90, 180), // 1.5 to 3 hours
              period: periodInfo.period,
              learningPhase: randomItem(LEARNING_PHASES),
              clubSpeed: `CS${randomInt(40, 100)}`,
              intensity: randomInt(2, 5),
              environment: randomItem(ENVIRONMENTS),
              pressure: randomItem(PRESSURE_LEVELS),
              isRestDay: false,
              isOptional: false,
              canBeSubstituted: true,
              status: assignedDate < now ? 'completed' : 'planned',
              sourceType: 'plan',
            },
          });
          assignmentCount++;
        }
      } else {
        // Create rest day assignment
        const existing = await prisma.dailyTrainingAssignment.findUnique({
          where: {
            annualPlanId_assignedDate_sessionType: {
              annualPlanId: annualPlan.id,
              assignedDate: assignedDate,
              sessionType: 'rest',
            },
          },
        });

        if (!existing) {
          await prisma.dailyTrainingAssignment.create({
            data: {
              annualPlanId: annualPlan.id,
              playerId: player.id,
              assignedDate: assignedDate,
              weekNumber: weekNumber,
              dayOfWeek: dayOfWeek,
              sessionType: 'rest',
              estimatedDuration: 0,
              period: periodInfo.period,
              isRestDay: true,
              isOptional: false,
              canBeSubstituted: false,
              status: assignedDate < now ? 'completed' : 'planned',
              sourceType: 'plan',
            },
          });
          assignmentCount++;
        }
      }
    }
    console.log(`      ✅ Generated ${assignmentCount} daily assignments`);

    // ============================================
    // 4. GENERATE HISTORICAL TRAINING SESSIONS (6-8 weeks)
    // ============================================
    console.log(`      🏋️  Generating historical training sessions...`);

    const weeksBack = randomInt(6, 8);
    const sessionsCreated = [];

    for (let week = 0; week < weeksBack; week++) {
      for (let day = 0; day < 6; day++) { // 6 training days per week
        const sessionDate = addDays(now, -(weeksBack * 7) + (week * 7) + day);

        // 85-95% completion rate
        if (Math.random() > 0.10) { // 90% chance to complete
          const sessionType = randomItem(SESSION_TYPES);
          const duration = randomInt(60, 180); // 1 to 3 hours

          const session = await prisma.trainingSession.create({
            data: {
              playerId: player.id,
              coachId: Math.random() > 0.7 ? coach.id : undefined, // 30% with coach
              sessionType: sessionType,
              sessionDate: sessionDate,
              duration: duration,
              learningPhase: randomItem(LEARNING_PHASES),
              clubSpeed: `CS${randomInt(40, 100)}`,
              environment: randomItem(ENVIRONMENTS),
              pressure: randomItem(PRESSURE_LEVELS),
              period: 'G', // Assume base period for historical data
              intensity: randomInt(2, 5),
              completionStatus: 'completed',
              completedAt: sessionDate,
              evaluationFocus: randomInt(6, 10),
              evaluationTechnical: randomInt(6, 10),
              evaluationEnergy: randomInt(6, 10),
              evaluationMental: randomInt(6, 10),
              preShotConsistency: Math.random() > 0.5 ? 'yes' : 'partial',
              preShotCount: randomInt(10, 50),
              totalShots: randomInt(50, 150),
              notes: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} session - good progress`,
              whatWentWell: 'Maintained focus throughout session',
              nextSessionFocus: 'Continue with current focus areas',
            },
          });

          sessionsCreated.push(session);
        }
      }
    }
    console.log(`      ✅ Generated ${sessionsCreated.length} historical sessions (~${Math.round((sessionsCreated.length / (weeksBack * 6)) * 100)}% completion)`);

    // ============================================
    // 5. CALCULATE WEEKLY TRAINING STATS (8-12 recent weeks)
    // ============================================
    console.log(`      📊 Calculating weekly training stats...`);

    const statsWeeks = randomInt(8, 12);
    let weeklyStatsCount = 0;

    for (let week = 0; week < statsWeeks; week++) {
      const weekStart = addDays(now, -(statsWeeks * 7) + (week * 7));
      const weekEnd = addDays(weekStart, 6);
      const weekNumber = getWeekNumber(weekStart);
      const year = weekStart.getFullYear();

      const sessionsInWeek = sessionsCreated.filter(s =>
        s.sessionDate >= weekStart && s.sessionDate <= weekEnd
      );

      const totalMinutes = sessionsInWeek.reduce((sum, s) => sum + s.duration, 0);
      const completedSessions = sessionsInWeek.length;
      const plannedSessions = 6; // 6 training days per week

      const existing = await prisma.weeklyTrainingStats.findUnique({
        where: {
          playerId_year_weekNumber: {
            playerId: player.id,
            year: year,
            weekNumber: weekNumber,
          },
        },
      });

      if (!existing) {
        await prisma.weeklyTrainingStats.create({
          data: {
            playerId: player.id,
            year: year,
            weekNumber: weekNumber,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            plannedSessions: plannedSessions,
            completedSessions: completedSessions,
            skippedSessions: plannedSessions - completedSessions,
            completionRate: (completedSessions / plannedSessions) * 100,
            plannedMinutes: plannedSessions * 120, // 2 hours average
            actualMinutes: totalMinutes,
            sessionTypeBreakdown: {
              langspill: randomInt(120, 240),
              kortspill: randomInt(90, 180),
              putting: randomInt(60, 120),
              fysisk: randomInt(60, 120),
              teknikk: randomInt(90, 180),
              banespill: randomInt(120, 240),
            },
            learningPhaseMinutes: {
              L1: randomInt(30, 60),
              L2: randomInt(45, 90),
              L3: randomInt(60, 120),
              L4: randomInt(90, 180),
              L5: randomInt(45, 90),
            },
            avgQuality: randomInt(70, 95) / 10,
            avgFocus: randomInt(70, 95) / 10,
            avgIntensity: randomInt(60, 90) / 10,
            currentStreak: randomInt(3, 7),
            longestStreakInWeek: randomInt(4, 7),
            period: 'G',
          },
        });
        weeklyStatsCount++;
      }
    }
    console.log(`      ✅ Generated ${weeklyStatsCount} weekly stats`);

    // ============================================
    // 6. CALCULATE MONTHLY TRAINING STATS (3-6 months)
    // ============================================
    console.log(`      📈 Calculating monthly training stats...`);

    const statsMonths = randomInt(3, 6);
    let monthlyStatsCount = 0;

    for (let month = 0; month < statsMonths; month++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
      const year = monthDate.getFullYear();
      const monthNum = monthDate.getMonth() + 1;

      const sessionsInMonth = sessionsCreated.filter(s => {
        const sYear = s.sessionDate.getFullYear();
        const sMonth = s.sessionDate.getMonth() + 1;
        return sYear === year && sMonth === monthNum;
      });

      const totalMinutes = sessionsInMonth.reduce((sum, s) => sum + s.duration, 0);
      const totalSessions = sessionsInMonth.length;
      const daysInMonth = new Date(year, monthNum, 0).getDate();

      const existing = await prisma.monthlyTrainingStats.findUnique({
        where: {
          playerId_year_month: {
            playerId: player.id,
            year: year,
            month: monthNum,
          },
        },
      });

      if (!existing && totalSessions > 0) {
        await prisma.monthlyTrainingStats.create({
          data: {
            playerId: player.id,
            year: year,
            month: monthNum,
            totalSessions: totalSessions,
            completedSessions: totalSessions,
            completionRate: 90 + randomInt(0, 10), // 90-100%
            totalMinutes: totalMinutes,
            avgMinutesPerSession: totalMinutes / totalSessions,
            avgMinutesPerDay: totalMinutes / daysInMonth,
            sessionTypeBreakdown: {
              langspill: randomInt(300, 600),
              kortspill: randomInt(200, 400),
              putting: randomInt(150, 300),
              fysisk: randomInt(150, 300),
              teknikk: randomInt(200, 400),
              banespill: randomInt(300, 600),
            },
          },
        });
        monthlyStatsCount++;
      }
    }
    console.log(`      ✅ Generated ${monthlyStatsCount} monthly stats`);

    // ============================================
    // 7. CREATE 3-5 GOALS PER PLAYER
    // ============================================
    console.log(`      🎯 Creating player goals...`);

    const numGoals = randomInt(3, 5);
    const goalTypes = ['score', 'technique', 'physical', 'mental', 'competition'];
    const timeframes = ['short', 'medium', 'long'];

    const goalData = [
      {
        title: `Improve average score to ${Math.floor(72 + Number(player.handicap || 5) * 0.6)}`,
        description: 'Lower average score through consistent ball striking and course management',
        goalType: 'score',
        timeframe: 'medium',
        targetValue: 72 + Number(player.handicap || 5) * 0.6,
        startValue: 72 + Number(player.handicap || 5) * 0.8,
        currentValue: 72 + Number(player.handicap || 5) * 0.7,
        unit: 'score',
        icon: 'Target',
        color: '#1E4B33',
        daysFromNow: randomInt(60, 180),
        progress: randomInt(30, 70),
      },
      {
        title: 'Increase driver club speed to 115 mph',
        description: 'Systematic physical training and technical improvements',
        goalType: 'physical',
        timeframe: 'long',
        targetValue: 115,
        startValue: randomInt(95, 105),
        currentValue: randomInt(100, 110),
        unit: 'mph',
        icon: 'Activity',
        color: '#DC9A0F',
        daysFromNow: randomInt(180, 365),
        progress: randomInt(20, 60),
      },
      {
        title: 'Win junior tournament',
        description: 'Compete and perform under pressure in regional tournaments',
        goalType: 'competition',
        timeframe: 'medium',
        targetValue: 1,
        startValue: 0,
        currentValue: 0,
        unit: 'wins',
        icon: 'Trophy',
        color: '#DC9A0F',
        daysFromNow: randomInt(90, 180),
        progress: randomInt(0, 30),
      },
      {
        title: 'Master putting from 8-15 feet',
        description: 'Achieve 60%+ make rate from 8-15 feet',
        goalType: 'technique',
        timeframe: 'short',
        targetValue: 60,
        startValue: 35,
        currentValue: randomInt(40, 55),
        unit: 'percent',
        icon: 'Target',
        color: '#1E4B33',
        daysFromNow: randomInt(30, 90),
        progress: randomInt(40, 80),
      },
      {
        title: 'Develop consistent pre-shot routine',
        description: 'Execute pre-shot routine on 90%+ of shots during practice and play',
        goalType: 'mental',
        timeframe: 'short',
        targetValue: 90,
        startValue: 50,
        currentValue: randomInt(65, 85),
        unit: 'percent',
        icon: 'Brain',
        color: '#0891B2',
        daysFromNow: randomInt(30, 60),
        progress: randomInt(60, 90),
      },
    ];

    const userRecord = await prisma.user.findFirst({
      where: { email: player.email },
    });

    if (userRecord) {
      let goalsCreated = 0;
      for (let i = 0; i < numGoals; i++) {
        const goal = goalData[i];
        const startDate = addDays(now, -30);
        const targetDate = addDays(now, goal.daysFromNow);

        // Check if goal already exists
        const existingGoal = await prisma.goal.findFirst({
          where: {
            userId: userRecord.id,
            title: goal.title,
          },
        });

        if (!existingGoal) {
          await prisma.goal.create({
            data: {
              userId: userRecord.id,
              title: goal.title,
              description: goal.description,
              goalType: goal.goalType,
              timeframe: goal.timeframe,
              targetValue: goal.targetValue,
              startValue: goal.startValue,
              currentValue: goal.currentValue,
              unit: goal.unit,
              progressPercent: goal.progress,
              startDate: startDate,
              targetDate: targetDate,
              status: goal.progress >= 100 ? 'completed' : goal.progress > 0 ? 'active' : 'active',
              icon: goal.icon,
              color: goal.color,
              completedDate: goal.progress >= 100 ? targetDate : undefined,
              milestones: [
                { title: '25% milestone', value: goal.targetValue! * 0.25, completed: goal.progress >= 25 },
                { title: '50% milestone', value: goal.targetValue! * 0.5, completed: goal.progress >= 50 },
                { title: '75% milestone', value: goal.targetValue! * 0.75, completed: goal.progress >= 75 },
                { title: 'Final goal', value: goal.targetValue!, completed: goal.progress >= 100 },
              ],
            },
          });
          goalsCreated++;
        }
      }
      console.log(`      ✅ Created ${goalsCreated} goals (${numGoals - goalsCreated} already existed)`);
    }

    console.log(`   ✅ Completed ${player.firstName} ${player.lastName}`);
  }

  console.log('\n✅ Premium players seeding complete!');
  console.log('   • 3 players with 25 hrs/week annual plans');
  console.log('   • 52 weeks of periodization per player');
  console.log('   • 365 daily assignments per player');
  console.log('   • 6-8 weeks of historical sessions (85-95% completion)');
  console.log('   • 8-12 weeks of weekly training stats');
  console.log('   • 3-6 months of monthly training stats');
  console.log('   • 3-5 goals per player');
}
