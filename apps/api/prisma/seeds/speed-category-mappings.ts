/**
 * Seed Speed Category Mappings
 * Maps driver speed ranges to club speed levels (CS codes)
 */

import prisma from '../client';


const speedMappings = [
  {
    minDriverSpeed: 0,
    maxDriverSpeed: 85,
    clubSpeedLevel: 'CS20',
    description: 'Very slow swing speed - Beginner level',
  },
  {
    minDriverSpeed: 85,
    maxDriverSpeed: 90,
    clubSpeedLevel: 'CS40',
    description: 'Slow swing speed - Developing player',
  },
  {
    minDriverSpeed: 90,
    maxDriverSpeed: 95,
    clubSpeedLevel: 'CS70',
    description: 'Below average swing speed - Intermediate level',
  },
  {
    minDriverSpeed: 95,
    maxDriverSpeed: 105,
    clubSpeedLevel: 'CS90',
    description: 'Average swing speed - Typical club golfer',
  },
  {
    minDriverSpeed: 105,
    maxDriverSpeed: 120,
    clubSpeedLevel: 'CS110',
    description: 'Above average swing speed - Advanced player',
  },
  {
    minDriverSpeed: 120,
    maxDriverSpeed: 200,
    clubSpeedLevel: 'CS120',
    description: 'Very fast swing speed - Elite/Tour level',
  },
];

export async function seedSpeedCategoryMappings() {
  console.log('📊 Seeding speed category mappings...');

  // Check if mappings already exist
  const existingCount = await prisma.speedCategoryMapping.count();

  if (existingCount > 0) {
    console.log(`   ⚠️  Found ${existingCount} existing speed mappings, skipping seed`);
    return;
  }

  // Create all speed category mappings
  for (const mapping of speedMappings) {
    await prisma.speedCategoryMapping.create({
      data: mapping,
    });
  }

  console.log(`   ✅ Created ${speedMappings.length} speed category mappings`);
}
