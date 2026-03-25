/**
 * ================================================================
 * Full Demo Data Seed Script
 * ================================================================
 *
 * Creates a complete demo environment for product demonstration:
 * - Coach: Anders Kristiansen
 * - 5 Junior Players (15-18 years old, NGF Golfklubb)
 * - Player Groups: Team NORWAY JUNIOR, WANG Toppidrett Oslo, NGF Golfklubb
 * - Special conditions: 1 injured player, 1 with sleep issues
 * - Srixon Tour tournaments
 * - Goals focused on PEI improvement
 *
 * Usage:
 *   npx ts-node scripts/seed/seed-full-demo.ts
 *   npx ts-node scripts/seed/seed-full-demo.ts --clean
 *   npx ts-node scripts/seed/seed-full-demo.ts --dry-run
 */

// Load environment variables FIRST - before any other imports
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import prisma from '../../prisma/client';
import * as argon2 from 'argon2';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEMO_PASSWORD = 'Demo2026!';
const TENANT_SLUG = 'tier-demo';
const TENANT_NAME = 'TIER Golf Demo';

// Coach configuration
const COACH_CONFIG = {
  email: 'anders.kristiansen@tiergolf.com',
  firstName: 'Anders',
  lastName: 'Kristiansen',
  phone: '+47 900 11 222',
  specializations: ['Junior Development', 'Tournament Preparation', 'Mental Training', 'Technique Analysis'],
  certifications: ['PGA Professional', 'NGF Level 3 Coach', 'Team Norway Junior Coach'],
};

// Player configurations
const PLAYERS_CONFIG = [
  {
    email: 'oyvind.rohjan@tiergolf.com',
    firstName: 'Øyvind',
    lastName: 'Rohjan',
    age: 17,
    category: 'C',
    handicap: 4.2,
    gender: 'male',
    status: 'normal',
    focusArea: 'Full swing, competition',
    notes: 'Strong competitor, consistent performer',
  },
  {
    email: 'nils.lilja@tiergolf.com',
    firstName: 'Nils Jonas',
    lastName: 'Lilja',
    age: 16,
    category: 'C',
    handicap: 5.8,
    gender: 'male',
    status: 'injured',
    injuryDetails: {
      type: 'Shoulder strain (right shoulder)',
      startDate: daysAgo(10),
      expectedReturn: daysAgo(-14), // 2 weeks from now
      restrictions: 'No full swing. Light wedge work and putting only.',
      rehab: 'Physical therapy 3x/week, ice after sessions',
    },
    focusArea: 'Technique, putting (modified due to injury)',
    notes: 'Currently injured - shoulder strain. Focus on putting and recovery.',
  },
  {
    email: 'anders.thelberg@tiergolf.com',
    firstName: 'Anders',
    lastName: 'Thelberg',
    age: 15,
    category: 'D',
    handicap: 7.1,
    gender: 'male',
    status: 'normal',
    focusArea: 'Short game, technique fundamentals',
    notes: 'Youngest in the group, strong work ethic, technique focus',
  },
  {
    email: 'carl.gustavsson@tiergolf.com',
    firstName: 'Carl Johan',
    lastName: 'Gustavsson',
    age: 17,
    category: 'D',
    handicap: 8.4,
    gender: 'male',
    status: 'sleep_issues',
    sleepDetails: {
      condition: 'Poor sleep quality, chronic fatigue',
      duration: 'Ongoing for 3 weeks',
      impact: 'Reduced training intensity, shorter sessions',
      management: 'No evening sessions, sleep tracking, reduced volume',
    },
    focusArea: 'All-around development (modified due to fatigue)',
    notes: 'Struggling with sleep. Monitor energy levels closely.',
  },
  {
    email: 'henning.jensen@tiergolf.com',
    firstName: 'Henning',
    lastName: 'Jensen',
    age: 18,
    category: 'C',
    handicap: 5.5,
    gender: 'male',
    status: 'normal',
    focusArea: 'Iron play, scoring',
    notes: 'Oldest player, strong iron game, preparing for senior competition',
  },
];

