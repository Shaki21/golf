/**
 * Seed Skole
 * Fag, Skoletimer, og Oppgaver for elev-spillere
 */

import prisma from '../client';


export async function seedSkole() {
  console.log('🎓 Seeding skole data...');

  // Get the player user (students are players who are also users)
  const playerUser = await prisma.user.findFirst({
    where: { email: 'player@demo.com' },
  });

  if (!playerUser) {
    throw new Error('Player user not found. Run demo-users seed first.');
  }

  // Get the player profile for this user
  const player = await prisma.player.findFirst({
    where: { userId: playerUser.id },
  });

  if (!player) {
    throw new Error('Player profile not found for player@demo.com. Run demo-users seed first.');
  }

  const playerId = player.id;
  const tenantId = player.tenantId;

  // ============================================
  // FAG (Subjects)
  // ============================================
  const fagData = [
    { navn: 'Matematikk', larer: 'Erik Mathisen', rom: 'A203', farge: '#3B82F6' },
    { navn: 'Norsk', larer: 'Anne Nordmann', rom: 'B105', farge: '#10B981' },
    { navn: 'Engelsk', larer: 'John Smith', rom: 'A201', farge: '#8B5CF6' },
    { navn: 'Naturfag', larer: 'Kari Forsker', rom: 'LAB1', farge: '#F59E0B' },
    { navn: 'Samfunnsfag', larer: 'Per Samfunn', rom: 'C102', farge: '#EF4444' },
    { navn: 'Kroppsøving', larer: 'Lars Aktiv', rom: 'GYM', farge: '#EC4899' },
    { navn: 'Idrettsfag', larer: 'Anders Kristiansen', rom: 'GOLF', farge: '#14B8A6' },
  ];

  const createdFag: { [key: string]: string } = {};
  let fagCreated = 0;

  for (const fag of fagData) {
    const existing = await prisma.fag.findFirst({
      where: {
        playerId,
        tenantId,
        navn: fag.navn,
      },
    });

    if (!existing) {
      const created = await prisma.fag.create({
        data: {
          playerId,
          tenantId,
          ...fag,
        },
      });
      createdFag[fag.navn] = created.id;
      fagCreated++;
    } else {
      createdFag[fag.navn] = existing.id;
    }
  }
  console.log(`   ✅ Created ${fagCreated} fag`);

  // ============================================
  // SKOLETIMER (School Schedule)
  // ============================================
  const timeplan = [
    // Mandag
    { fag: 'Matematikk', ukedag: 'mandag', startTid: '08:15', sluttTid: '09:45' },
    { fag: 'Norsk', ukedag: 'mandag', startTid: '10:00', sluttTid: '11:30' },
    { fag: 'Idrettsfag', ukedag: 'mandag', startTid: '12:30', sluttTid: '14:45' },

    // Tirsdag
    { fag: 'Engelsk', ukedag: 'tirsdag', startTid: '08:15', sluttTid: '09:45' },
    { fag: 'Naturfag', ukedag: 'tirsdag', startTid: '10:00', sluttTid: '11:30' },
    { fag: 'Samfunnsfag', ukedag: 'tirsdag', startTid: '12:30', sluttTid: '14:00' },

    // Onsdag
    { fag: 'Matematikk', ukedag: 'onsdag', startTid: '08:15', sluttTid: '09:45' },
    { fag: 'Kroppsøving', ukedag: 'onsdag', startTid: '10:00', sluttTid: '11:30' },
    { fag: 'Idrettsfag', ukedag: 'onsdag', startTid: '12:30', sluttTid: '15:00' },

    // Torsdag
    { fag: 'Norsk', ukedag: 'torsdag', startTid: '08:15', sluttTid: '09:45' },
    { fag: 'Engelsk', ukedag: 'torsdag', startTid: '10:00', sluttTid: '11:30' },
    { fag: 'Naturfag', ukedag: 'torsdag', startTid: '12:30', sluttTid: '14:00' },

    // Fredag
    { fag: 'Samfunnsfag', ukedag: 'fredag', startTid: '08:15', sluttTid: '09:45' },
    { fag: 'Matematikk', ukedag: 'fredag', startTid: '10:00', sluttTid: '11:30' },
    { fag: 'Idrettsfag', ukedag: 'fredag', startTid: '12:30', sluttTid: '15:00' },
  ];

  let timerCreated = 0;
  for (const time of timeplan) {
    const fagId = createdFag[time.fag];
    if (!fagId) continue;

    const existing = await prisma.skoletime.findFirst({
      where: {
        fagId,
        ukedag: time.ukedag,
        startTid: time.startTid,
      },
    });

    if (!existing) {
      await prisma.skoletime.create({
        data: {
          fagId,
          ukedag: time.ukedag,
          startTid: time.startTid,
          sluttTid: time.sluttTid,
        },
      });
      timerCreated++;
    }
  }
  console.log(`   ✅ Created ${timerCreated} skoletimer`);

  // ============================================
  // GET TEST PROTOCOLS for test-linked assignments
  // ============================================
  const tests = await prisma.test.findMany({
    where: { tenantId },
    select: { id: true, testNumber: true, name: true }
  });

  const testMap: { [key: number]: string } = {};
  tests.forEach(test => {
    testMap[test.testNumber] = test.id;
  });

  // ============================================
  // OPPGAVER (Assignments)
  // ============================================
  const now = new Date();

  const oppgaver = [
    // Matematikk
    {
      fag: 'Matematikk',
      tittel: 'Kapittel 4 - Funksjoner',
      beskrivelse: 'Løs oppgave 4.1-4.20 i læreboka',
      frist: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      prioritet: 'high',
    },
    {
      fag: 'Matematikk',
      tittel: 'Prøve - Algebra',
      beskrivelse: 'Forberedelse til prøve om algebra og ligninger',
      frist: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      prioritet: 'high',
    },

    // Norsk
    {
      fag: 'Norsk',
      tittel: 'Bokrapport - Doppler',
      beskrivelse: 'Skriv bokrapport på 1000 ord om Doppler av Erlend Loe',
      frist: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      prioritet: 'medium',
    },
    {
      fag: 'Norsk',
      tittel: 'Muntlig presentasjon',
      beskrivelse: 'Forbered 5 min presentasjon om norsk idrett',
      frist: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      prioritet: 'high',
    },

    // Engelsk
    {
      fag: 'Engelsk',
      tittel: 'Essay - Sports in Society',
      beskrivelse: 'Write a 500 word essay about the role of sports in modern society',
      frist: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      prioritet: 'medium',
    },

    // Naturfag
    {
      fag: 'Naturfag',
      tittel: 'Lab-rapport - Fysikk',
      beskrivelse: 'Skriv rapport fra fysikk-labben om bevegelse og akselerasjon',
      frist: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      prioritet: 'medium',
    },

    // Samfunnsfag
    {
      fag: 'Samfunnsfag',
      tittel: 'Gruppeprosjekt - Økonomi',
      beskrivelse: 'Forbered presentasjon om norsk økonomi med gruppen',
      frist: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      prioritet: 'low',
    },

    // Idrettsfag
    {
      fag: 'Idrettsfag',
      tittel: 'Treningsdagbok - Desember',
      beskrivelse: 'Oppdater treningsdagbok med alle økter i desember',
      frist: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      prioritet: 'high',
    },
    {
      fag: 'Idrettsfag',
      tittel: 'Refleksjonsnotat - Sesongmål',
      beskrivelse: 'Skriv refleksjon om sesongmålene og progresjon',
      frist: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      prioritet: 'medium',
    },
    {
      fag: 'Idrettsfag',
      tittel: 'Videoanalyse - Sving',
      beskrivelse: 'Gjør videoanalyse av svinget ditt og identifiser forbedringsområder',
      frist: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      prioritet: 'high',
    },

    // TEST-LINKED ASSIGNMENTS (Idrettsfag)
    {
      fag: 'Idrettsfag',
      tittel: 'Forberedelse til Test 1 - Driver Speed',
      beskrivelse: 'Tren på driver clubhead speed. Fokuser på timing og rotasjon. Test er onsdag.',
      frist: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      testDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Day after assignment deadline
      prioritet: 'high',
      estimatedMinutes: 90,
      testNumber: 1, // Link to Test 1
    },
    {
      fag: 'Idrettsfag',
      tittel: 'Analyse av Test 4 Resultater - PEI',
      beskrivelse: 'Gjennomgå dine siste Test 4 (PEI) resultater og identifiser forbedringsområder for nøyaktighet',
      frist: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      prioritet: 'medium',
      estimatedMinutes: 60,
      testNumber: 4, // Link to Test 4
    },
    {
      fag: 'Idrettsfag',
      tittel: '8 Ballstest - Forberedelse',
      beskrivelse: 'Øv på kort-spill scenarier. Test er planlagt for neste uke.',
      frist: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      testDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      prioritet: 'high',
      estimatedMinutes: 120,
      testNumber: 7, // Link to Test 7
    },
    {
      fag: 'Kroppsøving',
      tittel: 'Fysisk Test - Smidighet',
      beskrivelse: 'Forbered deg til smidighetstest. Gjør utstrekkingsøvelser daglig.',
      frist: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      testDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      prioritet: 'medium',
      estimatedMinutes: 45,
      testNumber: 12, // Link to Test 12 (Flexibility)
    },
  ];

  let oppgaverCreated = 0;
  for (const oppgave of oppgaver as any[]) {
    const fagId = createdFag[oppgave.fag];
    if (!fagId) continue;

    const existing = await prisma.oppgave.findFirst({
      where: {
        fagId,
        tittel: oppgave.tittel,
      },
    });

    if (!existing) {
      // Get testId if testNumber is provided
      const testId = oppgave.testNumber ? testMap[oppgave.testNumber] : undefined;

      await prisma.oppgave.create({
        data: {
          fagId,
          testId,
          tittel: oppgave.tittel,
          beskrivelse: oppgave.beskrivelse,
          frist: oppgave.frist,
          testDate: oppgave.testDate,
          prioritet: oppgave.prioritet,
          estimatedMinutes: oppgave.estimatedMinutes,
          status: 'pending',
        },
      });
      oppgaverCreated++;
    }
  }
  console.log(`   ✅ Created ${oppgaverCreated} oppgaver`);
  console.log(`   📊 ${oppgaver.filter((o: any) => o.testNumber).length} assignments linked to test protocols`);
}
