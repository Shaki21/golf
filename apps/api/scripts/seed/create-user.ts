/**
 * Create User Script
 * Creates a complete user (User + Player/Coach profile) with login credentials
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🎯 Create New User\n');

    // Get tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'ak-golf-academy' },
    });

    if (!tenant) {
      console.error('❌ Tenant not found. Run seed script first.');
      process.exit(1);
    }

    // Get user type
    const userType = await question('User type (1=Player, 2=Coach, 3=Admin): ');
    const role = userType === '1' ? 'player' : userType === '2' ? 'coach' : 'admin';

    // Get basic info
    const firstName = await question('First name: ');
    const lastName = await question('Last name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 8 characters): ');

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.error('❌ User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create User
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        isActive: true,
      },
    });

    console.log(`\n✅ User created: ${email}`);

    // Create role-specific profile
    if (role === 'player') {
      const category = await question('Category (A-K): ');
      const handicap = await question('Handicap: ');
      const dateOfBirth = await question('Date of birth (YYYY-MM-DD): ');
      const gender = await question('Gender (male/female/other): ');
      const club = await question('Club (optional): ');

      // Get coaches to assign
      const coaches = await prisma.coach.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, firstName: true, lastName: true, email: true },
      });

      if (coaches.length > 0) {
        console.log('\n👨‍🏫 Available coaches:');
        coaches.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.firstName} ${c.lastName} (${c.email})`);
        });

        const coachIndex = await question(`Assign coach (1-${coaches.length}, or press Enter to skip): `);
        let coachId: string | undefined;

        if (coachIndex && parseInt(coachIndex) > 0 && parseInt(coachIndex) <= coaches.length) {
          coachId = coaches[parseInt(coachIndex) - 1].id;
        }

        const player = await prisma.player.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            firstName,
            lastName,
            email,
            dateOfBirth: new Date(dateOfBirth),
            gender: gender as any,
            category: category as any,
            handicap: parseFloat(handicap) || 0,
            club: club || 'Oslo GK',
            coachId,
            status: 'active',
          },
        });

        console.log(`✅ Player profile created: ${player.id}`);
      }
    } else if (role === 'coach') {
      const phone = await question('Phone (optional): ');

      const coach = await prisma.coach.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          specializations: [],
          certifications: [],
        },
      });

      console.log(`✅ Coach profile created: ${coach.id}`);
    }

    console.log('\n🎉 User created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);

  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
    rl.close();
  }
}

createUser().catch((error) => {
  console.error(error);
  process.exit(1);
});