// Srixon Tour Tournament names (for future implementation)
// Tournament seeding would use Event/Tournament models
// Upcoming: Srixon Tour #1-4 (Jan-Apr 2026)
// Historical: Srixon Tour #6-8 (Sep-Nov 2025)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function daysAgo(days: number, hour: number = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function weeksAgo(weeks: number): Date {
  return daysAgo(weeks * 7);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomDecimal(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function getDateOfBirth(age: number): Date {
  const today = new Date();
  return new Date(today.getFullYear() - age, randomInt(0, 11), randomInt(1, 28));
}

// ============================================================================
// PARSE ARGUMENTS
// ============================================================================

interface SeedOptions {
  clean: boolean;
  dryRun: boolean;
}

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  return {
    clean: args.includes('--clean'),
    dryRun: args.includes('--dry-run'),
  };
}

// ============================================================================
// CLEAN EXISTING DEMO DATA
// ============================================================================

async function cleanDemoData() {
  console.log('🧹 Cleaning existing demo data...\n');

  // Find demo tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) {
    console.log('   ⚠️  No demo tenant found, skipping cleanup');
    return;
  }

  // Find all demo players
  const players = await prisma.player.findMany({
    where: { tenantId: tenant.id },
  });

  const playerIds = players.map(p => p.id);

  if (playerIds.length > 0) {
    // Delete in correct order (foreign key constraints)

    // Training data
    await prisma.trainingSession.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted training sessions');

    await prisma.dailyTrainingAssignment.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted daily assignments');

    await prisma.periodization.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted periodizations');

    await prisma.annualTrainingPlan.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted annual plans');

    // Stats
    await prisma.weeklyTrainingStats.deleteMany({ where: { playerId: { in: playerIds } } });
    await prisma.monthlyTrainingStats.deleteMany({ where: { playerId: { in: playerIds } } });
    await prisma.dailyTrainingStats.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted training stats');

    // Test results
    await prisma.testResult.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted test results');

    // Badges
    await prisma.playerBadge.deleteMany({ where: { playerId: { in: playerIds } } });
    console.log('   ✅ Deleted badges');

    // Goals (via user)
    const userIds = players.filter(p => p.userId).map(p => p.userId!);
    if (userIds.length > 0) {
      await prisma.goal.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.playerGoal.deleteMany({ where: { playerId: { in: playerIds } } });
      console.log('   ✅ Deleted goals');
    }

    // Players
    await prisma.player.deleteMany({ where: { tenantId: tenant.id } });
    console.log('   ✅ Deleted players');
  }

  // Delete coach
  await prisma.availability.deleteMany({
    where: { coach: { tenantId: tenant.id } }
  });
  await prisma.coach.deleteMany({ where: { tenantId: tenant.id } });
  console.log('   ✅ Deleted coach and availability');

  // Delete users
  await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
  console.log('   ✅ Deleted users');

  // Delete tenant
  await prisma.tenant.delete({ where: { id: tenant.id } });
  console.log('   ✅ Deleted tenant');

  console.log('\n   ✨ Cleanup complete!\n');
}

// ============================================================================
// SEED TENANT
// ============================================================================

async function seedTenant() {
  console.log('🏢 Creating demo tenant...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      name: TENANT_NAME,
      slug: TENANT_SLUG,
      subscriptionTier: 'premium',
      maxPlayers: 50,
      maxCoaches: 10,
      status: 'active',
    },
  });

  console.log(`   ✅ Tenant: ${tenant.name} (${tenant.slug})`);
  return tenant;
}

// ============================================================================
// SEED COACH
// ============================================================================

