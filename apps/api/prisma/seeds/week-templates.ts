/**
 * Seed Week Plan Templates
 * 88 Week Templates: 11 categories × 4 periods × 2 variants
 */

import prisma from '../client';


// Helper to get week hours based on category and period
function getWeekHours(category: string, period: string): number {
  const hoursMap: Record<string, Record<string, number>> = {
    A: { E: 8, G: 22, S: 24, T: 20 },
    B: { E: 7, G: 20, S: 22, T: 18 },
    C: { E: 6, G: 17, S: 19, T: 16 },
    D: { E: 5, G: 15, S: 16, T: 13 },
    E: { E: 4, G: 12, S: 14, T: 11 },
    F: { E: 4, G: 10, S: 12, T: 9 },
    G: { E: 3, G: 8, S: 10, T: 7 },
    H: { E: 3, G: 6, S: 8, T: 6 },
    I: { E: 2, G: 5, S: 6, T: 4 },
    J: { E: 2, G: 6, S: 7, T: 5 },
    K: { E: 1, G: 3, S: 4, T: 2 },
  };
  return hoursMap[category]?.[period] || 10;
}

// Helper to get training distribution based on category and period
function getDistribution(category: string, period: string): any {
  const isElite = ['A', 'B', 'C'].includes(category);
  const isCompetitive = ['D', 'E', 'F'].includes(category);
  const isJunior = ['G', 'H', 'I', 'J', 'K'].includes(category);

  if (period === 'E') {
    return {
      testing: 40,
      reflection: 30,
      recovery: 20,
      planning: 10,
    };
  }

  if (period === 'G') {
    if (isElite) {
      return { technique: 35, physical: 25, shortGame: 25, mental: 15 };
    } else if (isCompetitive) {
      return { technique: 40, physical: 30, shortGame: 20, mental: 10 };
    } else {
      return { technique: 45, play: 25, shortGame: 20, physical: 10 };
    }
  }

  if (period === 'S') {
    if (isElite) {
      return { shortGame: 35, technique: 25, play: 25, physical: 15 };
    } else if (isCompetitive) {
      return { shortGame: 35, technique: 30, play: 20, physical: 15 };
    } else {
      return { technique: 35, shortGame: 30, play: 25, physical: 10 };
    }
  }

  if (period === 'T') {
    if (isElite) {
      return { play: 50, shortGame: 25, technique: 15, mental: 10 };
    } else if (isCompetitive) {
      return { play: 45, shortGame: 25, technique: 20, mental: 10 };
    } else {
      return { play: 40, technique: 30, shortGame: 20, social: 10 };
    }
  }

  return { technique: 30, shortGame: 30, play: 20, physical: 20 };
}

// Helper to get learning phase focus based on period
function getLearningPhaseFocus(period: string): string {
  const phaseMap: Record<string, string> = {
    E: 'L1-L2',
    G: 'L2-L3',
    S: 'L3-L4',
    T: 'L4-L5',
  };
  return phaseMap[period] || 'L2-L3';
}

// Helper to get setting range based on period
function getSettingRange(period: string): string {
  const settingMap: Record<string, string> = {
    E: 'S1-S3',
    G: 'S1-S4',
    S: 'S3-S7',
    T: 'S7-S10',
  };
  return settingMap[period] || 'S1-S5';
}

// Helper to get rest day based on period
function getRestDay(period: string): string {
  return period === 'T' ? 'friday' : 'sunday';
}

// Helper to create week structure (session types per day)
function getWeekStructure(category: string, period: string, variant: string): {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
} {
  const isElite = ['A', 'B', 'C'].includes(category);
  const isCompetitive = ['D', 'E', 'F'].includes(category);
  const isBenchmarkWeek = variant === 'benchmark';

  // Benchmark weeks have testing on specific days
  if (isBenchmarkWeek) {
    return {
      monday: ['technical'],
      tuesday: ['testing', 'physical'],
      wednesday: ['testing'],
      thursday: ['testing', 'shortGame'],
      friday: ['recovery'],
      saturday: ['testing'],
      sunday: [],
    };
  }

  // Normal weeks - structure depends on period
  if (period === 'E') {
    return {
      monday: ['testing'],
      tuesday: ['recovery'],
      wednesday: ['planning'],
      thursday: ['testing'],
      friday: ['physical'],
      saturday: ['reflection'],
      sunday: [],
    };
  }

  if (period === 'G') {
    if (isElite) {
      return {
        monday: ['technical', 'physical'],
        tuesday: ['shortGame'],
        wednesday: ['technical', 'physical'],
        thursday: ['shortGame', 'mental'],
        friday: ['technical'],
        saturday: ['play'],
        sunday: [],
      };
    } else if (isCompetitive) {
      return {
        monday: ['technical'],
        tuesday: ['physical'],
        wednesday: ['shortGame'],
        thursday: ['physical'],
        friday: ['technical'],
        saturday: ['play'],
        sunday: [],
      };
    } else {
      return {
        monday: ['technical'],
        tuesday: ['play'],
        wednesday: ['shortGame'],
        thursday: ['physical'],
        friday: ['technical'],
        saturday: ['play'],
        sunday: [],
      };
    }
  }

  if (period === 'S') {
    if (isElite) {
      return {
        monday: ['shortGame'],
        tuesday: ['physical'],
        wednesday: ['technical'],
        thursday: ['play'],
        friday: ['shortGame'],
        saturday: ['play'],
        sunday: [],
      };
    } else if (isCompetitive) {
      return {
        monday: ['shortGame'],
        tuesday: ['physical'],
        wednesday: ['technical'],
        thursday: ['play'],
        friday: ['shortGame'],
        saturday: ['play'],
        sunday: [],
      };
    } else {
      return {
        monday: ['technical'],
        tuesday: ['shortGame'],
        wednesday: ['play'],
        thursday: ['physical'],
        friday: ['technical'],
        saturday: ['play'],
        sunday: [],
      };
    }
  }

  if (period === 'T') {
    return {
      monday: ['technical'],
      tuesday: ['shortGame'],
      wednesday: ['play'],
      thursday: ['mental'],
      friday: [],
      saturday: ['tournament'],
      sunday: ['tournament'],
    };
  }

  // Default structure
  return {
    monday: ['technical'],
    tuesday: ['physical'],
    wednesday: ['shortGame'],
    thursday: ['technical'],
    friday: ['play'],
    saturday: ['play'],
    sunday: [],
  };
}

