/**
 * Force Delete Demo Users Script
 * Deletes demo users from ALL tenants
 */

import { getPrismaClient } from '../src/core/db/prisma';

const prisma = getPrismaClient();

async function main() {
  try {
    console.log('🗑️  Force deleting demo users from all tenants...\n');

    const demoEmails = [
      'anders.kristiansen@demo.com',
      'nils.lilja@demo.com',
      'oyvind.rohjan@demo.com',
    ];

    for (const email of demoEmails) {
      try {
        // Find all users with this email across ALL tenants
        const users = await prisma.user.findMany({
          where: { email },
          include: { player: true },
        });

        if (users.length === 0) {
          console.log(`❌ No user found with email: ${email}`);
          continue;
        }

        for (const user of users) {
          console.log(`\n📧 Deleting ${email} (Tenant: ${user.tenantId})...`);

          if (user.player) {
            // Delete annual plan periods first
            const deletedPeriods = await prisma.annualPlanPeriod.deleteMany({
              where: { playerId: user.player.id },
            });
            console.log(`   ✅ Deleted ${deletedPeriods.count} annual plan periods`);

            // Delete player
            await prisma.player.delete({
              where: { id: user.player.id },
            });
            console.log(`   ✅ Deleted player ${user.player.id}`);
          }

          // Delete user
          await prisma.user.delete({ where: { id: user.id } });
          console.log(`   ✅ Deleted user ${user.id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete ${email}:`, error);
      }
    }

    console.log('\n✨ Force deletion complete!');
  } catch (error) {
    console.error('❌ Error:', error);
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
