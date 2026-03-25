/**
 * Add player Andreas Holm to database
 * Run with: DATABASE_URL="<railway-url>" npx tsx scripts/add-player-andreas.ts
 */

import prisma from '../prisma/client';
import { hashPassword } from '../src/utils/crypto';


const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_COACH_ID = '00000000-0000-0000-0000-000000000003';

async function addPlayer() {
  const playerId = crypto.randomUUID();
  const hashedPassword = await hashPassword('Demo123456');

  console.log('Creating player Andreas Holm...');
  console.log('Player ID:', playerId);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'andreas.holm@akgolf.no' },
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        id: playerId,
        email: 'andreas.holm@akgolf.no',
        passwordHash: hashedPassword,
        firstName: 'Andreas',
        lastName: 'Holm',
        role: 'player',
        tenantId: DEMO_TENANT_ID,
        isActive: true,
      },
    });

    console.log('✓ Created user:', user.email);

    // Create player profile
    const player = await prisma.player.create({
      data: {
        id: playerId,
        userId: playerId,
        tenantId: DEMO_TENANT_ID,
        handicapIndex: 12.5,
        currentCategory: 'G',
        targetCategory: 'F',
        gender: 'M',
        dateOfBirth: new Date('1990-05-15'),
        coachId: DEMO_COACH_ID,
      },
    });

    console.log('✓ Created player profile:', player.id);
    console.log('\n=== Login credentials ===');
    console.log('Email: andreas.holm@akgolf.no');
    console.log('Password: Demo123456');
    console.log('Player ID:', playerId);

  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
}

addPlayer()
  .then(() => {
    console.log('\n✅ Done!');
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error('Failed:', error);
    return prisma.$disconnect();
  });
