/**
 * Seed Training Sessions
 * Historical training sessions for the demo player
 */

import prisma from '../client';


export async function seedTrainingSessions() {
  console.log('🏋️ Seeding training sessions...');

  const player = await prisma.player.findFirst({
    where: { email: 'player@demo.com' },
  });

  const coach = await prisma.coach.findFirst({
    where: { email: 'coach@demo.com' },
  });

  if (!player || !coach) {
    throw new Error('Player or coach not found. Run demo-users seed first.');
  }

  const now = new Date();

  // Helper to create past dates
  const pastDate = (daysAgo: number, hour: number = 10) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  // ============================================
  // HISTORICAL TRAINING SESSIONS (Last 30 days)
  // ============================================
  const sessions = [
    // Week 1 (most recent)
    { daysAgo: 1, sessionType: 'teknikk', duration: 90, focusArea: 'Driver', period: 'G', notes: 'Bra økt med fokus på alignment' },
    { daysAgo: 2, sessionType: 'fysisk', duration: 60, focusArea: 'Styrke', period: 'G', notes: 'Core og underkropp' },
    { daysAgo: 3, sessionType: 'golfslag', duration: 120, focusArea: 'Short game', period: 'G', notes: 'Bunker og chipping' },
    { daysAgo: 4, sessionType: 'spill', duration: 180, focusArea: 'Banespill', period: 'G', notes: '9 hull på Oslo GK' },
    { daysAgo: 5, sessionType: 'teknikk', duration: 90, focusArea: 'Putting', period: 'G', notes: 'Gate drill og lag putting' },

    // Week 2
    { daysAgo: 7, sessionType: 'teknikk', duration: 90, focusArea: 'Jern', period: 'G', notes: '9-shot drill med 7-iron' },
    { daysAgo: 8, sessionType: 'fysisk', duration: 45, focusArea: 'Mobilitet', period: 'G', notes: 'Hip og thoracic mobility' },
    { daysAgo: 9, sessionType: 'golfslag', duration: 90, focusArea: 'Wedge', period: 'G', notes: 'Distance control 50-100m' },
    { daysAgo: 10, sessionType: 'mental', duration: 30, focusArea: 'Visualisering', period: 'G', notes: 'Pre-shot rutine øving' },
    { daysAgo: 11, sessionType: 'spill', duration: 240, focusArea: 'Konkurranse', period: 'G', notes: '18 hull simulert turnering' },
    { daysAgo: 12, sessionType: 'teknikk', duration: 60, focusArea: 'Driver', period: 'G', notes: 'Speed training' },

    // Week 3
    { daysAgo: 14, sessionType: 'teknikk', duration: 90, focusArea: 'Short game', period: 'G', notes: 'Up and down challenge' },
    { daysAgo: 15, sessionType: 'fysisk', duration: 60, focusArea: 'Power', period: 'G', notes: 'Med ball throws og jumps' },
    { daysAgo: 16, sessionType: 'golfslag', duration: 120, focusArea: 'Approach', period: 'G', notes: 'GIR simulering' },
    { daysAgo: 17, sessionType: 'teknikk', duration: 90, focusArea: 'Putting', period: 'G', notes: 'Pressure putt challenge' },
    { daysAgo: 18, sessionType: 'spill', duration: 180, focusArea: 'Strategi', period: 'G', notes: 'Course management fokus' },

    // Week 4
    { daysAgo: 21, sessionType: 'teknikk', duration: 90, focusArea: 'Driver', period: 'G', notes: 'Fairway accuracy' },
    { daysAgo: 22, sessionType: 'fysisk', duration: 60, focusArea: 'Styrke', period: 'G', notes: 'Full body workout' },
    { daysAgo: 23, sessionType: 'golfslag', duration: 90, focusArea: 'Bunker', period: 'G', notes: 'Bunker splash drill' },
    { daysAgo: 24, sessionType: 'teknikk', duration: 60, focusArea: 'Jern', period: 'G', notes: 'Shot shaping' },
    { daysAgo: 25, sessionType: 'spill', duration: 240, focusArea: 'Konkurranse', period: 'G', notes: '18 hull med statistikk' },

    // Week 5 (oldest)
    { daysAgo: 28, sessionType: 'teknikk', duration: 90, focusArea: 'Wedge', period: 'G', notes: 'Flop shots og lob' },
    { daysAgo: 29, sessionType: 'fysisk', duration: 45, focusArea: 'Mobilitet', period: 'G', notes: 'Recovery og stretching' },
    { daysAgo: 30, sessionType: 'mental', duration: 30, focusArea: 'Focus', period: 'G', notes: 'Breathing exercises' },
  ];

  let sessionsCreated = 0;
  for (const session of sessions) {
    const sessionDate = pastDate(session.daysAgo);

    const existing = await prisma.trainingSession.findFirst({
      where: {
        playerId: player.id,
        sessionDate: sessionDate,
      },
    });

    if (!existing) {
      await prisma.trainingSession.create({
        data: {
          playerId: player.id,
          coachId: session.daysAgo % 3 === 0 ? coach.id : null, // Coach present every 3rd session
          sessionType: session.sessionType,
          sessionDate,
          duration: session.duration,
          focusArea: session.focusArea,
          period: session.period,
          intensity: Math.floor(Math.random() * 2) + 3, // 3-4
          learningPhase: ['L2', 'L3', 'L3', 'L4'][Math.floor(Math.random() * 4)],
          clubSpeed: 'CS90',
          notes: session.notes,
        },
      });
      sessionsCreated++;
    }
  }
  console.log(`   ✅ Created ${sessionsCreated} training sessions`);

  // ============================================
  // TRAINING STATS (Weekly & Monthly)
  // ============================================
  const year = now.getFullYear();
  const currentWeek = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  // Create weekly stats for last 8 weeks
  let weeklyStatsCreated = 0;
  for (let i = 0; i < 8; i++) {
    const weekNumber = currentWeek - i;
    if (weekNumber < 1) continue;

    const weekStart = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const existing = await prisma.weeklyTrainingStats.findFirst({
      where: {
        playerId: player.id,
        year,
        weekNumber,
      },
    });

    if (!existing) {
      await prisma.weeklyTrainingStats.create({
        data: {
          playerId: player.id,
          year,
          weekNumber,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          plannedSessions: 6,
          completedSessions: 5 + Math.floor(Math.random() * 2),
          skippedSessions: Math.floor(Math.random() * 2),
          completionRate: 80 + Math.random() * 20,
          plannedMinutes: 540,
          actualMinutes: 450 + Math.floor(Math.random() * 120),
          sessionTypeBreakdown: {
            teknikk: { sessions: 2, minutes: 180 },
            golfslag: { sessions: 1, minutes: 120 },
            spill: { sessions: 1, minutes: 180 },
            fysisk: { sessions: 1, minutes: 60 },
            mental: { sessions: 0, minutes: 0 },
          },
          learningPhaseMinutes: { L2: 90, L3: 180, L4: 90 },
          avgQuality: 3.5 + Math.random(),
          period: 'G',
        },
      });
      weeklyStatsCreated++;
    }
  }
  console.log(`   ✅ Created ${weeklyStatsCreated} weekly stats`);

  // Create monthly stats for last 3 months
  let monthlyStatsCreated = 0;
  for (let i = 0; i < 3; i++) {
    const month = now.getMonth() - i;
    const statsMonth = month < 0 ? 12 + month : month;
    const statsYear = month < 0 ? year - 1 : year;

    const monthStart = new Date(statsYear, statsMonth, 1);
    const monthEnd = new Date(statsYear, statsMonth + 1, 0);

    const existing = await prisma.monthlyTrainingStats.findFirst({
      where: {
        playerId: player.id,
        year: statsYear,
        month: statsMonth + 1,
      },
    });

    if (!existing) {
      const completedSessions = 20 + Math.floor(Math.random() * 5);
      const totalMinutes = 1800 + Math.floor(Math.random() * 400);
      await prisma.monthlyTrainingStats.create({
        data: {
          playerId: player.id,
          year: statsYear,
          month: statsMonth + 1,
          totalSessions: 24,
          completedSessions,
          completionRate: 80 + Math.random() * 18,
          totalMinutes,
          avgMinutesPerSession: totalMinutes / completedSessions,
          avgMinutesPerDay: totalMinutes / 30,
          sessionTypeBreakdown: {
            teknikk: { sessions: 8, minutes: 720 },
            golfslag: { sessions: 4, minutes: 480 },
            spill: { sessions: 4, minutes: 720 },
            fysisk: { sessions: 6, minutes: 360 },
            mental: { sessions: 2, minutes: 60 },
          },
          avgQuality: 3.5 + Math.random() * 1.2,
          testsCompleted: Math.floor(Math.random() * 5),
          testsPassed: Math.floor(Math.random() * 4),
        },
      });
      monthlyStatsCreated++;
    }
  }
  console.log(`   ✅ Created ${monthlyStatsCreated} monthly stats`);
}