async function seedCoach(tenantId: string) {
  console.log('\n👨‍🏫 Creating coach: Anders Kristiansen...');

  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  // Create user
  const user = await prisma.user.upsert({
    where: { email: COACH_CONFIG.email },
    update: {},
    create: {
      tenantId,
      email: COACH_CONFIG.email,
      passwordHash,
      firstName: COACH_CONFIG.firstName,
      lastName: COACH_CONFIG.lastName,
      role: 'coach',
      isActive: true,
    },
  });

  // Create or update coach profile
  let coach = await prisma.coach.findFirst({
    where: { email: COACH_CONFIG.email },
  });

  if (coach) {
    coach = await prisma.coach.update({
      where: { id: coach.id },
      data: {
        userId: user.id,
        firstName: COACH_CONFIG.firstName,
        lastName: COACH_CONFIG.lastName,
      },
    });
  } else {
    coach = await prisma.coach.create({
      data: {
        tenantId,
        userId: user.id,
        firstName: COACH_CONFIG.firstName,
        lastName: COACH_CONFIG.lastName,
        email: COACH_CONFIG.email,
        phone: COACH_CONFIG.phone,
        specializations: COACH_CONFIG.specializations,
        certifications: COACH_CONFIG.certifications,
        workingHours: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '09:00', end: '14:00' },
        },
        status: 'active',
      },
    });
  }

  // Create availability
  const availabilitySlots = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
    { dayOfWeek: 1, startTime: '13:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '12:00' },
    { dayOfWeek: 2, startTime: '13:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '12:00' },
    { dayOfWeek: 3, startTime: '13:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '12:00' },
    { dayOfWeek: 4, startTime: '13:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' },
    { dayOfWeek: 5, startTime: '13:00', endTime: '18:00' },
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00' },
  ];

  await prisma.availability.deleteMany({ where: { coachId: coach.id } });

  for (const slot of availabilitySlots) {
    await prisma.availability.create({
      data: {
        coachId: coach.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotDuration: 60,
        maxBookings: 4,
        validFrom: new Date(),
        isActive: true,
      },
    });
  }

  console.log(`   ✅ Coach: ${coach.firstName} ${coach.lastName}`);
  console.log(`   ✅ Email: ${coach.email}`);
  console.log(`   ✅ Availability: Mon-Sat`);

  return coach;
}

// ============================================================================
// SEED PLAYERS
// ============================================================================

async function seedPlayers(tenantId: string, coachId: string) {
  console.log('\n⛳ Creating 5 junior players...');

  const passwordHash = await argon2.hash(DEMO_PASSWORD);
  const players: any[] = [];

  for (const config of PLAYERS_CONFIG) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: config.email },
      update: {},
      create: {
        tenantId,
        email: config.email,
        passwordHash,
        firstName: config.firstName,
        lastName: config.lastName,
        role: 'player',
        isActive: true,
      },
    });

    // Build medical notes based on status
    let medicalNotes = null;
    if (config.status === 'injured') {
      const injury = (config as any).injuryDetails;
      medicalNotes = `INJURY: ${injury.type}\nRestrictions: ${injury.restrictions}\nRehab: ${injury.rehab}`;
    } else if (config.status === 'sleep_issues') {
      const sleep = (config as any).sleepDetails;
      medicalNotes = `SLEEP ISSUES: ${sleep.condition}\nDuration: ${sleep.duration}\nManagement: ${sleep.management}`;
    }

    // Create or update player profile
    let player = await prisma.player.findFirst({
      where: { email: config.email },
    });

    if (player) {
      player = await prisma.player.update({
        where: { id: player.id },
        data: {
          userId: user.id,
          coachId,
          firstName: config.firstName,
          lastName: config.lastName,
          category: config.category,
          handicap: config.handicap,
        },
      });
    } else {
      player = await prisma.player.create({
        data: {
          tenantId,
          userId: user.id,
          coachId,
          firstName: config.firstName,
          lastName: config.lastName,
          email: config.email,
          dateOfBirth: getDateOfBirth(config.age),
          gender: config.gender,
          category: config.category,
          handicap: config.handicap,
          club: 'NGF Golfklubb',
          status: 'active',
          weeklyTrainingHours: config.status === 'sleep_issues' ? 8 : 12,
          goals: [
            'Team NORWAY JUNIOR',
            'WANG Toppidrett Oslo',
            'Improve PEI to 6% for approach 100-150m',
          ],
          medicalNotes,
          emergencyContact: {
            name: `Parent of ${config.firstName}`,
            phone: '+47 ' + randomInt(900, 999) + ' ' + randomInt(10, 99) + ' ' + randomInt(100, 999),
          },
        },
      });
    }

    players.push({ ...player, config });

    const statusLabel = config.status === 'injured' ? ' [INJURED]' :
                        config.status === 'sleep_issues' ? ' [SLEEP ISSUES]' : '';
    console.log(`   ✅ ${config.firstName} ${config.lastName} (${config.age}y, Cat ${config.category}, HCP ${config.handicap})${statusLabel}`);
  }

  return players;
}

