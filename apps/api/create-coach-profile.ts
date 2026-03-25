import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCoachProfile() {
  console.log('🏌️ Creating Coach Profile: Jørn Johnsen\n');

  try {
    // Check if coach user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'coach@demo.com' },
      include: { coach: true }
    });

    if (existingUser && existingUser.coach) {
      console.log('✅ Coach already exists!');
      console.log('\nCoach Details:');
      console.log(`   Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Coach ID: ${existingUser.coach.id}`);
      console.log('\n📧 Login Credentials:');
      console.log(`   Email: coach@demo.com`);
      console.log(`   Password: coach123`);
      return;
    }

    // Get or create tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Demo Organization',
          slug: 'demo-org',
          subscriptionStatus: 'active',
        }
      });
      console.log('✅ Created tenant:', tenant.name);
    }

    // Create coach user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('coach123', 10);

    const coachUser = await prisma.user.create({
      data: {
        email: 'coach@demo.com',
        firstName: 'Jørn',
        lastName: 'Johnsen',
        password: hashedPassword,
        role: 'coach',
        tenantId: tenant.id,
        emailVerified: true,
        coach: {
          create: {
            tenantId: tenant.id,
            bio: 'Erfaren golf-trener med over 15 års erfaring. Spesialiserer seg på teknisk trening og mental coaching for unge talenter.',
            specialization: 'Technical Training, Mental Coaching',
            certifications: ['PGA Level 3', 'Sports Psychology'],
            yearsExperience: 15,
          }
        }
      },
      include: {
        coach: true
      }
    });

    console.log('✅ Coach profile created successfully!\n');
    console.log('Coach Details:');
    console.log(`   Name: ${coachUser.firstName} ${coachUser.lastName}`);
    console.log(`   Email: ${coachUser.email}`);
    console.log(`   Role: ${coachUser.role}`);
    console.log(`   Coach ID: ${coachUser.coach?.id}`);
    console.log(`   Bio: ${coachUser.coach?.bio}`);
    console.log(`   Specialization: ${coachUser.coach?.specialization}`);
    console.log(`   Experience: ${coachUser.coach?.yearsExperience} years`);
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: coach@demo.com`);
    console.log(`   Password: coach123`);

  } catch (error) {
    console.error('❌ Error creating coach profile:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCoachProfile()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
