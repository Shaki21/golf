import prisma from '../prisma/client';


async function main() {
  const targetDate = new Date('2025-03-30');

  const assignments = await prisma.dailyTrainingAssignment.findMany({
    where: {
      assignedDate: targetDate,
    },
    include: {
      annualPlan: {
        select: {
          id: true,
          planName: true,
          playerId: true,
        },
      },
    },
  });

  console.log(`Assignments for ${targetDate.toISOString().split('T')[0]}:`);
  console.log(`Total found: ${assignments.length}\n`);

  assignments.forEach((a, i) => {
    console.log(`${i + 1}. Session Type: ${a.sessionType}`);
    console.log(`   Plan ID: ${a.annualPlanId.substring(0, 8)}...`);
    console.log(`   Player ID: ${a.annualPlan?.playerId.substring(0, 8)}...`);
    console.log(`   Created: ${a.createdAt}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
