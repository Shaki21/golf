/**
 * Check Demo Users Script
 * Diagnostic script to see what demo users exist
 */

import { getPrismaClient } from '../src/core/db/prisma';

const prisma = getPrismaClient();

async function main() {
  try {
    console.log('🔍 Checking for demo users...\n');

    const demoEmails = [
      'anders.kristiansen@demo.com',
      'nils.lilja@demo.com',
      'oyvind.rohjan@demo.com',
    ];

    for (const email of demoEmails) {
      const users = await prisma.user.findMany({
        where: { email },
        include: {
          player: {
            include: {
              annualPlanPeriods: true,
            },
          },
        },
      });

      console.log(`📧 ${email}:`);
      if (users.length === 0) {
        console.log('  ❌ No users found');
      } else {
        for (const user of users) {
          console.log(`  ✅ User ID: ${user.id}`);
          console.log(`     Tenant ID: ${user.tenantId}`);
          console.log(`     Name: ${user.firstName} ${user.lastName}`);
          if (user.player) {
            console.log(`     Player ID: ${user.player.id}`);
            console.log(`     Annual Plan Periods: ${user.player.annualPlanPeriods.length}`);
          } else {
            console.log(`     Player: None`);
          }
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
