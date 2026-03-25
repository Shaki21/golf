/**
 * Pre-built Training Plan Templates
 * Ready-to-use templates for common training scenarios
 */

import { PrebuiltTemplate } from '../types/template.types';

/**
 * 4-Week Putting Intensive
 * Focus on short game and putting fundamentals
 */
export const PUTTING_INTENSIVE_TEMPLATE: PrebuiltTemplate = {
  name: '4-Week Putting Intensive',
  description: 'Comprehensive putting program focusing on distance control, alignment, and consistency. Ideal for players struggling with lag putts and short putts under pressure.',
  category: 'technique',
  level: 'all',
  durationWeeks: 4,
  tags: ['putting', 'short-game', 'fundamentals'],
  sessions: [
    // Week 1: Fundamentals
    {
      weekNumber: 1,
      dayOfWeek: 1, // Monday
      name: 'Putting Alignment & Setup',
      description: 'Focus on proper alignment, grip, and stance fundamentals',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L1',
      environment: 'C1',
      notes: 'Use alignment aids and video analysis',
    },
    {
      weekNumber: 1,
      dayOfWeek: 3, // Wednesday
      name: 'Distance Control - Short Putts',
      description: 'Work on putts from 3-6 feet with focus on speed control',
      durationMinutes: 45,
      categories: ['PGR'],
      phase: 'L2',
      environment: 'C1',
    },
    {
      weekNumber: 1,
      dayOfWeek: 5, // Friday
      name: 'Lag Putting Practice',
      description: 'Long putts (20-40 feet) focusing on distance control',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L2',
      environment: 'C1',
    },
    // Week 2: Build Consistency
    {
      weekNumber: 2,
      dayOfWeek: 1,
      name: 'Gate Drill & Path Control',
      description: 'Use gate drill to improve stroke path consistency',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L2',
      environment: 'C2',
    },
    {
      weekNumber: 2,
      dayOfWeek: 3,
      name: 'Breaking Putts Practice',
      description: 'Read and execute putts with break',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L3',
      environment: 'C2',
    },
    {
      weekNumber: 2,
      dayOfWeek: 5,
      name: 'Pressure Putting - 10 in a Row',
      description: 'Make 10 three-footers in a row under pressure',
      durationMinutes: 45,
      categories: ['PGR'],
      phase: 'L3',
      environment: 'C2',
      cognitiveSkillsLevel: 'CS3',
      pressureLevel: 'PR3',
    },
    // Week 3: Course Conditions
    {
      weekNumber: 3,
      dayOfWeek: 1,
      name: 'Speed Variations',
      description: 'Practice on different green speeds (fast/slow)',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L3',
      environment: 'C3',
    },
    {
      weekNumber: 3,
      dayOfWeek: 3,
      name: 'Uphill/Downhill Putts',
      description: 'Master slope variations and speed adjustments',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L4',
      environment: 'C3',
    },
    {
      weekNumber: 3,
      dayOfWeek: 5,
      name: 'Course Putting Session',
      description: 'Practice on actual course greens with various slopes',
      durationMinutes: 90,
      categories: ['PGR'],
      phase: 'L4',
      environment: 'C3',
    },
    // Week 4: Competition Prep
    {
      weekNumber: 4,
      dayOfWeek: 1,
      name: 'Pre-Round Routine',
      description: 'Establish and practice pre-round putting routine',
      durationMinutes: 45,
      categories: ['PGR'],
      phase: 'L4',
      environment: 'C4',
    },
    {
      weekNumber: 4,
      dayOfWeek: 3,
      name: 'Competitive Putting Games',
      description: 'Play putting games with consequences/scoring',
      durationMinutes: 60,
      categories: ['PGR'],
      phase: 'L5',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS4',
      pressureLevel: 'PR4',
    },
    {
      weekNumber: 4,
      dayOfWeek: 5,
      name: 'Simulated Tournament Putting',
      description: 'Simulate tournament pressure situations',
      durationMinutes: 90,
      categories: ['PGR'],
      phase: 'L5',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS5',
      pressureLevel: 'PR5',
    },
  ],
};

/**
 * 8-Week Full Swing Development
 * Comprehensive program for improving driver and iron play
 */
