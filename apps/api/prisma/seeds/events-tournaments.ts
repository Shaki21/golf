/**
 * Seed Events and Tournaments
 * Samlinger, treningsøkter, og turneringer
 */

import prisma from '../client';


export async function seedEventsAndTournaments() {
  console.log('🏆 Seeding events and tournaments...');

  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'ak-golf-academy' },
  });

  const player = await prisma.player.findFirst({
    where: { email: 'player@demo.com' },
  });

  const coach = await prisma.coach.findFirst({
    where: { email: 'coach@demo.com' },
  });

  if (!tenant || !player || !coach) {
    throw new Error('Tenant, player or coach not found. Run demo-users seed first.');
  }

  const now = new Date();
  const year = now.getFullYear();

  // Helper for creating dates
  const createDate = (daysFromNow: number, hour: number = 10) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  // ============================================
  // SAMLINGER (Training Camps)
  // ============================================
  const samlinger = [
    {
      title: 'Vintersamling Oslo GK',
      description: 'Innendørs trening med fokus på teknikk og fysisk forberedelse til sesong.',
      eventType: 'samling',
      startTime: createDate(14, 9),
      endTime: createDate(16, 16),
      location: 'Oslo Golf Center',
      locationDetails: { address: 'Bogstad, Oslo', indoor: true },
      maxParticipants: 20,
    },
    {
      title: 'Påskesamling Spania',
      description: 'Treningsleir i Spania med fokus på banespill og konkurranseforberedelse.',
      eventType: 'samling',
      startTime: createDate(90, 8),
      endTime: createDate(96, 18),
      location: 'La Manga Club, Spania',
      locationDetails: { address: 'La Manga, Spain', courses: ['North', 'South', 'West'] },
      maxParticipants: 12,
    },
    {
      title: 'Sommersamling Miklagard',
      description: 'Intensiv treningsuke før konkurransesesongen.',
      eventType: 'samling',
      startTime: createDate(180, 8),
      endTime: createDate(184, 17),
      location: 'Miklagard Golf',
      locationDetails: { address: 'Kløfta', facilities: ['range', 'short game', 'course'] },
      maxParticipants: 16,
    },
  ];

  let samlingerCreated = 0;
  for (const samling of samlinger) {
    const existing = await prisma.event.findFirst({
      where: {
        tenantId: tenant.id,
        title: samling.title,
      },
    });

    if (!existing) {
      const event = await prisma.event.create({
        data: {
          tenantId: tenant.id,
          coachId: coach.id,
          status: 'scheduled',
          ...samling,
        },
      });

      // Add player as participant
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          playerId: player.id,
          status: 'confirmed',
        },
      });

      samlingerCreated++;
    }
  }
  console.log(`   ✅ Created ${samlingerCreated} samlinger`);

  // ============================================
  // TURNERINGER (Tournaments)
  // ============================================
  const tournaments = [
    {
      event: {
        title: 'Junior Tour - Runde 1',
        description: 'Første runde i Junior Tour 2025',
        eventType: 'tournament',
        startTime: createDate(30, 8),
        endTime: createDate(30, 18),
        location: 'Asker Golf Club',
      },
      tournament: {
        tournamentType: 'junior_tour',
        level: 'regional',
        courseName: 'Asker GK',
        par: 72,
        courseRating: 71.5,
        slopeRating: 129,
        format: 'strokeplay',
        numberOfRounds: 1,
        entryFee: 500,
      },
      importance: 'B',
    },
    {
      event: {
        title: 'NM Junior Kvalifisering',
        description: 'Kvalifisering til NM for juniorer',
        eventType: 'tournament',
        startTime: createDate(60, 7),
        endTime: createDate(61, 18),
        location: 'Bærum Golf Club',
      },
      tournament: {
        tournamentType: 'championship',
        level: 'national',
        courseName: 'Bærum GK',
        par: 71,
        courseRating: 72.8,
        slopeRating: 134,
        format: 'strokeplay',
        numberOfRounds: 2,
        entryFee: 1200,
      },
      importance: 'A',
    },
    {
      event: {
        title: 'Titleist Junior Championship',
        description: 'Prestisjefylt juniorurnering',
        eventType: 'tournament',
        startTime: createDate(100, 7),
        endTime: createDate(102, 18),
        location: 'Oslo Golf Club',
      },
      tournament: {
        tournamentType: 'invitational',
        level: 'national',
        courseName: 'Oslo GK',
        par: 72,
        courseRating: 73.2,
        slopeRating: 138,
        format: 'strokeplay',
        numberOfRounds: 3,
        entryFee: 1500,
        prizePool: 50000,
      },
      importance: 'A',
    },
    {
      event: {
        title: 'Junior Tour - Runde 2',
        description: 'Andre runde i Junior Tour 2025',
        eventType: 'tournament',
        startTime: createDate(75, 8),
        endTime: createDate(75, 18),
        location: 'Losby Golf Club',
      },
      tournament: {
        tournamentType: 'junior_tour',
        level: 'regional',
        courseName: 'Losby GK',
        par: 72,
        courseRating: 72.1,
        slopeRating: 131,
        format: 'strokeplay',
        numberOfRounds: 1,
        entryFee: 500,
      },
      importance: 'B',
    },
    {
      event: {
        title: 'NM Junior',
        description: 'Norgesmesterskap for juniorer',
        eventType: 'tournament',
        startTime: createDate(150, 7),
        endTime: createDate(153, 18),
        location: 'Stavanger Golf Club',
      },
      tournament: {
        tournamentType: 'championship',
        level: 'national',
        courseName: 'Stavanger GK',
        par: 72,
        courseRating: 74.0,
        slopeRating: 140,
        format: 'strokeplay',
        numberOfRounds: 4,
        entryFee: 2000,
        prizePool: 100000,
      },
      importance: 'A',
    },
    {
      event: {
        title: 'Junior Tour - Finale',
        description: 'Sesongavslutning Junior Tour',
        eventType: 'tournament',
        startTime: createDate(200, 8),
        endTime: createDate(201, 18),
        location: 'Holtsmark Golf Club',
      },
      tournament: {
        tournamentType: 'junior_tour',
        level: 'regional',
        courseName: 'Holtsmark GK',
        par: 72,
        courseRating: 71.8,
        slopeRating: 128,
        format: 'strokeplay',
        numberOfRounds: 2,
        entryFee: 750,
        prizePool: 20000,
      },
      importance: 'B',
    },
  ];

  let tournamentsCreated = 0;
  for (const t of tournaments) {
    const existing = await prisma.event.findFirst({
      where: {
        tenantId: tenant.id,
        title: t.event.title,
      },
    });

    if (!existing) {
      // Create event
      const event = await prisma.event.create({
        data: {
          tenantId: tenant.id,
          status: 'scheduled',
          ...t.event,
        },
      });

      // Create tournament
      await prisma.tournament.create({
        data: {
          eventId: event.id,
          ...t.tournament,
        },
      });

      // Add player as participant
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          playerId: player.id,
          status: 'registered',
        },
      });

      tournamentsCreated++;
    }
  }
  console.log(`   ✅ Created ${tournamentsCreated} tournaments`);

  // ============================================
  // TRENINGSØKTER EVENTS (Training Session Events)
  // ============================================
  const trainingEvents = [
    {
      title: 'Individuell treningsøkt',
      description: 'En-til-en trening med coach',
      eventType: 'training_individual',
      daysFromNow: 2,
      duration: 90,
    },
    {
      title: 'Gruppetrening - Short Game',
      description: 'Short game fokus i gruppe',
      eventType: 'training_group',
      daysFromNow: 4,
      duration: 120,
    },
    {
      title: 'Individuell treningsøkt',
      description: 'Teknikkgjennomgang driver',
      eventType: 'training_individual',
      daysFromNow: 7,
      duration: 60,
    },
    {
      title: 'Gruppetrening - Putting',
      description: 'Putting workshop',
      eventType: 'training_group',
      daysFromNow: 9,
      duration: 90,
    },
    {
      title: 'On-Course Lesson',
      description: 'Banespill med coach',
      eventType: 'training_on_course',
      daysFromNow: 12,
      duration: 180,
    },
  ];

  let trainingEventsCreated = 0;
  for (const te of trainingEvents) {
    const startTime = createDate(te.daysFromNow, 10);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + te.duration);

    const existing = await prisma.event.findFirst({
      where: {
        tenantId: tenant.id,
        title: te.title,
        startTime: startTime,
      },
    });

    if (!existing) {
      const event = await prisma.event.create({
        data: {
          tenantId: tenant.id,
          coachId: coach.id,
          title: te.title,
          description: te.description,
          eventType: te.eventType,
          startTime,
          endTime,
          location: 'AK Golf Academy',
          status: 'scheduled',
          maxParticipants: te.eventType === 'training_individual' ? 1 : 6,
        },
      });

      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          playerId: player.id,
          status: 'confirmed',
        },
      });

      trainingEventsCreated++;
    }
  }
  console.log(`   ✅ Created ${trainingEventsCreated} training events`);
}
