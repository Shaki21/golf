/**
 * Add Demo Training Sessions
 * Adds planned training sessions for the demo player for the next 2 weeks
 */

import prisma from '../prisma/client';

async function addDemoTrainingSessions() {
  console.log('📅 Adding demo training sessions...\n');

  try {
    // Find the demo player
    const player = await prisma.player.findFirst({
      where: { email: 'player@demo.com' },
    });

    const coach = await prisma.coach.findFirst({
      where: { email: 'coach@demo.com' },
    });

    if (!player || !coach) {
      throw new Error('Player or coach not found. Run demo-users seed first.');
    }

    console.log(`Found player: ${player.firstName} ${player.lastName} (${player.email})`);
    console.log(`Found coach: ${coach.firstName} ${coach.lastName} (${coach.email})\n`);

    const now = new Date();

    // Helper to create future dates
    const futureDate = (daysAhead: number, hour: number = 10) => {
      const date = new Date(now);
      date.setDate(date.getDate() + daysAhead);
      date.setHours(hour, 0, 0, 0);
      return date;
    };

    // ============================================
    // PLANNED TRAINING SESSIONS (Next 14 days)
    // ============================================
    const plannedSessions = [
      // Week 1
      { daysAhead: 1, sessionType: 'teknikk', duration: 90, focusArea: 'Driver', period: 'G', notes: 'Fokus på alignment og posture', hour: 10 },
      { daysAhead: 2, sessionType: 'fysisk', duration: 60, focusArea: 'Styrke', period: 'G', notes: 'Core og underkropp', hour: 14 },
      { daysAhead: 3, sessionType: 'golfslag', duration: 120, focusArea: 'Short game', period: 'G', notes: 'Chipping og bunker', hour: 10 },
      { daysAhead: 4, sessionType: 'teknikk', duration: 90, focusArea: 'Jern', period: 'G', notes: '7-iron accuracy drill', hour: 15 },
      { daysAhead: 5, sessionType: 'spill', duration: 180, focusArea: 'Banespill', period: 'G', notes: '9 hull med fokus på strategi', hour: 9 },
      { daysAhead: 6, sessionType: 'teknikk', duration: 90, focusArea: 'Putting', period: 'G', notes: 'Distance control og lag putting', hour: 10 },

      // Week 2
      { daysAhead: 8, sessionType: 'teknikk', duration: 90, focusArea: 'Driver', period: 'G', notes: 'Speed training', hour: 10 },
      { daysAhead: 9, sessionType: 'fysisk', duration: 60, focusArea: 'Mobilitet', period: 'G', notes: 'Thoracic mobility og hip rotation', hour: 14 },
      { daysAhead: 10, sessionType: 'golfslag', duration: 120, focusArea: 'Wedge', period: 'G', notes: 'Distance control 50-100m', hour: 10 },
      { daysAhead: 11, sessionType: 'mental', duration: 30, focusArea: 'Visualisering', period: 'G', notes: 'Pre-shot rutine', hour: 16 },
      { daysAhead: 12, sessionType: 'spill', duration: 240, focusArea: 'Konkurranse', period: 'G', notes: '18 hull simulert turnering', hour: 9 },
      { daysAhead: 13, sessionType: 'teknikk', duration: 90, focusArea: 'Short game', period: 'G', notes: 'Up and down challenge', hour: 10 },
    ];

    let sessionsCreated = 0;
    console.log('Creating planned training sessions...\n');

    for (const session of plannedSessions) {
      const sessionDate = futureDate(session.daysAhead, session.hour);

      // Check if session already exists
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
            coachId: session.daysAhead % 3 === 0 ? coach.id : null, // Coach present every 3rd session
            sessionType: session.sessionType,
            sessionDate,
            duration: session.duration,
            focusArea: session.focusArea,
            period: session.period,
            intensity: 3,
            learningPhase: 'L2',
            clubSpeed: 'CS90',
            notes: session.notes,
          },
        });
        console.log(`✅ ${sessionDate.toLocaleDateString('no-NO')} ${sessionDate.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })} - ${session.sessionType} (${session.focusArea})`);
        sessionsCreated++;
      } else {
        console.log(`⏭️  ${sessionDate.toLocaleDateString('no-NO')} - Økt eksisterer allerede`);
      }
    }

    console.log(`\n✅ Created ${sessionsCreated} planned training sessions`);
    console.log(`📊 Demo player now has training sessions for the next 2 weeks\n`);

  } catch (error) {
    console.error('❌ Error adding demo training sessions:', error);
    throw error;
  }
}

// Run the script
addDemoTrainingSessions()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
