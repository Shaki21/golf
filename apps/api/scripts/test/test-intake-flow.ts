/**
 * Test script for Intake Form → Training Plan Generation flow
 *
 * This script demonstrates the complete workflow:
 * 1. Submit player intake form (can be done in multiple steps)
 * 2. Validate completion
 * 3. Generate training plan from completed intake
 *
 * Usage: npx tsx scripts/test-intake-flow.ts
 */

import prisma from '../prisma/client';
import { IntakeProcessingService } from '../src/domain/intake/intake-processing.service';
import type { PlayerIntakeForm } from '../src/domain/intake/intake.types';


async function main() {
  console.log('🏌️ Testing Intake Form → Training Plan Generation Flow\n');

  // Step 1: Get or create test tenant and player
  console.log('📝 Step 1: Setting up test tenant...');

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
    console.log(`   ✅ Created test tenant: ${tenant.name}`);
  } else {
    console.log(`   ✅ Using existing tenant: ${tenant.name}`);
  }

  console.log('\n📝 Step 2: Setting up test player...');

  // Find or create test player
  let player = await prisma.player.findFirst({
    where: {
      email: 'intake-test@example.com',
      tenantId: tenant.id,
    },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        email: 'intake-test@example.com',
        firstName: 'Test',
        lastName: 'Intake Player',
        tenantId: tenant.id,
        averageScore: 78.5,
        handicap: 8.2,
      },
    });
    console.log(`✅ Created test player: ${player.firstName} ${player.lastName} (${player.email})`);
  } else {
    console.log(`✅ Using existing player: ${player.firstName} ${player.lastName} (${player.email})`);
  }

  // Step 3: Submit intake form (progressive submission)
  console.log('\n📝 Step 3: Submitting intake form sections...');

  // First submission - just background
  const partialSubmit1 = await IntakeProcessingService.submitIntake(player.id, tenant.id, {
    background: {
      yearsPlaying: 10,
      currentHandicap: 8.2,
      averageScore: 78.5,
      roundsPerYear: 40,
      trainingHistory: 'sporadic',
    },
  } as Partial<PlayerIntakeForm>);

  console.log(
    `   Partial submission 1: ${partialSubmit1.completionPercentage}% complete (${partialSubmit1.isComplete ? 'Complete' : 'Incomplete'})`
  );

  // Second submission - add availability and goals
  const partialSubmit2 = await IntakeProcessingService.submitIntake(player.id, tenant.id, {
    background: {
      yearsPlaying: 10,
      currentHandicap: 8.2,
      averageScore: 78.5,
      roundsPerYear: 40,
      trainingHistory: 'sporadic',
    },
    availability: {
      hoursPerWeek: 12,
      preferredDays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
      canTravelToFacility: true,
      hasHomeEquipment: true,
      seasonalAvailability: {
        summer: 15,
        winter: 10,
      },
    },
    goals: {
      primaryGoal: 'lower_handicap',
      targetHandicap: 5.0,
      targetScore: 75.0,
      timeframe: '12_months',
      tournaments: [
        {
          name: 'Klubbmesterskap 2025',
          date: new Date('2025-08-15'),
          importance: 'major',
          targetPlacement: 'Top 5',
        },
        {
          name: 'Regionsturneringen',
          date: new Date('2025-09-20'),
          importance: 'important',
        },
      ],
      specificFocus: ['driver_accuracy', 'putting_consistency'],
    },
  } as Partial<PlayerIntakeForm>);

  console.log(
    `   Partial submission 2: ${partialSubmit2.completionPercentage}% complete (${partialSubmit2.isComplete ? 'Complete' : 'Incomplete'})`
  );

  // Final submission - complete all required sections
  const completeIntake = await IntakeProcessingService.submitIntake(player.id, tenant.id, {
    background: {
      yearsPlaying: 10,
      currentHandicap: 8.2,
      averageScore: 78.5,
      roundsPerYear: 40,
      trainingHistory: 'sporadic',
    },
    availability: {
      hoursPerWeek: 12,
      preferredDays: [1, 3, 5, 6],
      canTravelToFacility: true,
      hasHomeEquipment: true,
      seasonalAvailability: {
        summer: 15,
        winter: 10,
      },
    },
    goals: {
      primaryGoal: 'lower_handicap',
      targetHandicap: 5.0,
      targetScore: 75.0,
      timeframe: '12_months',
      tournaments: [
        {
          name: 'Klubbmesterskap 2025',
          date: new Date('2025-08-15'),
          importance: 'major',
          targetPlacement: 'Top 5',
        },
        {
          name: 'Regionsturneringen',
          date: new Date('2025-09-20'),
          importance: 'important',
        },
      ],
      specificFocus: ['driver_accuracy', 'putting_consistency'],
    },
    weaknesses: {
      biggestFrustration: 'Inconsistent driver - sometimes 30 yards left or right',
      problemAreas: ['driver_accuracy', 'putting_distance', 'course_management'],
      mentalChallenges: ['pressure_situations', 'confidence'],
      physicalLimitations: [
        {
          area: 'back',
          severity: 'mild',
          affectsSwing: false,
        },
      ],
    },
    health: {
      currentInjuries: [],
      injuryHistory: [
        {
          type: 'Lower back strain',
          dateOccurred: new Date('2024-05-10'),
          resolved: true,
          requiresModification: false,
          affectedAreas: ['Rotation'],
        },
      ],
      chronicConditions: [],
      mobilityIssues: [],
      ageGroup: '35-45',
    },
    lifestyle: {
      workSchedule: 'regular_hours',
      stressLevel: 3,
      sleepQuality: 4,
      nutritionFocus: true,
      physicalActivity: 'moderate',
    },
    equipment: {
      hasDriverSpeedMeasurement: true,
      driverSpeed: 102,
      recentClubFitting: true,
      accessToTrackMan: true,
      accessToGym: true,
      willingToInvest: 'moderate',
    },
    learning: {
      preferredStyle: 'visual',
      wantsDetailedExplanations: true,
      prefersStructure: true,
      motivationType: 'personal_growth',
    },
  } as Partial<PlayerIntakeForm>);

  console.log(
    `   ✅ Complete submission: ${completeIntake.completionPercentage}% complete (${completeIntake.isComplete ? 'Complete' : 'Incomplete'})`
  );

  // Step 4: Retrieve and validate intake
  console.log('\n📋 Step 4: Validating intake data...');
  const retrievedIntake = await IntakeProcessingService.getPlayerIntake(player.id);

  if (!retrievedIntake) {
    console.error('❌ Failed to retrieve intake');
    process.exit(1);
  }

  console.log(`   Player Category: I1 (based on avg score ${retrievedIntake.background.averageScore})`);
  console.log(`   Weekly Hours: ${retrievedIntake.availability.hoursPerWeek}h/week`);
  console.log(`   Primary Goal: ${retrievedIntake.goals.primaryGoal}`);
  console.log(`   Tournaments: ${retrievedIntake.goals.tournaments?.length || 0}`);
  console.log(`   Biggest Frustration: "${retrievedIntake.weaknesses.biggestFrustration}"`);

  // Step 5: Generate training plan from intake
  console.log('\n🏋️ Step 5: Generating 12-month training plan...');

  try {
    const planResult = await IntakeProcessingService.generatePlanFromIntake(completeIntake.id);

    console.log('\n✅ Training Plan Generated Successfully!\n');
    console.log('📊 Plan Summary:');
    console.log(`   Plan Name: ${planResult.annualPlan.planName}`);
    console.log(`   Start Date: ${planResult.annualPlan.startDate.toISOString().split('T')[0]}`);
    console.log(`   End Date: ${planResult.annualPlan.endDate.toISOString().split('T')[0]}`);
    console.log(`   Player Category: ${planResult.annualPlan.playerCategory}`);
    console.log(`   Weekly Hours Target: ${planResult.annualPlan.weeklyHoursTarget}h`);
    console.log(`   Total Weeks: 52`);
    console.log(`   Base Period: ${planResult.annualPlan.basePeriodWeeks} weeks`);
    console.log(`   Specialization Period: ${planResult.annualPlan.specializationWeeks} weeks`);
    console.log(`   Tournament Period: ${planResult.annualPlan.tournamentWeeks} weeks`);
    console.log(`   Total Daily Assignments: ${planResult.dailyAssignments.length}`);
    console.log(`   Scheduled Tournaments: ${planResult.tournaments.length}`);

    console.log('\n📅 Sample Daily Assignments (First 7 days):');
    planResult.dailyAssignments.slice(0, 7).forEach((assignment: any, idx: number) => {
      console.log(
        `   Day ${idx + 1} (${assignment.assignedDate.toISOString().split('T')[0]}): ${assignment.sessionType} - ${assignment.estimatedDuration}min ${assignment.isRestDay ? '[REST DAY]' : ''}`
      );
    });

    console.log('\n🏆 Tournament Schedule:');
    planResult.tournaments.forEach((tournament: any) => {
      console.log(
        `   ${tournament.name} (${tournament.startDate.toISOString().split('T')[0]}) - Importance: ${tournament.importance}`
      );
      console.log(`      Topping starts: Week ${tournament.toppingStartWeek}`);
      console.log(`      Tapering: ${tournament.taperingDurationDays} days before`);
    });

    console.log('\n📈 Periodization Breakdown:');
    const periods = planResult.periodizations;
    const ePeriod = periods.filter((p: any) => p.period === 'E');
    const gPeriod = periods.filter((p: any) => p.period === 'G');
    const sPeriod = periods.filter((p: any) => p.period === 'S');
    const tPeriod = periods.filter((p: any) => p.period === 'T');

    console.log(`   Enkelt (E): ${ePeriod.length} weeks`);
    console.log(`   Generell (G): ${gPeriod.length} weeks`);
    console.log(`   Spesifikk (S): ${sPeriod.length} weeks`);
    console.log(`   Turnering (T): ${tPeriod.length} weeks`);

    console.log('\n✅ Intake flow test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error generating plan:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
