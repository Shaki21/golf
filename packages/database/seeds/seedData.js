const { query } = require('../config/database');

// ============================================================================
// SEED DATA - Sample players, coaches, and tests for development/testing
// ============================================================================

/**
 * Seed sample coaches
 */
async function seedCoaches() {
  console.log('Seeding coaches...');

  const coaches = [
    {
      first_name: 'Anders',
      last_name: 'Knutsen',
      email: 'anders@akgolfacademy.no',
      phone: '+47 12345678',
      specialization: 'Junior Development',
      certification: 'PGA Professional, Team Norway Coach',
      bio: 'Head Coach at AK Golf Academy with 15+ years of experience developing young talent.'
    },
    {
      first_name: 'Lars',
      last_name: 'Hansen',
      email: 'lars@akgolfacademy.no',
      phone: '+47 23456789',
      specialization: 'Short Game & Putting',
      certification: 'PGA Professional',
      bio: 'Specialist in short game development and mental coaching.'
    },
    {
      first_name: 'Ingrid',
      last_name: 'Berg',
      email: 'ingrid@teamnorwaygolf.no',
      phone: '+47 34567890',
      specialization: 'Physical Training & Performance',
      certification: 'Sports Science, Team Norway',
      bio: 'Team Norway performance coach focusing on physical development.'
    }
  ];

  for (const coach of coaches) {
    await query(`
      INSERT INTO coaches (
        first_name, last_name, email, phone, specialization, certification, bio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `, [
      coach.first_name, coach.last_name, coach.email, coach.phone,
      coach.specialization, coach.certification, coach.bio
    ]);
  }

  console.log(`✓ Created ${coaches.length} coaches`);
}

/**
 * Seed sample players
 */
async function seedPlayers() {
  console.log('Seeding players...');

  // Get Anders Knutsen as default coach
  const coachResult = await query(`
    SELECT id FROM coaches WHERE email = 'anders@akgolfacademy.no' LIMIT 1
  `);

  if (coachResult.rows.length === 0) {
    console.log('⚠ No coach found, please seed coaches first');
    return;
  }

  const coachId = coachResult.rows[0].id;

  const players = [
    {
      first_name: 'Ola',
      last_name: 'Nordmann',
      email: 'ola.nordmann@example.com',
      phone: '+47 98765432',
      date_of_birth: '2008-03-15',
      gender: 'male',
      category: 'D',
      average_score: 75.5,
      handicap: 5.2,
      club: 'Oslo Golf Club',
      current_period: 'G',
      weekly_training_hours: 12
    },
    {
      first_name: 'Kari',
      last_name: 'Olsen',
      email: 'kari.olsen@example.com',
      phone: '+47 87654321',
      date_of_birth: '2009-07-22',
      gender: 'female',
      category: 'E',
      average_score: 82.3,
      handicap: 10.5,
      club: 'Bergen Golf Club',
      current_period: 'G',
      weekly_training_hours: 10
    },
    {
      first_name: 'Erik',
      last_name: 'Svensson',
      email: 'erik.svensson@example.com',
      phone: '+47 76543210',
      date_of_birth: '2007-11-08',
      gender: 'male',
      category: 'C',
      average_score: 70.2,
      handicap: 2.1,
      club: 'Stavanger Golf Club',
      current_period: 'C',
      weekly_training_hours: 15
    },
    {
      first_name: 'Sofie',
      last_name: 'Hansen',
      email: 'sofie.hansen@example.com',
      phone: '+47 65432109',
      date_of_birth: '2010-05-17',
      gender: 'female',
      category: 'F',
      average_score: 88.7,
      handicap: 15.3,
      club: 'Trondheim Golf Club',
      current_period: 'G',
      weekly_training_hours: 8
    },
    {
      first_name: 'Magnus',
      last_name: 'Berg',
      email: 'magnus.berg@example.com',
      phone: '+47 54321098',
      date_of_birth: '2006-09-03',
      gender: 'male',
      category: 'B',
      average_score: 68.5,
      handicap: 0.5,
      club: 'Kristiansand Golf Club',
      current_period: 'V',
      weekly_training_hours: 18
    }
  ];

  for (const player of players) {
    await query(`
      INSERT INTO players (
        first_name, last_name, email, phone, date_of_birth, gender,
        category, average_score, handicap, club, coach_id,
        current_period, weekly_training_hours, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active')
      ON CONFLICT (email) DO NOTHING
    `, [
      player.first_name, player.last_name, player.email, player.phone,
      player.date_of_birth, player.gender, player.category, player.average_score,
      player.handicap, player.club, coachId, player.current_period,
      player.weekly_training_hours
    ]);
  }

  console.log(`✓ Created ${players.length} players`);
}

