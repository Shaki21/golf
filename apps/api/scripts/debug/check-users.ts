/**
 * Check User Records
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkUsers() {
  const emails = [
    'anders.kristiansen@demo.com',
    'oyvind.rohjan@demo.com',
    'nils.lilja@demo.com',
    'coach@demo.com',
    'player@demo.com',
  ];

  console.log('=== User Records ===\n');

  for (const email of emails) {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    const player = await prisma.player.findFirst({
      where: { email },
    });

    console.log(`${email}:`);
    console.log(`  User exists: ${user ? 'YES' : 'NO'}`);
    if (user) {
      console.log(`  User tenantId: ${user.tenantId}`);
      console.log(`  User role: ${user.role}`);
    }
    console.log(`  Player exists: ${player ? 'YES' : 'NO'}`);
    if (player) {
      console.log(`  Player tenantId: ${player.tenantId}`);
      console.log(`  Player coachId: ${player.coachId}`);
    }
    console.log('');
  }
}

checkUsers()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
