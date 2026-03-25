import prisma from '../prisma/client';


async function main() {
  const playerId = 'eca38df6-4329-4c6e-9e3b-043ec8c1527e';

  // Get all periods for this player
  const periods = await prisma.periodization.findMany({
    where: { playerId },
    select: {
      id: true,
      weekNumber: true,
      annualPlanId: true,
    },
    orderBy: { weekNumber: 'asc' },
  });

  console.log(`Total periods: ${periods.length}\n`);

  // Show first 3 periods with full UUID
  console.log('First 3 periods:');
  periods.slice(0, 3).forEach(p => {
    console.log(`  Week ${p.weekNumber}: annualPlanId = ${p.annualPlanId}`);
  });

  // Get unique annualPlanIds
  const uniquePlanIds = [...new Set(periods.map(p => p.annualPlanId))];
  console.log(`\nUnique annualPlanIds: ${uniquePlanIds.length}`);
  uniquePlanIds.forEach(id => {
    const count = periods.filter(p => p.annualPlanId === id).length;
    console.log(`  ${id}: ${count} weeks`);
  });

  // Get all annual plans for this player
  const plans = await prisma.annualTrainingPlan.findMany({
    where: { playerId },
    select: { id: true, planName: true, createdAt: true },
  });

  console.log(`\nAnnual plans for player: ${plans.length}`);
  plans.forEach(plan => {
    console.log(`  ${plan.id}`);
    console.log(`    Name: ${plan.planName}`);
    console.log(`    Created: ${plan.createdAt}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
