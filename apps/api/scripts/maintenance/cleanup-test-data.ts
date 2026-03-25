import prisma from '../prisma/client';


async function main() {
  const playerId = 'eca38df6-4329-4c6e-9e3b-043ec8c1527e';

  console.log('🧹 Cleaning up all test data for player...\n');

  // Get all plan IDs for this player first
  const plans = await prisma.annualTrainingPlan.findMany({
    where: { playerId },
    select: { id: true },
  });

  const planIds = plans.map(p => p.id);

  // 1. Delete daily assignments
  const deletedAssignments = await prisma.dailyTrainingAssignment.deleteMany({
    where: { playerId },
  });
  console.log(`✅ Deleted ${deletedAssignments.count} daily assignments`);

  // 2. Delete scheduled tournaments
  const deletedTournaments = await prisma.scheduledTournament.deleteMany({
    where: { annualPlanId: { in: planIds } },
  });
  console.log(`✅ Deleted ${deletedTournaments.count} scheduled tournaments`);

  // 3. Delete periodizations
  const deletedPeriods = await prisma.periodization.deleteMany({
    where: { playerId },
  });
  console.log(`✅ Deleted ${deletedPeriods.count} periodization records`);

  // 4. Delete annual plans
  const deletedPlans = await prisma.annualTrainingPlan.deleteMany({
    where: { playerId },
  });
  console.log(`✅ Deleted ${deletedPlans.count} annual training plans`);

  // 5. Delete breaking points (optional - keeps player's breaking points)
  const deletedBreakingPoints = await prisma.breakingPoint.deleteMany({
    where: { playerId, autoDetected: true },
  });
  console.log(`✅ Deleted ${deletedBreakingPoints.count} auto-detected breaking points`);

  console.log('\n✨ Cleanup complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