export const FULL_SWING_TEMPLATE: PrebuiltTemplate = {
  name: '8-Week Full Swing Development',
  description: 'Complete full swing program covering driver, fairway woods, and irons. Focus on tempo, path, and power development.',
  category: 'technique',
  level: 'intermediate',
  durationWeeks: 8,
  tags: ['driver', 'irons', 'full-swing', 'power'],
  sessions: [
    // Week 1-2: Fundamentals
    {
      weekNumber: 1,
      dayOfWeek: 1,
      name: 'Setup & Alignment Basics',
      description: 'Proper setup, grip, and alignment for full swing',
      durationMinutes: 90,
      categories: ['TEE'],
      phase: 'L1',
      environment: 'C1',
    },
    {
      weekNumber: 1,
      dayOfWeek: 3,
      name: 'Tempo & Rhythm Development',
      description: 'Establish consistent swing tempo',
      durationMinutes: 90,
      categories: ['TEE'],
      phase: 'L2',
      environment: 'C1',
    },
    {
      weekNumber: 2,
      dayOfWeek: 1,
      name: 'Path & Plane Work',
      description: 'Swing path and plane improvements',
      durationMinutes: 90,
      categories: ['TEE'],
      phase: 'L2',
      environment: 'C2',
    },
    {
      weekNumber: 2,
      dayOfWeek: 4,
      name: 'Iron Striking - Ball First Contact',
      description: 'Improve ball-first contact with irons',
      durationMinutes: 90,
      categories: ['APP'],
      phase: 'L2',
      environment: 'C2',
    },
    // Week 3-4: Power Development
    {
      weekNumber: 3,
      dayOfWeek: 1,
      name: 'Speed Training Session',
      description: 'Increase clubhead speed with overspeed training',
      durationMinutes: 60,
      categories: ['TEE'],
      phase: 'L3',
      environment: 'C2',
    },
    {
      weekNumber: 3,
      dayOfWeek: 3,
      name: 'Driver Optimization',
      description: 'Optimize launch angle and spin with driver',
      durationMinutes: 90,
      categories: ['TEE'],
      phase: 'L3',
      environment: 'C2',
    },
    {
      weekNumber: 4,
      dayOfWeek: 1,
      name: 'Fairway Wood Technique',
      description: 'Master 3-wood and hybrids off turf',
      durationMinutes: 75,
      categories: ['TEE'],
      phase: 'L3',
      environment: 'C3',
    },
    {
      weekNumber: 4,
      dayOfWeek: 4,
      name: 'Iron Distance Control',
      description: 'Dial in distance for each iron',
      durationMinutes: 90,
      categories: ['APP'],
      phase: 'L3',
      environment: 'C3',
    },
    // Week 5-6: Course Application
    {
      weekNumber: 5,
      dayOfWeek: 1,
      name: 'Shot Shaping Fundamentals',
      description: 'Learn to hit draws and fades on command',
      durationMinutes: 90,
      categories: ['TEE'],
      phase: 'L4',
      environment: 'C3',
    },
    {
      weekNumber: 5,
      dayOfWeek: 3,
      name: 'Uneven Lies Practice',
      description: 'Master shots from uphill, downhill, sidehill lies',
      durationMinutes: 90,
      categories: ['APP'],
      phase: 'L4',
      environment: 'C3',
    },
    {
      weekNumber: 6,
      dayOfWeek: 1,
      name: 'Wind Play',
      description: 'Adjust for wind conditions with full swing',
      durationMinutes: 90,
      categories: ['TEE', 'APP'],
      phase: 'L4',
      environment: 'C4',
    },
    {
      weekNumber: 6,
      dayOfWeek: 4,
      name: 'Target Practice - Course Simulation',
      description: 'Hit to specific targets at various distances',
      durationMinutes: 90,
      categories: ['TEE', 'APP'],
      phase: 'L4',
      environment: 'C4',
    },
    // Week 7-8: Competition Prep
    {
      weekNumber: 7,
      dayOfWeek: 1,
      name: 'Pressure Shot Practice',
      description: 'Full swings under simulated pressure',
      durationMinutes: 90,
      categories: ['TEE', 'APP'],
      phase: 'L5',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS4',
      pressureLevel: 'PR4',
    },
    {
      weekNumber: 7,
      dayOfWeek: 4,
      name: 'Course Strategy Session',
      description: 'Apply full swing skills to course management',
      durationMinutes: 120,
      categories: ['GBR'],
      phase: 'L5',
      environment: 'C4',
    },
    {
      weekNumber: 8,
      dayOfWeek: 1,
      name: 'Pre-Tournament Tuning',
      description: 'Fine-tune swing for tournament conditions',
      durationMinutes: 90,
      categories: ['TEE', 'APP'],
      phase: 'L5',
      environment: 'C4',
    },
    {
      weekNumber: 8,
      dayOfWeek: 3,
      name: 'Final Assessment & Adjustments',
      description: 'Review progress and make final adjustments',
      durationMinutes: 90,
      categories: ['TEE', 'APP'],
      phase: 'L5',
      environment: 'C4',
    },
  ],
};

