/**
 * Seed Demo Players Script
 * Creates 3 demo players with full onboarding data and annual plans
 *
 * Usage:
 *   npx tsx scripts/seed-demo-players.ts
 *   npx tsx scripts/seed-demo-players.ts --clean (to delete first)
 */

import { getPrismaClient } from '../src/core/db/prisma';
import { DemoPlayerService } from '../src/services/demo/DemoPlayerService';
import { AnnualPlanGenerator } from '../src/services/demo/AnnualPlanGenerator';

const prisma = getPrismaClient();

async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldClean = args.includes('--clean');

    console.log('🚀 Starting demo player seeding process...\n');

    // Find default tenant
    const tenant = await prisma.tenant.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!tenant) {
      console.error('❌ No tenant found. Please create a tenant first.');
      process.exit(1);
    }

    console.log(`📍 Using tenant: ${tenant.name} (${tenant.id})\n`);

    // Clean existing demo players if requested
    if (shouldClean) {
      console.log('🧹 Cleaning existing demo players...');
      await DemoPlayerService.deleteAllDemoPlayers(tenant.id);
      console.log('✅ Cleanup complete\n');
    }

    // Create demo players
    console.log('👥 Creating demo players...');
    const players = await DemoPlayerService.createAllDemoPlayers(tenant.id);
    console.log(`✅ Created ${players.length} demo players\n`);

    // Generate annual plans for each player
    console.log('📅 Generating annual plans...');
    for (const { player } of players) {
      try {
        await AnnualPlanGenerator.generateStandardAnnualPlan(player.id, 25);
        console.log(`✅ Generated annual plan for ${player.firstName} ${player.lastName}`);
      } catch (error) {
        console.error(`❌ Failed to generate plan for ${player.firstName}:`, error);
      }
    }

    console.log('\n🎉 Demo player seeding complete!\n');
    console.log('Demo Players Created:');
    for (const { user, player } of players) {
      console.log(`  - ${player.firstName} ${player.lastName}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Password: Demo123!`);
      console.log(`    Handicap: ${player.handicap}`);
      console.log(`    Average Score: ${player.averageScore}`);
      console.log(`    Target: Category ${player.targetCategory}`);
      console.log();
    }

    console.log('Annual Plans:');
    for (const { player } of players) {
      const summary = await AnnualPlanGenerator.getAnnualPlanSummary(player.id);
      console.log(`\n  ${player.firstName} ${player.lastName}:`);
      for (const period of summary) {
        console.log(
          `    ${period.type}: ${period.startDate.toISOString().split('T')[0]} - ${period.endDate.toISOString().split('T')[0]} (${period.weeklyHours}h/week)`
        );
      }
    }

    console.log('\n✨ You can now log in with any of the demo accounts!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
