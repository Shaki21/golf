import prisma from '../prisma/client';


async function main() {
  const planId = 'f319e268-e07e-440b-865d-83ac9e2d7d23';
  const playerId = 'eca38df6-4329-4c6e-9e3b-043ec8c1527e';

  // Check periods for this specific plan
  const periodsForPlan = await prisma.periodization.findMany({
    where: { annualPlanId: planId },
    orderBy: { weekNumber: 'asc' },
  });

  console.log(`Periods for plan ${planId.substring(0, 8)}...: ${periodsForPlan.length}`);

  // Check all periods for this player
  const periodsForPlayer = await prisma.periodization.findMany({
    where: { playerId },
    orderBy: { weekNumber: 'asc' },
  });

  console.log(`Total periods for player: ${periodsForPlayer.length}`);

  // Group by annualPlanId
  const grouped: Record<string, number> = {};
  periodsForPlayer.forEach(p => {
    const key = p.annualPlanId || 'NULL';
    grouped[key] = (grouped[key] || 0) + 1;
  });

  console.log('\nPeriods grouped by annualPlanId:');
  Object.entries(grouped).forEach(([id, count]) => {
    console.log(`  ${id === 'NULL' ? 'NULL' : id.substring(0, 8) + '...'}: ${count} weeks`);
  });

  const periods = periodsForPlan.length > 0 ? periodsForPlan : periodsForPlayer;

  console.log(`\nAnalyzing ${periods.length} periods...`);

  if (periods.length > 0) {
    console.log(`Week range: ${periods[0].weekNumber} to ${periods[periods.length - 1].weekNumber}`);

    // Check for missing weeks
    const missing: number[] = [];
    for (let i = 1; i <= 52; i++) {
      if (!periods.find(p => p.weekNumber === i)) {
        missing.push(i);
      }
    }

    if (missing.length > 0) {
      console.log(`\n❌ Missing weeks (${missing.length}):`, missing.slice(0, 10));
    } else {
      console.log('\n✅ All 52 weeks present');
    }

    // Show first few weeks
    console.log('\nFirst 5 weeks:');
    periods.slice(0, 5).forEach(p => {
      console.log(`  Week ${p.weekNumber}: ${p.period} - ${p.periodPhase}`);
    });

    // Check around week 12-13
    console.log('\nWeeks 11-14:');
    periods.filter(p => p.weekNumber >= 11 && p.weekNumber <= 14).forEach(p => {
      console.log(`  Week ${p.weekNumber}: ${p.period} - ${p.periodPhase}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
