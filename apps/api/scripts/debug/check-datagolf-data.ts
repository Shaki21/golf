import prisma from '../prisma/client';

async function main() {
  // Tour averages
  const averages = await prisma.dataGolfTourAverage.findMany();
  console.log('\nTour Averages:');
  averages.forEach(a => {
    const stats = a.stats as any;
    const tour = a.tour.toUpperCase();
    console.log(`  ${tour} ${a.season}: Avg SG Total: ${stats.avgSgTotal?.toFixed(3)}, ${stats.playerCount} players`);
  });

  // Schedules by tour
  const pgaSchedule = await prisma.dataGolfSchedule.findMany({
    where: { tour: 'pga' },
    orderBy: { startDate: 'asc' },
    take: 5,
    select: { eventName: true, startDate: true, course: true }
  });

  console.log('\nPGA Schedule (first 5):');
  pgaSchedule.forEach((e, i) => {
    const date = e.startDate.toISOString().split('T')[0];
    console.log(`  ${i+1}. ${e.eventName} (${date})`);
  });

  // Decompositions sample
  const decompSample = await prisma.dataGolfPlayerDecomposition.findMany({
    where: { dgRank: { not: null } },
    orderBy: { dgRank: 'asc' },
    take: 10,
    select: { playerName: true, dgRank: true, owgrRank: true, tour: true }
  });

  console.log('\nTop 10 Ranked Players (from decompositions):');
  decompSample.forEach((p) => {
    console.log(`  #${p.dgRank} ${p.playerName} (OWGR: ${p.owgrRank})`);
  });
}

main().finally(() => prisma.$disconnect());