// ============================================================================
// SEED ANNUAL PLANS & PERIODIZATION
// ============================================================================

async function seedAnnualPlans(tenantId: string, players: any[]) {
  console.log('\n📅 Creating annual training plans...');

  const year = 2026;
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  for (const player of players) {
    // Create annual plan
    const plan = await prisma.annualTrainingPlan.create({
      data: {
        playerId: player.id,
        tenantId,
        planName: `Training Plan 2026 - ${player.firstName} ${player.lastName}`,
        startDate: yearStart,
        endDate: yearEnd,
        status: 'active',
        baselineAverageScore: 78 + randomInt(0, 10),
        baselineHandicap: (parseFloat(String(player.handicap)) + randomDecimal(0, 2)).toFixed(1),
        baselineDriverSpeed: 85 + randomInt(0, 15),
        playerCategory: player.category,
        basePeriodWeeks: 8,
        specializationWeeks: 24,
        tournamentWeeks: 16,
        weeklyHoursTarget: player.config.status === 'sleep_issues' ? 8 : 12,
        intensityProfile: {
          base: { volume: 'high', intensity: 'medium' },
          specialization: { volume: 'medium', intensity: 'high' },
          tournament: { volume: 'medium', intensity: 'peak' },
        },
        generatedAt: new Date(),
        generationAlgorithm: 'v2.0',
        notes: player.config.notes,
      },
    });

    // Create 52 weeks of periodization
    const periods = ['E', 'E', 'G', 'G', 'G', 'G', 'S', 'S', 'S', 'S', 'S', 'S', 'T', 'T', 'T', 'T'];

    for (let week = 1; week <= 52; week++) {
      const periodIndex = Math.min(Math.floor((week - 1) / 4), periods.length - 1);
      const period = periods[periodIndex];

      await prisma.periodization.create({
        data: {
          playerId: player.id,
          annualPlanId: plan.id,
          weekNumber: week,
          period,
          priorityCompetition: period === 'T' ? 3 : period === 'S' ? 2 : 1,
          priorityPlay: period === 'T' ? 3 : 2,
          priorityGolfShot: period === 'S' || period === 'T' ? 3 : 2,
          priorityTechnique: period === 'G' ? 3 : period === 'E' ? 2 : 1,
          priorityPhysical: period === 'E' ? 3 : 2,
          learningPhaseMin: 'L-BODY',
          learningPhaseMax: period === 'T' ? 'L-AUTO' : 'L-BALL',
          clubSpeedMin: 'CS40',
          clubSpeedMax: period === 'T' ? 'CS100' : 'CS80',
          plannedHours: player.config.status === 'sleep_issues' ? 8 : 12,
        },
      });
    }

    console.log(`   ✅ Plan created for ${player.firstName} ${player.lastName} (52 weeks)`);
  }
}

// ============================================================================
// SEED TRAINING SESSIONS
// ============================================================================

