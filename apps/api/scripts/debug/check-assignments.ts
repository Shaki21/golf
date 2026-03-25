import prisma from '../prisma/client';


async function main() {
  const playerId = 'eca38df6-4329-4c6e-9e3b-043ec8c1527e';

  const assignments = await prisma.dailyTrainingAssignment.findMany({
    where: { playerId },
    orderBy: { assignedDate: 'asc' },
  });

  console.log(`Total assignments for player: ${assignments.length}`);

  if (assignments.length > 0) {
    console.log('\nFirst 10 assignments:');
    assignments.slice(0, 10).forEach(a => {
      console.log(`  ${a.assignedDate.toISOString().split('T')[0]} - ${a.sessionType} (Plan: ${a.annualPlanId.substring(0, 8)}...)`);
    });

    // Check for duplicates
    const groupedByDateAndType = assignments.reduce((acc, a) => {
      const key = `${a.assignedDate.toISOString().split('T')[0]}_${a.sessionType}_${a.annualPlanId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {} as Record<string, any[]>);

    const duplicates = Object.entries(groupedByDateAndType).filter(([_, arr]) => arr.length > 1);
    if (duplicates.length > 0) {
      console.log(`\n❌ Found ${duplicates.length} duplicate combinations:`);
      duplicates.slice(0, 5).forEach(([key, arr]) => {
        console.log(`  ${key}: ${arr.length} instances`);
      });
    } else {
      console.log('\n✅ No duplicates found');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