/**
 * 12-Week Competition Preparation
 * Intensive program for tournament readiness
 */
export const COMPETITION_PREP_TEMPLATE: PrebuiltTemplate = {
  name: '12-Week Competition Preparation',
  description: 'Comprehensive tournament preparation program covering all aspects of competitive golf. Build physical conditioning, mental toughness, and course management skills.',
  category: 'competition-prep',
  level: 'advanced',
  durationWeeks: 12,
  tags: ['tournament', 'mental-game', 'strategy', 'all-around'],
  sessions: [
    // Week 1-3: Foundation Phase
    {
      weekNumber: 1,
      dayOfWeek: 1,
      name: 'Baseline Assessment - All Areas',
      description: 'Comprehensive assessment of current skills',
      durationMinutes: 120,
      categories: ['TEE', 'APP', 'SGR', 'PGR'],
      phase: 'L1',
      environment: 'C1',
    },
    {
      weekNumber: 1,
      dayOfWeek: 3,
      name: 'Mental Game Introduction',
      description: 'Introduction to mental game strategies',
      durationMinutes: 60,
      categories: ['GBR'],
      phase: 'L1',
      environment: 'C1',
      cognitiveSkillsLevel: 'CS2',
    },
    // ... (Week 2-3 sessions would be added here)
    // Week 4-6: Build Phase
    {
      weekNumber: 4,
      dayOfWeek: 1,
      name: 'All-Around Skills Session',
      description: 'Rotate through all game areas with focus',
      durationMinutes: 150,
      categories: ['TEE', 'APP', 'SGR', 'PGR'],
      phase: 'L3',
      environment: 'C2',
    },
    // ... (Week 5-6 sessions would be added here)
    // Week 7-9: Intensification Phase
    {
      weekNumber: 7,
      dayOfWeek: 1,
      name: 'Simulated Tournament Round',
      description: 'Play 9-18 holes under tournament conditions',
      durationMinutes: 240,
      categories: ['GBR'],
      phase: 'L4',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS4',
      pressureLevel: 'PR4',
    },
    // ... (Week 8-9 sessions would be added here)
    // Week 10-12: Peak Phase
    {
      weekNumber: 10,
      dayOfWeek: 1,
      name: 'Course Reconnaissance',
      description: 'Play and strategize on tournament course',
      durationMinutes: 240,
      categories: ['GBR'],
      phase: 'L5',
      environment: 'C4',
    },
    {
      weekNumber: 11,
      dayOfWeek: 1,
      name: 'Tournament Simulation Day 1',
      description: 'Full tournament round with scoring and pressure',
      durationMinutes: 300,
      categories: ['GBR'],
      phase: 'L5',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS5',
      pressureLevel: 'PR5',
    },
    {
      weekNumber: 12,
      dayOfWeek: 1,
      name: 'Final Tune-Up',
      description: 'Light practice focusing on feel and confidence',
      durationMinutes: 90,
      categories: ['TEE', 'APP', 'SGR', 'PGR'],
      phase: 'L5',
      environment: 'C4',
    },
  ],
};

/**
 * 6-Week Short Game Mastery
 * Focus on greenside bunkers, chipping, and pitching
 */