async function seedTrainingSessions(players: any[], coachId: string) {
  console.log('\n🏌️ Creating training sessions...');

  const sessionTypes = [
    { type: 'teknikk', focusAreas: ['INN100', 'INN150', 'Driver', 'Wedge'] },
    { type: 'golfslag', focusAreas: ['Short game', 'Approach', 'Bunker'] },
    { type: 'spill', focusAreas: ['Course management', 'Strategy', 'Competition'] },
    { type: 'fysisk', focusAreas: ['Strength', 'Mobility', 'Power'] },
    { type: 'mental', focusAreas: ['Visualization', 'Focus', 'Pre-shot routine'] },
  ];

  const learningPhases = ['L-BODY', 'L-ARM', 'L-CLUB', 'L-BALL', 'L-AUTO'];

  for (const player of players) {
    let sessionsCreated = 0;

    // Determine session patterns based on player status
    const isInjured = player.config.status === 'injured';
    const hasSleepIssues = player.config.status === 'sleep_issues';

    // Past 2 weeks: completed sessions
    for (let day = 14; day >= 1; day--) {
      // Skip some days randomly (70-90% attendance)
      if (Math.random() > (isInjured ? 0.5 : hasSleepIssues ? 0.7 : 0.85)) continue;

      // Skip weekends occasionally
      const sessionDate = daysAgo(day);
      if (sessionDate.getDay() === 0 && Math.random() > 0.3) continue;

      const sessionType = isInjured
        ? randomChoice([sessionTypes[4], { type: 'teknikk', focusAreas: ['Putting', 'Chipping'] }])
        : randomChoice(sessionTypes);

      const focusArea = randomChoice(sessionType.focusAreas);
      const duration = hasSleepIssues
        ? randomInt(30, 60)
        : sessionType.type === 'spill'
          ? randomInt(120, 180)
          : randomInt(60, 90);

      await prisma.trainingSession.create({
        data: {
          playerId: player.id,
          coachId: day % 3 === 0 ? coachId : null,
          sessionType: sessionType.type,
          sessionDate,
          duration,
          focusArea,
          period: 'G',
          intensity: hasSleepIssues ? randomInt(1, 3) : randomInt(2, 5),
          learningPhase: isInjured ? 'L-CLUB' : randomChoice(learningPhases),
          clubSpeed: isInjured ? 'CS0' : `CS${randomInt(4, 8)}0`,
          completionStatus: 'completed',
          evaluationFocus: randomInt(6, 10),
          evaluationTechnical: randomInt(5, 9),
          evaluationEnergy: hasSleepIssues ? randomInt(3, 6) : randomInt(6, 9),
          evaluationMental: randomInt(6, 9),
          notes: isInjured
            ? 'Modified session due to injury - no full swing'
            : hasSleepIssues
              ? 'Shorter session - monitoring energy levels'
              : `${focusArea} focus session`,
        },
      });
      sessionsCreated++;
    }

    // Current week: mix of completed and planned
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Completed sessions this week (before today)
    for (let d = dayOfWeek - 1; d >= 1; d--) {
      if (Math.random() > 0.8) continue;

      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - (dayOfWeek - d));
      sessionDate.setHours(10, 0, 0, 0);

      const sessionType = isInjured
        ? randomChoice([sessionTypes[4], { type: 'teknikk', focusAreas: ['Putting'] }])
        : randomChoice(sessionTypes);

      await prisma.trainingSession.create({
        data: {
          playerId: player.id,
          coachId: Math.random() > 0.5 ? coachId : null,
          sessionType: sessionType.type,
          sessionDate,
          duration: hasSleepIssues ? randomInt(45, 60) : randomInt(60, 90),
          focusArea: randomChoice(sessionType.focusAreas),
          period: 'G',
          intensity: randomInt(3, 5),
          learningPhase: randomChoice(learningPhases),
          clubSpeed: isInjured ? 'CS0' : `CS${randomInt(5, 8)}0`,
          completionStatus: 'completed',
          evaluationFocus: randomInt(6, 9),
          evaluationTechnical: randomInt(6, 9),
          evaluationEnergy: hasSleepIssues ? randomInt(4, 7) : randomInt(7, 9),
          evaluationMental: randomInt(6, 9),
        },
      });
      sessionsCreated++;
    }

    // Today: in-progress session (for live demo)
    if (!isInjured || Math.random() > 0.5) {
      await prisma.trainingSession.create({
        data: {
          playerId: player.id,
          coachId,
          sessionType: isInjured ? 'mental' : 'teknikk',
          sessionDate: new Date(),
          duration: 60,
          focusArea: isInjured ? 'Visualization' : 'INN100',
          period: 'G',
          intensity: 3,
          learningPhase: 'L-BALL',
          clubSpeed: isInjured ? 'CS0' : 'CS60',
          completionStatus: 'in_progress',
          notes: 'Current session - in progress',
        },
      });
      sessionsCreated++;
    }

    // Future sessions (rest of week + next 2 weeks)
    for (let day = 1; day <= 14; day++) {
      if (Math.random() > 0.7) continue;

      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + day);
      if (sessionDate.getDay() === 0) continue; // Skip Sundays

      const sessionType = isInjured && day < 14
        ? randomChoice([sessionTypes[4], { type: 'fysisk', focusAreas: ['Rehab', 'Mobility'] }])
        : randomChoice(sessionTypes);

      await prisma.trainingSession.create({
        data: {
          playerId: player.id,
          coachId: day % 2 === 0 ? coachId : null,
          sessionType: sessionType.type,
          sessionDate,
          duration: hasSleepIssues ? 60 : 90,
          focusArea: randomChoice(sessionType.focusAreas),
          period: 'G',
          learningPhase: randomChoice(learningPhases),
          completionStatus: 'planned',
        },
      });
      sessionsCreated++;
    }

    console.log(`   ✅ ${player.firstName}: ${sessionsCreated} sessions`);
  }
}