export async function seedWeekTemplates() {
  console.log('📅 Seeding week plan templates...');

  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'ak-golf-academy' },
  });

  if (!tenant) {
    console.log('   ⚠️  No tenant found, skipping week template seed');
    return;
  }

  // Check if templates already exist
  const existingCount = await prisma.weekPlanTemplate.count({
    where: { tenantId: tenant.id },
  });

  if (existingCount > 0) {
    console.log(`   ⚠️  Found ${existingCount} existing week templates, skipping seed`);
    return;
  }

  // Get all session templates to reference
  const sessionTemplates = await prisma.sessionTemplate.findMany({
    where: { tenantId: tenant.id },
  });

  if (sessionTemplates.length === 0) {
    console.log('   ⚠️  No session templates found, run session-templates seed first');
    return;
  }

  // Create a map of session templates by type
  const sessionMap: Record<string, any> = {
    technical: sessionTemplates.find(t => t.sessionType === 'technical'),
    physical: sessionTemplates.find(t => t.sessionType === 'physical'),
    mental: sessionTemplates.find(t => t.sessionType === 'mental'),
    shortGame: sessionTemplates.find(t => t.name.includes('Short Game')),
    play: sessionTemplates.find(t => t.name.includes('Course') || t.name.includes('Strategy')),
    testing: sessionTemplates.find(t => t.name.includes('Assessment') || t.sessionType === 'recovery'),
    recovery: sessionTemplates.find(t => t.sessionType === 'recovery' || t.name.includes('Recovery')),
    tournament: sessionTemplates.find(t => t.name.includes('Tournament') || t.name.includes('Competition')),
    tactical: sessionTemplates.find(t => t.sessionType === 'tactical'),
    planning: sessionTemplates.find(t => t.name.includes('Preparation') || t.sessionType === 'mental'),
    reflection: sessionTemplates.find(t => t.name.includes('Reflection') || t.sessionType === 'recovery'),
  };

  // Default to first template if specific type not found
  const defaultTemplate = sessionTemplates[0];

  const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const periods = ['E', 'G', 'S', 'T'];
  const variants = ['normal', 'benchmark'];

  let created = 0;

  for (const category of categories) {
    for (const period of periods) {
      for (const variant of variants) {
        const weekStructure = getWeekStructure(category, period, variant);

        // Map session types to template IDs
        const mapSessionTypes = (sessionTypes: string[]): string[] => {
          return sessionTypes.map(type => {
            const template = sessionMap[type] || defaultTemplate;
            return template?.id || '';
          }).filter(id => id !== '');
        };

        const template = {
          tenantId: tenant.id,
          name: `Kategori ${category} - Periode ${period} (${variant === 'normal' ? 'Normal uke' : 'Benchmark uke'})`,
          category,
          period,
          variant,
          mondaySessions: mapSessionTypes(weekStructure.monday),
          tuesdaySessions: mapSessionTypes(weekStructure.tuesday),
          wednesdaySessions: mapSessionTypes(weekStructure.wednesday),
          thursdaySessions: mapSessionTypes(weekStructure.thursday),
          fridaySessions: mapSessionTypes(weekStructure.friday),
          saturdaySessions: mapSessionTypes(weekStructure.saturday),
          sundaySessions: mapSessionTypes(weekStructure.sunday),
          distribution: getDistribution(category, period),
          restDay: getRestDay(period),
          learningPhaseFocus: getLearningPhaseFocus(period),
          settingRange: getSettingRange(period),
        };

        try {
          await prisma.weekPlanTemplate.create({
            data: template,
          });
          created++;
        } catch (error) {
          console.log(`   ⚠️  Error creating template for ${category}-${period}-${variant}:`, error);
        }
      }
    }
  }

  console.log(`   ✅ Created ${created} week plan templates (88 total)`);
}
