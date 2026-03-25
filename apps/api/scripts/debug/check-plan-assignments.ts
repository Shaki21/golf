import prisma from '../prisma/client';


async function main() {
  const planId = 'f319e268-e07e-440b-865d-83ac9e2d7d23';

  const assignments = await prisma.dailyTrainingAssignment.findMany({
    where: { annualPlanId: planId },
    orderBy: { assignedDate: 'asc' },
  });

  console.log(`Total assignments for plan: ${assignments.length}`);

  if (assignments.length > 0) {
    console.log(`Date range: ${assignments[0].assignedDate.toISOString().split('T')[0]} to ${assignments[assignments.length - 1].assignedDate.toISOString().split('T')[0]}`);

    // Check for duplicate dates
    const dateCount: Record<string, string[]> = {};
    assignments.forEach(a => {
      const key = a.assignedDate.toISOString().split('T')[0];
      if (!dateCount[key]) dateCount[key] = [];
      dateCount[key].push(a.sessionType);
    });

    const duplicates = Object.entries(dateCount).filter(([_, types]) => types.length > 1);
    if (duplicates.length > 0) {
      console.log(`\n❌ Dates with multiple assignments: ${duplicates.length}`);
      duplicates.slice(0, 10).forEach(([date, types]) => {
        console.log(`  ${date}: ${types.join(', ')}`);
      });
    } else {
      console.log('\n✅ No duplicate dates found');
    }

    // Show assignment count by date
    console.log('\nFirst 10 assignments:');
    assignments.slice(0, 10).forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.assignedDate.toISOString().split('T')[0]} - ${a.sessionType}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
