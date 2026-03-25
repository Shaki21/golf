/**
 * Fix Player Assignments
 *
 * Updates all demo players to:
 * 1. Be on the same tenant as the coach
 * 2. Be assigned to the coach
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixPlayerAssignments() {
  console.log('🔧 Fixing player assignments...\n');

  // Find the coach
  const coach = await prisma.coach.findFirst({
    where: { email: 'coach@demo.com' },
  });

  if (!coach) {
    console.error('❌ Coach not found!');
    process.exit(1);
  }

  console.log(`Found coach: ${coach.firstName} ${coach.lastName}`);
  console.log(`Coach ID: ${coach.id}`);
  console.log(`Coach Tenant: ${coach.tenantId}\n`);

  // Find all demo players
  const playerEmails = [
    'anders.kristiansen@demo.com',
    'oyvind.rohjan@demo.com',
    'nils.lilja@demo.com',
    'carl.gustavsson@demo.com',
    'caroline.diethelm@demo.com',
    'player@demo.com',
  ];

  // Update each player
  for (const email of playerEmails) {
    const player = await prisma.player.findFirst({
      where: { email },
    });

    if (player) {
      // Update player with correct tenant and coach
      await prisma.player.update({
        where: { id: player.id },
        data: {
          tenantId: coach.tenantId,
          coachId: coach.id,
        },
      });

      // Also update the corresponding user
      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            tenantId: coach.tenantId,
          },
        });
      }

      console.log(`✅ Updated ${player.firstName} ${player.lastName}`);
      console.log(`   Tenant: ${coach.tenantId}`);
      console.log(`   Coach: ${coach.id}\n`);
    } else {
      console.log(`⚠️  Player not found: ${email}`);
    }
  }

  console.log('✅ All players updated!');
}

fixPlayerAssignments()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