// ============================================================================
// SEED GOALS
// ============================================================================

async function seedGoals(players: any[]) {
  console.log('\n🎯 Creating goals (PEI focus)...');

  for (const player of players) {
    const userId = player.userId;
    const isInjured = player.config.status === 'injured';
    const hasSleepIssues = player.config.status === 'sleep_issues';

    // Primary goal for all: PEI improvement
    const goals = [
      {
        title: 'Improve PEI to 6% for Approach 100-150m',
        description: 'Achieve 6% PEI on course training for approach shots from 100-150 meters',
        goalType: 'technique',
        timeframe: 'medium',
        targetValue: 6,
        currentValue: randomDecimal(8, 12),
        startValue: randomDecimal(10, 14),
        unit: '%',
        status: 'active',
        progressPercent: randomInt(30, 60),
      },
      {
        title: 'Lower handicap by 1.5 strokes',
        description: `Reduce handicap from ${player.handicap} to ${(player.handicap - 1.5).toFixed(1)}`,
        goalType: 'score',
        timeframe: 'medium',
        targetValue: player.handicap - 1.5,
        currentValue: player.handicap - randomDecimal(0, 0.8),
        startValue: player.handicap,
        unit: 'HCP',
        status: 'active',
        progressPercent: randomInt(20, 50),
      },
      {
        title: 'Top 5 finish in Srixon Tour',
        description: 'Achieve a top 5 placement in any Srixon Tour event this season',
        goalType: 'competition',
        timeframe: 'long',
        status: 'active',
        progressPercent: 0,
      },
      {
        title: 'Consistent strike pattern with 7-iron',
        description: 'Develop consistent ball striking with 7-iron approach shots',
        goalType: 'technique',
        timeframe: 'short',
        status: 'active',
        progressPercent: randomInt(40, 70),
      },
    ];

    // Add special goals for injured/sleep issues players
    if (isInjured) {
      goals.push({
        title: 'Complete shoulder rehab program',
        description: 'Full recovery from shoulder strain with PT clearance',
        goalType: 'physical',
        timeframe: 'short',
        status: 'active',
        progressPercent: randomInt(30, 50),
      });
      goals.push({
        title: 'Return to full swing training',
        description: 'Resume full swing practice after injury recovery',
        goalType: 'technique',
        timeframe: 'short',
        status: 'active',
        progressPercent: randomInt(20, 40),
      });
    }

    if (hasSleepIssues) {
      goals.push({
        title: 'Establish consistent sleep routine',
        description: 'Achieve 7-8 hours quality sleep consistently',
        goalType: 'mental',
        timeframe: 'short',
        status: 'active',
        progressPercent: randomInt(20, 45),
      });
      goals.push({
        title: 'Track and improve energy levels',
        description: 'Monitor energy during sessions and maintain above 6/10',
        goalType: 'physical',
        timeframe: 'short',
        status: 'active',
        progressPercent: randomInt(30, 50),
      });
    }

    for (const goal of goals) {
      await prisma.goal.create({
        data: {
          userId,
          title: goal.title,
          description: goal.description,
          goalType: goal.goalType,
          timeframe: goal.timeframe,
          targetValue: (goal as any).targetValue,
          currentValue: (goal as any).currentValue,
          startValue: (goal as any).startValue,
          unit: (goal as any).unit,
          status: goal.status,
          startDate: weeksAgo(4),
          targetDate: new Date(2026, 5, 1),
          progressPercent: goal.progressPercent,
        },
      });
    }

    console.log(`   ✅ ${player.firstName}: ${goals.length} goals`);
  }
}