export const SHORT_GAME_TEMPLATE: PrebuiltTemplate = {
  name: '6-Week Short Game Mastery',
  description: 'Master the art of the short game with focus on chipping, pitching, bunker play, and up-and-down conversions.',
  category: 'technique',
  level: 'all',
  durationWeeks: 6,
  tags: ['short-game', 'chipping', 'bunkers', 'wedges'],
  sessions: [
    {
      weekNumber: 1,
      dayOfWeek: 1,
      name: 'Chipping Fundamentals',
      description: 'Basic chipping technique and club selection',
      durationMinutes: 60,
      categories: ['SGR'],
      phase: 'L1',
      environment: 'C1',
    },
    {
      weekNumber: 1,
      dayOfWeek: 3,
      name: 'Pitching Technique',
      description: 'Learn proper pitching motion for 30-60 yard shots',
      durationMinutes: 60,
      categories: ['SGR'],
      phase: 'L2',
      environment: 'C1',
    },
    {
      weekNumber: 2,
      dayOfWeek: 1,
      name: 'Bunker Play Basics',
      description: 'Greenside bunker technique and practice',
      durationMinutes: 75,
      categories: ['SGR'],
      phase: 'L2',
      environment: 'C2',
    },
    {
      weekNumber: 2,
      dayOfWeek: 4,
      name: 'Distance Control - Short Wedges',
      description: 'Dial in distances for 40, 50, 60 yard wedges',
      durationMinutes: 75,
      categories: ['SGR'],
      phase: 'L3',
      environment: 'C2',
    },
    {
      weekNumber: 3,
      dayOfWeek: 1,
      name: 'Flop Shots & High Lobs',
      description: 'Learn to hit high, soft shots when needed',
      durationMinutes: 60,
      categories: ['SGR'],
      phase: 'L3',
      environment: 'C3',
    },
    {
      weekNumber: 3,
      dayOfWeek: 3,
      name: 'Buried Lies & Difficult Bunker Shots',
      description: 'Handle challenging bunker situations',
      durationMinutes: 75,
      categories: ['SGR'],
      phase: 'L3',
      environment: 'C3',
    },
    {
      weekNumber: 4,
      dayOfWeek: 1,
      name: 'Tight Lies & Hardpan',
      description: 'Master shots from tight lies around the green',
      durationMinutes: 60,
      categories: ['SGR'],
      phase: 'L4',
      environment: 'C3',
    },
    {
      weekNumber: 4,
      dayOfWeek: 4,
      name: 'Up-and-Down Challenges',
      description: 'Practice getting up and down from various locations',
      durationMinutes: 90,
      categories: ['SGR'],
      phase: 'L4',
      environment: 'C4',
    },
    {
      weekNumber: 5,
      dayOfWeek: 1,
      name: 'Scrambling Practice',
      description: 'Simulate scrambling scenarios from trouble spots',
      durationMinutes: 90,
      categories: ['SGR'],
      phase: 'L4',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS3',
      pressureLevel: 'PR3',
    },
    {
      weekNumber: 5,
      dayOfWeek: 3,
      name: 'Course Short Game Session',
      description: 'Practice short game on actual course',
      durationMinutes: 120,
      categories: ['SGR'],
      phase: 'L4',
      environment: 'C4',
    },
    {
      weekNumber: 6,
      dayOfWeek: 1,
      name: 'Pressure Short Game Drills',
      description: 'Short game drills with consequences/scoring',
      durationMinutes: 75,
      categories: ['SGR'],
      phase: 'L5',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS4',
      pressureLevel: 'PR4',
    },
    {
      weekNumber: 6,
      dayOfWeek: 3,
      name: 'Final Short Game Assessment',
      description: 'Test all short game skills under pressure',
      durationMinutes: 90,
      categories: ['SGR'],
      phase: 'L5',
      environment: 'C4',
      cognitiveSkillsLevel: 'CS5',
      pressureLevel: 'PR5',
    },
  ],
};

/**
 * All pre-built templates exported as array
 */
export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  PUTTING_INTENSIVE_TEMPLATE,
  FULL_SWING_TEMPLATE,
  COMPETITION_PREP_TEMPLATE,
  SHORT_GAME_TEMPLATE,
];

/**
 * Get template by name
 */
export function getTemplateByName(name: string): PrebuiltTemplate | undefined {
  return PREBUILT_TEMPLATES.find(t => t.name === name);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PrebuiltTemplate[] {
  return PREBUILT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by level
 */
export function getTemplatesByLevel(level: string): PrebuiltTemplate[] {
  return PREBUILT_TEMPLATES.filter(t => t.level === level || t.level === 'all');
}
