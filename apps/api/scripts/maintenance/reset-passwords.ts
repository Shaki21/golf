/**
 * Reset Demo User Passwords
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetPasswords() {
  console.log('🔐 Resetting demo user passwords...\n');

  const playerPassword = await argon2.hash('player123');
  const coachPassword = await argon2.hash('coach123');

  const playerEmails = [
    'anders.kristiansen@demo.com',
    'oyvind.rohjan@demo.com',
    'nils.lilja@demo.com',
    'carl.gustavsson@demo.com',
    'caroline.diethelm@demo.com',
    'player@demo.com',
  ];

  // Reset player passwords
  for (const email of playerEmails) {
    const result = await prisma.user.updateMany({
      where: { email },
      data: { passwordHash: playerPassword },
    });
    console.log(`✅ Reset password for ${email} (${result.count} updated)`);
  }

  // Reset coach password
  const coachResult = await prisma.user.updateMany({
    where: { email: 'coach@demo.com' },
    data: { passwordHash: coachPassword },
  });
  console.log(`✅ Reset password for coach@demo.com (${coachResult.count} updated)`);

  console.log('\n✅ All passwords reset!');
  console.log('   Players: player123');
  console.log('   Coach: coach123');
}

resetPasswords()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