// ============================================================================
// SEED TEST RESULTS
// ============================================================================

async function seedTestResults(tenantId: string, players: any[]) {
  console.log('\n📊 Creating test results...');

  // Get available tests
  const tests = await prisma.test.findMany({
    where: { tenantId },
    take: 10,
  });

  if (tests.length === 0) {
    console.log('   ⚠️  No tests found, skipping test results');
    return;
  }

  for (const player of players) {
    let resultsCreated = 0;

    // Create 2-3 test results per player over past 2 months
    for (const test of tests.slice(0, randomInt(2, 4))) {
      for (let weeksBack = 8; weeksBack >= 2; weeksBack -= randomInt(2, 4)) {
        const testDate = weeksAgo(weeksBack);

        // Skip some tests for injured player
        if (player.config.status === 'injured' &&
            (test.name?.toLowerCase().includes('driver') || test.name?.toLowerCase().includes('speed'))) {
          continue;
        }

        await prisma.testResult.create({
          data: {
            playerId: player.id,
            testId: test.id,
            testDate,
            value: randomDecimal(60, 95),
            results: {
              attempts: [randomInt(60, 90), randomInt(65, 95), randomInt(70, 92)],
              average: randomDecimal(65, 90),
            },
            passed: Math.random() > 0.3,
          },
        });
        resultsCreated++;
      }
    }

    console.log(`   ✅ ${player.firstName}: ${resultsCreated} test results`);
  }
}

// ============================================================================
// SEED WEEKLY STATS
// ============================================================================

async function seedWeeklyStats(players: any[]) {
  console.log('\n📈 Creating weekly training stats...');

  for (const player of players) {
    const hasSleepIssues = player.config.status === 'sleep_issues';
    const isInjured = player.config.status === 'injured';

    // Create 8 weeks of stats
    for (let week = 8; week >= 1; week--) {
      const weekStartDate = weeksAgo(week);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      const baseCompleted = hasSleepIssues ? 3 : isInjured ? 2 : 5;
      const basePlanned = hasSleepIssues ? 4 : isInjured ? 4 : 6;
      const completed = baseCompleted + randomInt(-1, 1);
      const planned = basePlanned;

      await prisma.weeklyTrainingStats.create({
        data: {
          playerId: player.id,
          weekStartDate,
          weekEndDate,
          weekNumber: 52 - week + 1,
          year: 2026,
          completedSessions: completed,
          plannedSessions: planned,
          skippedSessions: Math.max(0, planned - completed),
          completionRate: planned > 0 ? (completed / planned) * 100 : 0,
          plannedMinutes: planned * randomInt(50, 80),
          actualMinutes: completed * randomInt(50, 80),
        },
      });
    }

    console.log(`   ✅ ${player.firstName}: 8 weeks of stats`);
  }
}

