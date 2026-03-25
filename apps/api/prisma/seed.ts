/**
 * Main Prisma Seed File
 * Seeds all initial data for the database
 */

import prisma, { disconnectPrisma } from './client';
import { seedCategoryRequirements } from './seeds/category-requirements';
import { seedSpeedCategoryMappings } from './seeds/speed-category-mappings';
import { seedSessionTemplates } from './seeds/session-templates';
import { seedWeekTemplates } from './seeds/week-templates';
import { seedDemoUsers } from './seeds/demo-users';
import { seedExercises } from './seeds/exercises';
import { seedTests } from './seeds/tests';
import { seedEventsAndTournaments } from './seeds/events-tournaments';
import { seedTrainingPlan } from './seeds/training-plan';
import { seedSkole } from './seeds/skole';
import { seedTrainingSessions } from './seeds/training-sessions';
import { seedDataGolfPlayers } from './seeds/datagolf-players';
import { seedPremiumPlayers } from './seeds/seed-premium-players';

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Seed demo users (tenant, admin, coach, player) - MUST RUN FIRST
    await seedDemoUsers();

    // 2. Seed reference data
    await seedCategoryRequirements();
    await seedSpeedCategoryMappings();
    await seedSessionTemplates();
    await seedWeekTemplates();

    // 3. Seed exercises (øvelser)
    await seedExercises();

    // 4. Seed tests and test results
    await seedTests();

    // 5. Seed events and tournaments
    await seedEventsAndTournaments();

    // 6. Seed training plans (annual plan, periodization, daily assignments)
    await seedTrainingPlan();

    // 7. Seed skole (fag, skoletimer, oppgaver)
    await seedSkole();

    // 8. Seed training sessions and stats
    await seedTrainingSessions();

    // 9. Seed DataGolf pro players (for comparison feature)
    await seedDataGolfPlayers();

    // 10. Seed premium players with comprehensive data (25 hrs/week)
    await seedPremiumPlayers();

    console.log('\n✅ All seeds completed successfully!');
    console.log('\n📊 Summary of seeded data:');
    console.log('   • Demo users (admin, coach, player)');
    console.log('   • Category requirements (440 entries)');
    console.log('   • Speed category mappings');
    console.log('   • Session templates (14 templates)');
    console.log('   • Week plan templates (88 templates)');
    console.log('   • Golf exercises (300 exercises)');
    console.log('   • Test protocols (20 tests) + sample results');
    console.log('   • Events, samlinger, and tournaments');
    console.log('   • Annual training plan with periodization');
    console.log('   • Daily training assignments (4 weeks)');
    console.log('   • School schedule (fag, timer, oppgaver)');
    console.log('   • Training sessions (30 days history)');
    console.log('   • Weekly and monthly training stats');
    console.log('   • DataGolf pro players (30 players)');
    console.log('   • Premium players (3 players with 25 hrs/week plans)');
    console.log('   • 365 daily assignments per premium player');
    console.log('   • 52 weeks periodization per premium player');
    console.log('   • Historical sessions and comprehensive stats');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma(prisma);
  });