/**
 * Seed Team Norway test definitions
 */
async function seedTests() {
  console.log('Seeding test definitions...');

  const tests = [
    {
      name: 'PEI Full Bag Test',
      category: 'technical',
      type: 'benchmark',
      description: 'Performance Effectiveness Index test with full bag',
      instructions: 'Hit 3 balls with each club. Measure distance and accuracy.',
      metrics: { clubs: ['Driver', '3W', '5W', 'Hybrid', '4i-PW', '52°', '56°', '60°'], targets: ['Green', 'Fairway'], scoring: 'PEI formula' },
      scoring_system: 'PEI = (Distance × Accuracy) / 100',
      equipment_needed: 'Full bag, range balls, TrackMan/FlightScope',
      duration_minutes: 90
    },
    {
      name: 'Short Game Challenge',
      category: 'technical',
      type: 'benchmark',
      description: '5 stations testing various short game situations',
      instructions: '10 balls per station. Score based on proximity to hole.',
      metrics: { stations: ['Chip 10m', 'Pitch 30m', 'Bunker 15m', 'Lag putting 10m', 'Short putting 3m'], scoring: 'Average distance to hole' },
      scoring_system: 'Average distance to hole in meters',
      equipment_needed: 'Wedges, putter, practice balls',
      duration_minutes: 60
    },
    {
      name: 'Putting Test 20 Balls',
      category: 'technical',
      type: 'benchmark',
      description: '20 putts from various distances',
      instructions: '5 balls each from 1m, 2m, 3m, 5m. Count makes and measure misses.',
      metrics: { distances: ['1m', '2m', '3m', '5m'], balls_per_distance: 5, scoring: 'Makes + proximity' },
      scoring_system: 'Points: 1m=5pts, 2m=4pts, 3m=3pts, 5m=2pts per make',
      equipment_needed: 'Putter, 20 balls, practice green',
      duration_minutes: 30
    },
    {
      name: 'Driver Consistency Test',
      category: 'technical',
      type: 'benchmark',
      description: '15 drives measuring distance and accuracy',
      instructions: 'Hit 15 drives. Measure ball speed, distance, and dispersion.',
      metrics: { balls: 15, measurements: ['Ball speed', 'Total distance', 'Carry distance', 'Dispersion'], scoring: 'Average and consistency' },
      scoring_system: 'Score = Average distance × (1 - dispersion penalty)',
      equipment_needed: 'Driver, range balls, launch monitor',
      duration_minutes: 30
    },
    {
      name: 'On-Course Performance Test',
      category: 'strategic',
      type: 'performance',
      description: 'Track key statistics during 18-hole round',
      instructions: 'Play 18 holes tracking all key statistics',
      metrics: { stats: ['Fairways hit', 'GIR', 'Up and down %', 'Putts per GIR', 'Total putts', 'Scrambling'], scoring: 'Comprehensive scorecard' },
      scoring_system: 'Score to par + strokes gained analysis',
      equipment_needed: 'Full bag, scorecard app',
      duration_minutes: 240
    }
  ];

  for (const test of tests) {
    await query(`
      INSERT INTO tests (
        name, category, type, description, instructions, metrics,
        scoring_system, equipment_needed, duration_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (name) DO NOTHING
    `, [
      test.name, test.category, test.type, test.description, test.instructions,
      JSON.stringify(test.metrics), test.scoring_system, test.equipment_needed,
      test.duration_minutes
    ]);
  }

  console.log(`✓ Created ${tests.length} test definitions`);
}

/**
 * Run all seed functions
 */
async function runSeed() {
  try {
    console.log('============================================================================');
    console.log('🌱 SEEDING DATABASE WITH SAMPLE DATA');
    console.log('============================================================================');

    await seedCoaches();
    await seedPlayers();
    await seedTests();

    console.log('============================================================================');
    console.log('✅ SEED COMPLETE');
    console.log('============================================================================');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runSeed, seedCoaches, seedPlayers, seedTests };