// ============================================================================
// SEED CHAT GROUPS & MESSAGES
// ============================================================================

async function seedMessages(_tenantId: string, _coachId: string, _players: any[]) {
  console.log('\n💬 Creating chat groups and messages...');

  // This would require ChatGroup and ChatMessage models
  // For now, we'll skip this and note it needs implementation
  console.log('   ⚠️  Chat functionality requires ChatGroup/ChatMessage models');
}

// ============================================================================
// SEED ACHIEVEMENTS
// ============================================================================

async function seedAchievements(players: any[]) {
  console.log('\n🏆 Creating achievements and badges...');

  const badgeIds = [
    'first_session',
    'sessions_10',
    'sessions_25',
    'streak_7',
    'goal_setter',
    'test_complete',
  ];

  for (const player of players) {
    let badgesCreated = 0;

    // Award 3-5 random badges per player
    const playerBadges = badgeIds.slice(0, randomInt(3, 5));

    for (const badgeId of playerBadges) {
      try {
        await prisma.playerBadge.create({
          data: {
            playerId: player.id,
            badgeId,
            earnedAt: weeksAgo(randomInt(1, 8)),
            progress: 100,
          },
        });
        badgesCreated++;
      } catch (e) {
        // Badge might already exist
      }
    }

    console.log(`   ✅ ${player.firstName}: ${badgesCreated} badges`);
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  const options = parseArgs();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           TIER Golf - Full Demo Data Seed                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
    console.log('Would create:');
    console.log('  • 1 Tenant: TIER Golf Demo');
    console.log('  • 1 Coach: Anders Kristiansen');
    console.log('  • 5 Players (junior, 15-18 years old)');
    console.log('  • 5 Annual training plans');
    console.log('  • 260 Periodization records (52 weeks × 5 players)');
    console.log('  • ~100 Training sessions');
    console.log('  • ~25 Goals');
    console.log('  • ~50 Test results');
    console.log('  • ~40 Weekly stats');
    console.log('  • ~25 Badges');
    console.log('\nRun without --dry-run to execute.');
    return;
  }

  try {
    // Step 1: Clean existing data (if --clean flag)
    if (options.clean) {
      await cleanDemoData();
    }

    // Step 2: Create tenant
    const tenant = await seedTenant();

    // Step 3: Create coach
    const coach = await seedCoach(tenant.id);

    // Step 4: Create players
    const players = await seedPlayers(tenant.id, coach.id);

    // Step 5: Create annual plans and periodization
    await seedAnnualPlans(tenant.id, players);

    // Step 6: Create training sessions
    await seedTrainingSessions(players, coach.id);

    // Step 7: Create goals
    await seedGoals(players);

    // Step 8: Create test results
    await seedTestResults(tenant.id, players);

    // Step 9: Create weekly stats
    await seedWeeklyStats(players);

    // Step 10: Create achievements
    await seedAchievements(players);

    // Step 11: Messages (if models exist)
    await seedMessages(tenant.id, coach.id, players);

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    DEMO DATA COMPLETE                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📋 Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ Role     │ Email                              │ Password   │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log(`│ Coach    │ ${COACH_CONFIG.email.padEnd(35)}│ ${DEMO_PASSWORD.padEnd(10)}│`);
    for (const p of PLAYERS_CONFIG) {
      console.log(`│ Player   │ ${p.email.padEnd(35)}│ ${DEMO_PASSWORD.padEnd(10)}│`);
    }
    console.log('└─────────────────────────────────────────────────────────────┘');

    console.log('\n🚀 Next steps:');
    console.log('   1. Start API: cd apps/api && npm run dev');
    console.log('   2. Start Web: cd apps/web && npm start');
    console.log('   3. Login as coach: anders.kristiansen@tiergolf.com');
    console.log('   4. View players and training data in dashboard\n');

  } catch (error) {
    console.error('\n❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => {
    console.log('✅ Demo seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Demo seed failed:', error);
    process.exit(1);
  });
