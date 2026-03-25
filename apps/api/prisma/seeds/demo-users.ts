/**
 * Seed Demo Users
 * Creates demo users for testing: admin, coach, and player
 */

import prisma from '../client';
import * as argon2 from 'argon2';


export async function seedDemoUsers() {
  console.log('🌱 Seeding demo users...');

  try {
    // Create or get tenant
    let tenant = await prisma.tenant.findFirst({
      where: { slug: 'ak-golf-academy' },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'AK Golf Academy',
          slug: 'ak-golf-academy',
          subscriptionTier: 'premium',
          maxPlayers: 100,
          maxCoaches: 20,
          status: 'active',
        },
      });
      console.log('   ✅ Created tenant: AK Golf Academy');
    }

    // Hash passwords
    const adminPassword = await argon2.hash('admin123');
    const coachPassword = await argon2.hash('coach123');
    const playerPassword = await argon2.hash('player123');

    // Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'admin@demo.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('   ✅ Created admin user: admin@demo.com / admin123');

    // Create Coach User - Jørn Johnsen
    const coachUser = await prisma.user.upsert({
      where: { email: 'coach@demo.com' },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'coach@demo.com',
        passwordHash: coachPassword,
        firstName: 'Jørn',
        lastName: 'Johnsen',
        role: 'coach',
        isActive: true,
      },
    });

    // Create Coach Profile
    let coach = await prisma.coach.findFirst({
      where: { email: 'coach@demo.com' },
    });

    if (!coach) {
      coach = await prisma.coach.create({
        data: {
          tenantId: tenant.id,
          userId: coachUser.id, // Link coach to user
          firstName: 'Jørn',
          lastName: 'Johnsen',
          email: 'coach@demo.com',
          phone: '+47 900 12 345',
          specializations: ['Driver', 'Short Game', 'Mental Training', 'Tournament Preparation'],
          certifications: ['PGA Professional', 'Team Norway Coach', 'Level 3 Golf Coach'],
          profileImageUrl: '/images/avatars/jorn-johnsen.png',
          avatar: '/images/avatars/jorn-johnsen.png',
          workingHours: {
            monday: { start: '08:00', end: '17:00' },
            tuesday: { start: '08:00', end: '17:00' },
            wednesday: { start: '08:00', end: '17:00' },
            thursday: { start: '08:00', end: '17:00' },
            friday: { start: '08:00', end: '17:00' },
          },
        },
      });
      console.log('   ✅ Created coach user: coach@demo.com / coach123 (Jørn Johnsen)');
    } else {
      // Update existing coach with new name and avatar
      await prisma.coach.update({
        where: { id: coach.id },
        data: {
          userId: coachUser.id,
          firstName: 'Jørn',
          lastName: 'Johnsen',
          phone: '+47 900 12 345',
          specializations: ['Driver', 'Short Game', 'Mental Training', 'Tournament Preparation'],
          certifications: ['PGA Professional', 'Team Norway Coach', 'Level 3 Golf Coach'],
          profileImageUrl: '/images/avatars/jorn-johnsen.png',
          avatar: '/images/avatars/jorn-johnsen.png',
        },
      });
      console.log('   ✅ Updated coach user: coach@demo.com (Jørn Johnsen)');
    }

    // Create Coach Availability - for booking system
    const today = new Date();
    const validFrom = new Date(today.getFullYear(), today.getMonth(), 1); // First of current month

    // Delete existing availability for this coach to avoid duplicates
    await prisma.availability.deleteMany({
      where: { coachId: coach.id },
    });

    // Create availability for Monday-Friday (dayOfWeek: 1-5)
    const availabilitySlots = [
      // Monday - dayOfWeek: 1
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
      { dayOfWeek: 1, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
      // Tuesday - dayOfWeek: 2
      { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
      { dayOfWeek: 2, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
      // Wednesday - dayOfWeek: 3
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
      { dayOfWeek: 3, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
      // Thursday - dayOfWeek: 4
      { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
      { dayOfWeek: 4, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
      // Friday - dayOfWeek: 5
      { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
      { dayOfWeek: 5, startTime: '14:00', endTime: '16:00', slotDuration: 60 },
      // Saturday - dayOfWeek: 6
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', slotDuration: 60 },
    ];

    for (const slot of availabilitySlots) {
      await prisma.availability.create({
        data: {
          coachId: coach.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDuration: slot.slotDuration,
          maxBookings: 1,
          validFrom: validFrom,
          isActive: true,
        },
      });
    }
    console.log('   ✅ Created coach availability (Mon-Sat, 11 time slots)');

    // Create Players - Real profiles
    // All players are members at Oslo GK, attend WANG Toppidrett Oslo, and are Team Norway Junior players
    const playersData = [
      {
        email: 'anders.kristiansen@demo.com',
        firstName: 'Anders',
        lastName: 'Kristiansen',
        dateOfBirth: new Date('2004-03-15'),
        phone: '+47 911 22 334',
        category: 'A',
        handicap: 2.1,
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
        gender: 'male',
        goals: ['Team Norway Junior', 'Become professional', 'Win junior championship'],
        emergencyContact: {
          name: 'Kari Kristiansen',
          phone: '+47 911 22 333',
          email: 'kari.kristiansen@example.com',
        },
        profileImageUrl: '/avatars/anders-kristiansen.jpg',
      },
      {
        email: 'oyvind.rohjan@demo.com',
        firstName: 'Øyvind',
        lastName: 'Rohjan',
        dateOfBirth: new Date('2005-07-22'),
        phone: '+47 922 33 445',
        category: 'B',
        handicap: 4.8,
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
        gender: 'male',
        goals: ['Team Norway Junior', 'Reach Category A', 'Improve driver accuracy'],
        emergencyContact: {
          name: 'Per Rohjan',
          phone: '+47 922 33 444',
          email: 'per.rohjan@example.com',
        },
      },
      {
        email: 'nils.lilja@demo.com',
        firstName: 'Nils Jonas',
        lastName: 'Lilja',
        dateOfBirth: new Date('2006-01-10'),
        phone: '+47 933 44 556',
        category: 'B',
        handicap: 5.2,
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
        gender: 'male',
        goals: ['Team Norway Junior', 'Consistent ball striking', 'Improve putting'],
        emergencyContact: {
          name: 'Anna Lilja',
          phone: '+47 933 44 555',
          email: 'anna.lilja@example.com',
        },
      },
      {
        email: 'carl.gustavsson@demo.com',
        firstName: 'Carl Johan',
        lastName: 'Gustavsson',
        dateOfBirth: new Date('2005-11-05'),
        phone: '+47 944 55 667',
        category: 'C',
        handicap: 8.5,
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
        gender: 'male',
        goals: ['Team Norway Junior', 'Break 80 consistently', 'Improve fitness'],
        emergencyContact: {
          name: 'Johan Gustavsson',
          phone: '+47 944 55 666',
          email: 'johan.gustavsson@example.com',
        },
      },
      {
        email: 'caroline.diethelm@demo.com',
        firstName: 'Caroline',
        lastName: 'Diethelm',
        dateOfBirth: new Date('2004-09-18'),
        phone: '+47 955 66 778',
        category: 'A',
        handicap: 3.2,
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
        gender: 'female',
        goals: ['Team Norway Junior', 'Qualify for national team', 'Improve iron play'],
        emergencyContact: {
          name: 'Maria Diethelm',
          phone: '+47 955 66 777',
          email: 'maria.diethelm@example.com',
        },
      },
      {
        email: 'player@demo.com',
        firstName: 'Demo',
        lastName: 'Player',
        dateOfBirth: new Date('2005-06-15'),
        phone: '+47 987 65 432',
        category: 'B',
        handicap: 5.4,
        club: 'Oslo GK',
        school: 'WANG Toppidrett Oslo',
        gender: 'male',
        goals: ['Team Norway Junior', 'Reach Category A', 'Improve driver distance'],
        emergencyContact: {
          name: 'Demo Contact',
          phone: '+47 999 88 777',
          email: 'demo.contact@example.com',
        },
      },
    ];

    const players = [];

    for (const playerData of playersData) {
      // Create User
      const playerUser = await prisma.user.upsert({
        where: { email: playerData.email },
        update: {},
        create: {
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
      let player = await prisma.player.findFirst({
        where: { email: playerData.email },
      });

      if (!player) {
        player = await prisma.player.create({
          data: {
            tenantId: tenant.id,
            userId: playerUser.id,
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            email: playerData.email,
            dateOfBirth: playerData.dateOfBirth,
            gender: playerData.gender,
            phone: playerData.phone,
            category: playerData.category,
            handicap: playerData.handicap,
            club: playerData.club,
            goals: playerData.goals,
            emergencyContact: playerData.emergencyContact,
            coachId: coach.id, // Assign Jørn Johnsen as coach
            profileImageUrl: (playerData as any).profileImageUrl || null,
          },
        });
        console.log(`   ✅ Created player: ${playerData.email} (${playerData.firstName} ${playerData.lastName})`);
      } else {
        // Update existing player
        await prisma.player.update({
          where: { id: player.id },
          data: {
            userId: playerUser.id,
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            dateOfBirth: playerData.dateOfBirth,
            gender: playerData.gender,
            phone: playerData.phone,
            category: playerData.category,
            handicap: playerData.handicap,
            club: playerData.club,
            goals: playerData.goals,
            emergencyContact: playerData.emergencyContact,
            coachId: coach.id,
            profileImageUrl: (playerData as any).profileImageUrl || null,
          },
        });
        console.log(`   ✅ Updated player: ${playerData.email} (${playerData.firstName} ${playerData.lastName})`);
      }

      players.push(player);
    }

    console.log('\n📊 Demo Users Summary:');
    console.log('   • Admin: admin@demo.com / admin123');
    console.log('   • Coach: coach@demo.com / coach123 (Jørn Johnsen)');
    console.log('   • Players (all use password: player123):');
    console.log('     - anders.kristiansen@demo.com (Anders Kristiansen)');
    console.log('     - oyvind.rohjan@demo.com (Øyvind Rohjan)');
    console.log('     - nils.lilja@demo.com (Nils Jonas Lilja)');
    console.log('     - carl.gustavsson@demo.com (Carl Johan Gustavsson)');
    console.log('     - caroline.diethelm@demo.com (Caroline Diethelm)');
    console.log('     - player@demo.com (Demo Player)');

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    throw error;
  }
}
