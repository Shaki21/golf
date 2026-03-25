/**
 * Test Script: Training Plan Generation
 * Creates test data and generates a 12-month training plan
 */

import prisma from '../prisma/client';
import { PlanGenerationService } from '../src/domain/training-plan/plan-generation.service';
import { ClubSpeedCalibrationService } from '../src/domain/calibration/club-speed-calibration.service';
import { BreakingPointAutoCreationService } from '../src/domain/breaking-points/auto-creation.service';


async function main() {
  console.log('🧪 Starting Training Plan Test...\n');

  // 1. Find or create test tenant
  console.log('1️⃣  Setting up test tenant...');
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'Test Golf Academy' },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Test Golf Academy',
        slug: 'test-golf-academy',
        status: 'active',
      },
    });
    console.log(`   ✅ Created test tenant: ${tenant.id}`);
  } else {
    console.log(`   ✅ Using existing tenant: ${tenant.id}`);
  }

  // 2. Find or create test player
  console.log('\n2️⃣  Setting up test player...');
  let player = await prisma.player.findFirst({
    where: {
      tenantId: tenant.id,
      email: 'test.player@example.com',
    },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        tenantId: tenant.id,
        email: 'test.player@example.com',
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'male',
        category: 'A1',
        phone: '+4712345678',
        handicap: 10.5,
        status: 'active',
      },
    });
    console.log(`   ✅ Created test player: ${player.id}`);
  } else {
    console.log(`   ✅ Using existing player: ${player.id}`);
  }

  // 3. Create club speed calibration
  console.log('\n3️⃣  Creating club speed calibration...');

  // Delete existing calibration if any
  await prisma.clubSpeedCalibration.deleteMany({
    where: { playerId: player.id },
  });

  const calibrationInput = {
    playerId: player.id,
    calibrationDate: new Date(),
    clubs: [
      { clubType: 'driver' as const, shot1Speed: 105, shot2Speed: 107, shot3Speed: 106 },
      { clubType: '5iron' as const, shot1Speed: 82, shot2Speed: 83, shot3Speed: 81 },
      { clubType: '7iron' as const, shot1Speed: 75, shot2Speed: 76, shot3Speed: 74 },
      { clubType: 'pw' as const, shot1Speed: 68, shot2Speed: 69, shot3Speed: 67 },
    ],
    notes: 'Test calibration for training plan generation',
  };

  const validation = ClubSpeedCalibrationService.validateInput(calibrationInput);
  if (!validation.valid) {
    console.error('   ❌ Calibration validation failed:', validation.errors);
    throw new Error('Calibration validation failed');
  }

  const calibrationResult = ClubSpeedCalibrationService.processCalibration(calibrationInput);

  const calibration = await prisma.clubSpeedCalibration.create({
    data: {
      playerId: player.id,
      tenantId: tenant.id,
      calibrationDate: calibrationResult.calibration.calibrationDate,
      driverSpeed: calibrationResult.calibration.driverSpeed,
      clubsData: calibrationResult.calibration.clubs as any,
      speedProfile: calibrationResult.speedProfile as any,
      notes: calibrationInput.notes,
    },
  });

  console.log(`   ✅ Created calibration: ${calibration.id}`);
  console.log(`   📊 Driver speed: ${calibrationResult.calibration.driverSpeed} mph`);
  console.log(`   📊 Speed profile:`, JSON.stringify(calibrationResult.speedProfile, null, 2));

  // 4. Auto-create breaking points from calibration
  console.log('\n4️⃣  Auto-creating breaking points...');

  const clubSpeedLevel = await BreakingPointAutoCreationService.mapDriverSpeedToCSLevel(
    calibrationResult.calibration.driverSpeed
  );
  console.log(`   📊 Club speed level: ${clubSpeedLevel}`);

  const breakingPointResult = await BreakingPointAutoCreationService.createFromCalibration({
    playerId: player.id,
    tenantId: tenant.id,
    calibrationId: calibration.id,
    speedProfile: calibrationResult.speedProfile,
    driverSpeed: calibrationResult.calibration.driverSpeed,
    clubSpeedLevel,
  });

  console.log(`   ✅ Created ${breakingPointResult.created} breaking points`);
  breakingPointResult.breakingPoints.forEach((bp, i) => {
    console.log(`   ${i + 1}. ${bp.clubType}: ${bp.deviationPercent.toFixed(1)}% deviation (${bp.severity})`);
  });

  // 5. Delete existing training plans for clean test
  console.log('\n5️⃣  Cleaning up existing plans...');

  // Get all plan IDs first
  const existingPlans = await prisma.annualTrainingPlan.findMany({
    where: { playerId: player.id },
    select: { id: true },
  });
  const planIds = existingPlans.map(p => p.id);

  // Delete in correct order to respect foreign keys
  if (planIds.length > 0) {
    // Delete daily assignments first
    const deletedAssignments = await prisma.dailyTrainingAssignment.deleteMany({
      where: { annualPlanId: { in: planIds } },
    });
    console.log(`   ✅ Deleted ${deletedAssignments.count} daily assignments`);

    // Delete scheduled tournaments
    const deletedTournaments = await prisma.scheduledTournament.deleteMany({
      where: { annualPlanId: { in: planIds } },
    });
    console.log(`   ✅ Deleted ${deletedTournaments.count} scheduled tournaments`);
  }

  // Delete periodization records for this player
  const deletedPeriods = await prisma.periodization.deleteMany({
    where: { playerId: player.id },
  });
  console.log(`   ✅ Deleted ${deletedPeriods.count} periodization records`);

  // Delete annual plans
  const deleted = await prisma.annualTrainingPlan.deleteMany({
    where: { playerId: player.id },
  });
  console.log(`   ✅ Deleted ${deleted.count} annual training plans`);

  // 6. Generate 12-month training plan
  console.log('\n6️⃣  Generating 12-month training plan...');

  const planInput = {
    playerId: player.id,
    tenantId: tenant.id,
    startDate: new Date('2025-01-06'), // Start on Monday
    baselineAverageScore: 78.5, // Intermediate level player
    baselineHandicap: 10.5,
    baselineDriverSpeed: calibrationResult.calibration.driverSpeed,
    planName: 'Test Player - 2025 Training Plan',
    weeklyHoursTarget: 15,
    tournaments: [
      {
        name: 'Spring Championship',
        startDate: new Date('2025-04-15'),
        endDate: new Date('2025-04-17'),
        importance: 'A' as const,
      },
      {
        name: 'Summer Cup',
        startDate: new Date('2025-07-10'),
        endDate: new Date('2025-07-12'),
        importance: 'B' as const,
      },
    ],
    preferredTrainingDays: [1, 2, 3, 4, 5, 6], // Monday-Saturday
  };

  console.log('   ⏳ Generating plan (this may take a moment)...');
  const startTime = Date.now();

  const planResult = await PlanGenerationService.generateAnnualPlan(planInput);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`   ✅ Plan generated in ${duration}s`);
  console.log(`\n📋 Plan Summary:`);
  console.log(`   Plan ID: ${planResult.annualPlan.id}`);
  console.log(`   Player Category: ${planResult.annualPlan.playerCategory}`);
  console.log(`   Start Date: ${planResult.annualPlan.startDate.toISOString().split('T')[0]}`);
  console.log(`   End Date: ${planResult.annualPlan.endDate.toISOString().split('T')[0]}`);
  console.log(`   Base Period: ${planResult.annualPlan.basePeriodWeeks} weeks`);
  console.log(`   Specialization: ${planResult.annualPlan.specializationWeeks} weeks`);
  console.log(`   Tournament: ${planResult.annualPlan.tournamentWeeks} weeks`);
  console.log(`\n📊 Generated Content:`);
  console.log(`   Periodizations: ${planResult.periodizations.created} weeks`);
  console.log(`   Daily Assignments: ${planResult.dailyAssignments.created} days`);
  console.log(`   Tournaments: ${planResult.tournaments.scheduled}`);
  console.log(`   Linked Breaking Points: ${planResult.breakingPoints.linked}`);
  console.log(`\n📈 Assignments by Type:`);
  Object.entries(planResult.dailyAssignments.sessionsByType).forEach(([type, count]) => {
    const percentage = ((count / planResult.dailyAssignments.created) * 100).toFixed(1);
    console.log(`   ${type}: ${count} (${percentage}%)`);
  });

  // 7. Verify data integrity
  console.log('\n7️⃣  Verifying data integrity...');

  const verifyPlan = await prisma.annualTrainingPlan.findUnique({
    where: { id: planResult.annualPlan.id },
    include: {
      _count: {
        select: {
          dailyAssignments: true,
          scheduledTournaments: true,
          periodizations: true,
        },
      },
    },
  });

  if (verifyPlan) {
    console.log(`   ✅ Plan exists in database`);
    console.log(`   ✅ ${verifyPlan._count.dailyAssignments} daily assignments`);
    console.log(`   ✅ ${verifyPlan._count.scheduledTournaments} tournaments`);
    console.log(`   ✅ ${verifyPlan._count.periodizations} periodizations`);
  }

  // 8. Sample daily assignments
  console.log('\n8️⃣  Sample daily assignments (first week)...');
  const sampleAssignments = await prisma.dailyTrainingAssignment.findMany({
    where: {
      annualPlanId: planResult.annualPlan.id,
      weekNumber: 1,
    },
    orderBy: { assignedDate: 'asc' },
  });

  sampleAssignments.forEach((assignment) => {
    const date = assignment.assignedDate.toISOString().split('T')[0];
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][assignment.dayOfWeek];
    const duration = assignment.estimatedDuration;
    const type = assignment.sessionType;
    const status = assignment.isRestDay ? '🛌 Rest' : `🏌️ ${type} (${duration}min)`;
    console.log(`   ${day} ${date}: ${status}`);
  });

  console.log('\n✅ Test completed successfully!\n');
  console.log('🎯 Next steps:');
  console.log('   1. Review the generated plan in the database');
  console.log('   2. Test the API endpoints with this data');
  console.log('   3. Create session templates for better assignment selection');
  console.log('   4. Add analytics and progress tracking\n');
}

main()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
