/**
 * Seed Training Plans
 * Annual Training Plan, Periodization, and Daily Assignments
 */

import prisma from '../client';


export async function seedTrainingPlan() {
  console.log('📅 Seeding training plans...');

  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'ak-golf-academy' },
  });

  const player = await prisma.player.findFirst({
    where: { email: 'player@demo.com' },
  });

  if (!tenant || !player) {
    throw new Error('Tenant or player not found. Run demo-users seed first.');
  }

  const now = new Date();
  const year = now.getFullYear();

  // Start of current year
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  // ============================================
  // ANNUAL TRAINING PLAN
  // ============================================
  let annualPlan = await prisma.annualTrainingPlan.findFirst({
    where: { playerId: player.id },
  });

  if (!annualPlan) {
    annualPlan = await prisma.annualTrainingPlan.create({
      data: {
        playerId: player.id,
        tenantId: tenant.id,
        planName: `Årsplan ${year} - ${player.firstName} ${player.lastName}`,
        startDate: yearStart,
        endDate: yearEnd,
        status: 'active',
        baselineAverageScore: 78,
        baselineHandicap: 5.4,
        baselineDriverSpeed: 105,
        playerCategory: 'B',
        basePeriodWeeks: 12,
        specializationWeeks: 20,
        tournamentWeeks: 16,
        weeklyHoursTarget: 15,
        intensityProfile: {
          base: { volume: 'high', intensity: 'low' },
          specialization: { volume: 'medium', intensity: 'medium' },
          tournament: { volume: 'low', intensity: 'high' },
          recovery: { volume: 'low', intensity: 'low' },
        },
        generatedAt: now,
        generationAlgorithm: 'v1.0',
        notes: 'Fokus på å nå kategori A innen sesongstart. Prioriter driver speed og short game.',
      },
    });
    console.log('   ✅ Created annual training plan');
  }

  // ============================================
  // PERIODIZATION (52 weeks)
  // ============================================
  const periodizationData = [];

  // Period definitions based on Norwegian golf season
  const periodStructure = [
    // Grunnlagsperiode (Uke 1-12) - Vinter/tidlig vår
    { weeks: [1, 12], period: 'G', phase: 'base', priorities: { technique: 3, physical: 3, competition: 0, play: 1, golfShot: 2 } },
    // Spesialiseringsperiode (Uke 13-24) - Vår
    { weeks: [13, 24], period: 'S', phase: 'specialization', priorities: { technique: 2, physical: 2, competition: 1, play: 2, golfShot: 3 } },
    // Turneringsperiode (Uke 25-40) - Sommer/høst
    { weeks: [25, 40], period: 'T', phase: 'tournament', priorities: { technique: 1, physical: 1, competition: 3, play: 3, golfShot: 2 } },
    // Overgangsperiode (Uke 41-44) - Høst
    { weeks: [41, 44], period: 'E', phase: 'recovery', priorities: { technique: 1, physical: 2, competition: 0, play: 1, golfShot: 1 } },
    // Ny grunnlagsperiode (Uke 45-52) - Sen høst/vinter
    { weeks: [45, 52], period: 'G', phase: 'base', priorities: { technique: 3, physical: 3, competition: 0, play: 1, golfShot: 2 } },
  ];

  // Generate periodization for each week
  for (let week = 1; week <= 52; week++) {
    const structure = periodStructure.find(s => week >= s.weeks[0] && week <= s.weeks[1]);
    if (!structure) continue;

    // Determine intensity based on phase
    let volumeIntensity = 'medium';
    if (structure.phase === 'base') volumeIntensity = week % 4 === 0 ? 'low' : 'high';
    if (structure.phase === 'specialization') volumeIntensity = 'medium';
    if (structure.phase === 'tournament') volumeIntensity = week % 3 === 0 ? 'taper' : 'peak';
    if (structure.phase === 'recovery') volumeIntensity = 'low';

    periodizationData.push({
      playerId: player.id,
      annualPlanId: annualPlan.id,
      weekNumber: week,
      period: structure.period,
      periodPhase: structure.phase,
      weekInPeriod: week - structure.weeks[0] + 1,
      volumeIntensity,
      priorityTechnique: structure.priorities.technique,
      priorityPhysical: structure.priorities.physical,
      priorityCompetition: structure.priorities.competition,
      priorityPlay: structure.priorities.play,
      priorityGolfShot: structure.priorities.golfShot,
      plannedHours: structure.phase === 'recovery' ? 8 : structure.phase === 'tournament' ? 12 : 15,
      learningPhaseMin: structure.period === 'G' ? 'L1' : structure.period === 'S' ? 'L3' : 'L4',
      learningPhaseMax: structure.period === 'G' ? 'L3' : structure.period === 'S' ? 'L4' : 'L5',
      clubSpeedMin: 'CS80',
      clubSpeedMax: 'CS100',
    });
  }

  // Insert periodization
  let periodCreated = 0;
  for (const p of periodizationData) {
    const existing = await prisma.periodization.findFirst({
      where: {
        playerId: player.id,
        weekNumber: p.weekNumber,
      },
    });

    if (!existing) {
      await prisma.periodization.create({ data: p });
      periodCreated++;
    }
  }
  console.log(`   ✅ Created ${periodCreated} periodization weeks`);

  // ============================================
  // DAILY TRAINING ASSIGNMENTS (Next 4 weeks)
  // ============================================
  const sessionTemplates = await prisma.sessionTemplate.findMany({
    where: { tenantId: tenant.id },
  });

  const currentWeek = Math.ceil((now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

  // Weekly schedule template
  const weeklySchedule = [
    { dayOfWeek: 1, sessionType: 'teknikk', duration: 90, description: 'Teknikktrening - Range' },
    { dayOfWeek: 2, sessionType: 'fysisk', duration: 60, description: 'Styrke og mobilitet' },
    { dayOfWeek: 3, sessionType: 'golfslag', duration: 120, description: 'Golfslag - Short game fokus' },
    { dayOfWeek: 4, sessionType: 'spill', duration: 180, description: 'Banespill 9 hull' },
    { dayOfWeek: 5, sessionType: 'teknikk', duration: 90, description: 'Teknikktrening - Putting' },
    { dayOfWeek: 6, sessionType: 'konkurranse', duration: 240, description: 'Simulert konkurranse / 18 hull' },
    { dayOfWeek: 0, sessionType: 'hvile', duration: 0, description: 'Hviledag', isRestDay: true },
  ];

  let assignmentsCreated = 0;

  // Generate for next 4 weeks
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const weekNumber = currentWeek + weekOffset;
    const periodization = periodizationData.find(p => p.weekNumber === weekNumber);

    for (const schedule of weeklySchedule) {
      const assignedDate = new Date(yearStart);
      assignedDate.setDate(assignedDate.getDate() + (weekNumber - 1) * 7 + schedule.dayOfWeek);

      // Skip past dates
      if (assignedDate < now) continue;

      const existing = await prisma.dailyTrainingAssignment.findFirst({
        where: {
          annualPlanId: annualPlan.id,
          assignedDate: assignedDate,
        },
      });

      if (!existing) {
        // Find matching session template
        const template = sessionTemplates.find(t =>
          t.sessionType.toLowerCase().includes(schedule.sessionType)
        );

        await prisma.dailyTrainingAssignment.create({
          data: {
            annualPlanId: annualPlan.id,
            playerId: player.id,
            assignedDate,
            weekNumber,
            dayOfWeek: schedule.dayOfWeek,
            sessionTemplateId: template?.id,
            sessionType: schedule.sessionType,
            estimatedDuration: schedule.duration,
            period: periodization?.period || 'G',
            learningPhase: periodization?.learningPhaseMin || 'L2',
            intensity: schedule.isRestDay ? 0 : 3,
            isRestDay: schedule.isRestDay || false,
            isOptional: false,
            status: 'planned',
            coachNotes: schedule.description,
          },
        });
        assignmentsCreated++;
      }
    }
  }
  console.log(`   ✅ Created ${assignmentsCreated} daily training assignments`);

  // ============================================
  // SCHEDULED TOURNAMENTS
  // ============================================
  const tournaments = await prisma.tournament.findMany({
    include: { event: true },
  });

  let scheduledCreated = 0;
  for (const tournament of tournaments) {
    const existing = await prisma.scheduledTournament.findFirst({
      where: {
        annualPlanId: annualPlan.id,
        tournamentId: tournament.id,
      },
    });

    if (!existing) {
      const tournamentWeek = Math.ceil(
        (tournament.event.startTime.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );

      // Determine importance based on level
      const importance = tournament.level === 'national' ? 'A' : 'B';

      await prisma.scheduledTournament.create({
        data: {
          annualPlanId: annualPlan.id,
          tournamentId: tournament.id,
          name: tournament.event.title,
          startDate: tournament.event.startTime,
          endDate: tournament.event.endTime,
          importance,
          weekNumber: tournamentWeek,
          period: tournamentWeek >= 25 && tournamentWeek <= 40 ? 'T' : 'S',
          toppingStartWeek: importance === 'A' ? tournamentWeek - 3 : tournamentWeek - 1,
          toppingDurationWeeks: importance === 'A' ? 3 : 1,
          taperingDurationDays: importance === 'A' ? 3 : 1,
          focusAreas: importance === 'A'
            ? ['mental prep', 'course strategy', 'scoring zones']
            : ['warm-up routine', 'scoring'],
        },
      });
      scheduledCreated++;
    }
  }
  console.log(`   ✅ Created ${scheduledCreated} scheduled tournaments`);
}
