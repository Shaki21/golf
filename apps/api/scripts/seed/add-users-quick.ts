/**
 * Quick Add Users Script
 * Add new users to existing tenant
 */

import prisma from '../prisma/client';
import { disconnectPrisma } from '../prisma/client';
import * as argon2 from 'argon2';

async function addUsers() {
  console.log('🌱 Adding new users...\n');

  try {
    // Get tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'ak-golf-academy' },
    });

    if (!tenant) {
      throw new Error('Tenant not found. Run seed script first.');
    }

    // Get coach for assignment
    const coach = await prisma.coach.findFirst({
      where: { email: 'coach@demo.com' },
    });

    // Hash password (all demo users use same password for simplicity)
    const playerPassword = await argon2.hash('player123');
    const coachPassword = await argon2.hash('coach123');

    // ============================================================
    // ADD NEW PLAYERS HERE
    // ============================================================
    const newPlayers = [
      {
        email: 'emma.johnsen@demo.com',
        firstName: 'Emma',
        lastName: 'Johnsen',
        dateOfBirth: new Date('2006-05-20'),
        category: 'B',
        handicap: 3.5,
        gender: 'female',
        phone: '+47 955 77 889',
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
      },
      {
        email: 'martin.berg@demo.com',
        firstName: 'Martin',
        lastName: 'Berg',
        dateOfBirth: new Date('2005-09-12'),
        category: 'A',
        handicap: 1.8,
        gender: 'male',
        phone: '+47 966 88 990',
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
      },
    ];

    for (const playerData of newPlayers) {
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { email: playerData.email },
      });

      if (existingUser) {
        console.log(`   ⚠️  User ${playerData.email} already exists, skipping...`);
        continue;
      }

      // Create User
      const playerUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: playerData.email,
          passwordHash: playerPassword,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          role: 'player',
          isActive: true,
        },
      });

      // Create Player Profile
      const player = await prisma.player.create({
        data: {
          tenantId: tenant.id,
          userId: playerUser.id,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          email: playerData.email,
          dateOfBirth: playerData.dateOfBirth,
          gender: playerData.gender as any,
          phone: playerData.phone,
          category: playerData.category as any,
          handicap: playerData.handicap,
          club: playerData.club,
          coachId: coach?.id,
          status: 'active',
        },
      });

      console.log(`   ✅ Created player: ${playerData.email} (${playerData.firstName} ${playerData.lastName})`);
    }

    // ============================================================
    // ADD NEW COACHES HERE
    // ============================================================
    const newCoaches = [
      {
        email: 'erik.hansen@demo.com',
        firstName: 'Erik',
        lastName: 'Hansen',
        phone: '+47 911 22 334',
        specializations: ['Putting', 'Short Game', 'Course Management'],
        certifications: ['PGA Professional', 'Level 2 Golf Coach'],
      },
    ];

    for (const coachData of newCoaches) {
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { email: coachData.email },
      });

      if (existingUser) {
        console.log(`   ⚠️  User ${coachData.email} already exists, skipping...`);
        continue;
      }

      // Create User
      const coachUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: coachData.email,
          passwordHash: coachPassword,
          firstName: coachData.firstName,
          lastName: coachData.lastName,
          role: 'coach',
          isActive: true,
        },
      });

      // Create Coach Profile
      const newCoach = await prisma.coach.create({
        data: {
          tenantId: tenant.id,
          userId: coachUser.id,
          firstName: coachData.firstName,
          lastName: coachData.lastName,
          email: coachData.email,
          phone: coachData.phone,
          specializations: coachData.specializations,
          certifications: coachData.certifications,
        },
      });

      console.log(`   ✅ Created coach: ${coachData.email} (${coachData.firstName} ${coachData.lastName})`);
    }

    console.log('\n✅ All users added successfully!\n');
    console.log('📊 New Users:');
    console.log('   Players (password: player123):');
    newPlayers.forEach(p => console.log(`     - ${p.email} (${p.firstName} ${p.lastName})`));
    console.log('   Coaches (password: coach123):');
    newCoaches.forEach(c => console.log(`     - ${c.email} (${c.firstName} ${c.lastName})`));

  } catch (error) {
    console.error('❌ Error adding users:', error);
    throw error;
  }
}

addUsers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma(prisma);
  });
