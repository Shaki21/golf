import prisma from './prisma/client';

async function seedBreakingPoints() {
  console.log('Seeding breaking points...');

  // Breaking Point 1: High severity - Putting consistency
  await prisma.$executeRaw`
    INSERT INTO breaking_points (
      id,
      player_id,
      process_category,
      specific_area,
      description,
      identified_date,
      severity,
      baseline_measurement,
      target_measurement,
      current_measurement,
      progress_percent,
      assigned_exercise_ids,
      hours_per_week,
      status,
      success_history,
      notes,
      source_type,
      club_type,
      auto_detected,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000004',
      'putting',
      'Distance Control',
      'Inconsistent distance control on long putts, frequently leaving 3+ feet short or long',
      CURRENT_DATE - INTERVAL '14 days',
      'high',
      '45% within 3 feet',
      '75% within 3 feet',
      '58% within 3 feet',
      35,
      ARRAY[]::uuid[],
      3,
      'working',
      '[]'::jsonb,
      'Identified through putting test analysis. Need to work on tempo and strike quality.',
      'test_result',
      'putter',
      false,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  // Breaking Point 2: Medium severity - Driver accuracy
  await prisma.$executeRaw`
    INSERT INTO breaking_points (
      id,
      player_id,
      process_category,
      specific_area,
      description,
      identified_date,
      severity,
      baseline_measurement,
      target_measurement,
      current_measurement,
      progress_percent,
      assigned_exercise_ids,
      hours_per_week,
      status,
      success_history,
      notes,
      source_type,
      club_type,
      deviation_percent,
      auto_detected,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000004',
      'longspill',
      'Driver Dispersion',
      'Driver shots showing high lateral dispersion, missing fairways 60% of the time',
      CURRENT_DATE - INTERVAL '7 days',
      'medium',
      '40% fairways hit',
      '65% fairways hit',
      '48% fairways hit',
      25,
      ARRAY[]::uuid[],
      4,
      'working',
      '[]'::jsonb,
      'Face angle at impact too open. Working on grip and release pattern.',
      'calibration',
      'driver',
      12.5,
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  // Breaking Point 3: Low severity - Wedge spin control
  await prisma.$executeRaw`
    INSERT INTO breaking_points (
      id,
      player_id,
      process_category,
      specific_area,
      description,
      identified_date,
      severity,
      baseline_measurement,
      target_measurement,
      current_measurement,
      progress_percent,
      assigned_exercise_ids,
      hours_per_week,
      status,
      success_history,
      notes,
      source_type,
      club_type,
      auto_detected,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000004',
      'shortgame',
      'Wedge Spin Rate',
      'Insufficient spin on wedge shots from 80-100 yards, causing balls to release too much',
      CURRENT_DATE - INTERVAL '21 days',
      'low',
      '5200 RPM average',
      '7500 RPM average',
      '6100 RPM average',
      42,
      ARRAY[]::uuid[],
      2,
      'identified',
      '[]'::jsonb,
      'Need steeper angle of attack and better strike location. Considering shaft change.',
      'manual',
      'wedge',
      false,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  console.log('✅ Successfully seeded 3 breaking points');
}

seedBreakingPoints()
  .catch((e) => {
    console.error('❌ Error seeding breaking points:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
