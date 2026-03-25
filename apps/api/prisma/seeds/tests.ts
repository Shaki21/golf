/**
 * Seed Tests
 * IUP Golf test protocols and sample results
 */

import prisma from '../client';


export async function seedTests() {
  console.log('📋 Seeding tests...');

  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'ak-golf-academy' },
  });

  const player = await prisma.player.findFirst({
    where: { email: 'player@demo.com' },
  });

  if (!tenant || !player) {
    throw new Error('Tenant or player not found. Run demo-users seed first.');
  }

  // IUP Test Protocols (Test 1-20)
  const testProtocols = [
    {
      testNumber: 1,
      name: 'Driver Clubhead Speed',
      category: 'speed',
      testType: 'speed_measurement',
      protocolName: 'Driver Speed Protocol',
      description: 'Mål clubhead speed med driver. 5 slag, beste resultat teller. Bruk launch monitor.',
      testDetails: {
        equipment: ['Driver', 'Launch Monitor'],
        warmup: '10 sving uten ball',
        attempts: 5,
        restBetween: '30 sekunder',
        scoring: 'Høyeste hastighet i mph',
      },
    },
    {
      testNumber: 2,
      name: '7-Iron Clubhead Speed',
      category: 'speed',
      testType: 'speed_measurement',
      protocolName: '7-Iron Speed Protocol',
      description: 'Mål clubhead speed med 7-iron. 5 slag, beste resultat teller.',
      testDetails: {
        equipment: ['7-Iron', 'Launch Monitor'],
        warmup: '10 sving',
        attempts: 5,
        restBetween: '30 sekunder',
        scoring: 'Høyeste hastighet i mph',
      },
    },
    {
      testNumber: 3,
      name: 'Driver Carry Distance',
      category: 'distance',
      testType: 'distance_measurement',
      protocolName: 'Driver Carry Protocol',
      description: 'Mål carry distance med driver. 5 slag, gjennomsnitt av 3 beste.',
      testDetails: {
        equipment: ['Driver', 'Launch Monitor'],
        warmup: '5 slag',
        attempts: 5,
        scoring: 'Gjennomsnitt av 3 beste carry (meter)',
      },
    },
    {
      testNumber: 4,
      name: 'Proximity to Efficiency Index (PEI)',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'PEI Test Protocol',
      description: 'Slå 10 slag fra 100m. Mål avstand til flagget. Beregn PEI.',
      testDetails: {
        equipment: ['Wedge', 'Laser'],
        distance: 100,
        attempts: 10,
        scoring: 'PEI = Gjennomsnittlig avstand / Forventet avstand',
      },
    },
    {
      testNumber: 5,
      name: 'Fairway Accuracy',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'Fairway Accuracy Protocol',
      description: 'Slå 10 driver mot fairway-target. Tell treff innenfor 30m bredde.',
      testDetails: {
        equipment: ['Driver'],
        attempts: 10,
        targetWidth: 30,
        scoring: 'Prosent treff',
      },
    },
    {
      testNumber: 6,
      name: 'Greens in Regulation Simulation',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'GIR Simulation Protocol',
      description: 'Slå approach shots til 9 ulike avstander. Tell treff på green.',
      testDetails: {
        equipment: ['Irons', 'Wedges'],
        distances: [80, 100, 120, 140, 160, 180, 90, 110, 130],
        scoring: 'Prosent greens hit',
      },
    },
    {
      testNumber: 7,
      name: '8 Ballstest',
      category: 'short_game',
      testType: 'scoring_test',
      protocolName: 'Up & Down Protocol',
      description: 'Chip og putt fra 10 posisjoner. Tell opp-og-ned prosent.',
      testDetails: {
        equipment: ['Wedges', 'Putter'],
        positions: 10,
        scoring: 'Prosent up & down',
      },
    },
    {
      testNumber: 8,
      name: 'Approach 25m (PEI)',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'Approach 25m Protocol',
      description: 'Slå 10 slag fra 25m. Mål avstand til flagg. Beregn PEI.',
      testDetails: {
        equipment: ['Wedge', 'Laseravstandsmåler', 'Måltavle eller flagg'],
        attempts: 10,
        scoring: 'PEI (Proximity to Efficiency Index)',
      },
    },
    {
      testNumber: 9,
      name: 'Approach 50m (PEI)',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'Approach 50m Protocol',
      description: 'Slå 10 slag fra 50m. Mål avstand til flagg. Beregn PEI.',
      testDetails: {
        equipment: ['Wedge', 'Laseravstandsmåler', 'Måltavle eller flagg'],
        attempts: 10,
        scoring: 'PEI (Proximity to Efficiency Index)',
      },
    },
    {
      testNumber: 10,
      name: 'Approach 75m (PEI)',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'Approach 75m Protocol',
      description: 'Slå 10 slag fra 75m. Mål avstand til flagg. Beregn PEI.',
      testDetails: {
        equipment: ['Wedge eller kort jern', 'Laseravstandsmåler', 'Måltavle eller flagg'],
        attempts: 10,
        scoring: 'PEI (Proximity to Efficiency Index)',
      },
    },
    {
      testNumber: 11,
      name: 'Approach 100m (PEI)',
      category: 'accuracy',
      testType: 'accuracy_measurement',
      protocolName: 'Approach 100m Protocol',
      description: 'Slå 10 slag fra 100m. Mål avstand til flagg. Beregn PEI.',
      testDetails: {
        equipment: ['Wedge eller kort jern', 'Laseravstandsmåler', 'Måltavle eller flagg'],
        attempts: 10,
        scoring: 'PEI (Proximity to Efficiency Index)',
      },
    },
    {
      testNumber: 12,
      name: 'Med Ball Throw',
      category: 'physical',
      testType: 'physical_test',
      protocolName: 'Rotational Power Protocol',
      description: 'Kast med ball (3kg) med rotasjon. Mål avstand.',
      testDetails: {
        equipment: ['3kg Medicine Ball'],
        attempts: 3,
        scoring: 'Beste kast (meter)',
      },
    },
    {
      testNumber: 13,
      name: 'Vertical Jump',
      category: 'physical',
      testType: 'physical_test',
      protocolName: 'Jump Height Protocol',
      description: 'Stående vertikalhopp. Mål hopphøyde.',
      testDetails: {
        equipment: ['Vertec eller app'],
        attempts: 3,
        scoring: 'Beste hopp (cm)',
      },
    },
    {
      testNumber: 14,
      name: 'Hip Rotation',
      category: 'physical',
      testType: 'mobility_test',
      protocolName: 'Hip Mobility Protocol',
      description: 'Mål intern hofterotasjon i liggende posisjon.',
      testDetails: {
        equipment: ['Goniometer'],
        scoring: 'Grader rotasjon (venstre + høyre)',
      },
    },
    {
      testNumber: 15,
      name: 'Putting 1-3 meter',
      category: 'putting',
      testType: 'putting_test',
      protocolName: 'Medium Putt Protocol',
      description: 'Putt 20 baller fra 3 meter. Tell holed putts.',
      testDetails: {
        equipment: ['Putter', '20 baller', 'Målebånd'],
        distance: 3,
        attempts: 20,
        scoring: 'Prosent holed',
      },
    },
    {
      testNumber: 16,
      name: 'Lengdekontroll',
      category: 'putting',
      testType: 'putting_test',
      protocolName: 'Long Putt Protocol',
      description: 'Putt 20 baller fra 6 meter. Tell holed putts.',
      testDetails: {
        equipment: ['Putter', '20 baller', 'Målebånd'],
        distance: 6,
        attempts: 20,
        scoring: 'Prosent holed',
      },
    },
    {
      testNumber: 17,
      name: 'On-Course Scoring - 9 Hull',
      category: 'scoring',
      testType: 'scoring_test',
      protocolName: '9-Hole Score Protocol',
      description: 'Spill 9 hull under testforhold. Noter score.',
      testDetails: {
        equipment: ['Full bag'],
        scoring: 'Score relativt til par',
      },
    },
    {
      testNumber: 18,
      name: 'Mental Focus Test',
      category: 'mental',
      testType: 'mental_test',
      protocolName: 'Concentration Protocol',
      description: 'Putt serie med økende press. Evaluer mental kontroll.',
      testDetails: {
        equipment: ['Putter'],
        scoring: 'Skala 1-10 på fokus og kontroll',
      },
    },
    {
      testNumber: 19,
      name: 'Pre-Shot Routine Consistency',
      category: 'mental',
      testType: 'mental_test',
      protocolName: 'Routine Protocol',
      description: 'Observer og time pre-shot rutine over 10 slag. Mål konsistens.',
      testDetails: {
        equipment: ['Stoppeklokke'],
        attempts: 10,
        scoring: 'Standardavvik i tid (sekunder)',
      },
    },
    {
      testNumber: 20,
      name: 'Competition Simulation',
      category: 'mental',
      testType: 'scoring_test',
      protocolName: 'Pressure Test Protocol',
      description: 'Spill 3 hull med simulert konkurransepress. Score og mental evaluering.',
      testDetails: {
        equipment: ['Full bag'],
        scoring: 'Score + mental rating (1-10)',
      },
    },
  ];

  // Create or update tests
  let testsCreated = 0;
  let testsUpdated = 0;
  for (const test of testProtocols) {
    const existing = await prisma.test.findFirst({
      where: {
        tenantId: tenant.id,
        testNumber: test.testNumber,
      },
    });

    if (existing) {
      // Update existing test
      await prisma.test.update({
        where: { id: existing.id },
        data: {
          ...test,
        },
      });
      testsUpdated++;
    } else {
      // Create new test
      await prisma.test.create({
        data: {
          tenantId: tenant.id,
          ...test,
        },
      });
      testsCreated++;
    }
  }
  console.log(`   ✅ Created ${testsCreated} test protocols, updated ${testsUpdated}`);

  // Create sample test results for the demo player
  const tests = await prisma.test.findMany({
    where: { tenantId: tenant.id },
  });

  const sampleResults = [
    { testNumber: 1, value: 105.5, results: { speed: 105.5, attempts: [102, 104, 105.5, 103, 101] } },
    { testNumber: 2, value: 82.3, results: { speed: 82.3, attempts: [80, 81, 82.3, 79, 81] } },
    { testNumber: 3, value: 245, results: { carry: 245, attempts: [240, 245, 248, 235, 242] } },
    { testNumber: 4, value: 0.85, pei: 0.85, results: { avgDistance: 8.5, attempts: [7, 9, 8, 10, 8, 9, 7, 8, 10, 9] } },
    { testNumber: 5, value: 70, results: { hits: 7, attempts: 10 } },
    { testNumber: 9, value: 85, results: { holed: 17, attempts: 20 } },
    { testNumber: 10, value: 55, results: { holed: 11, attempts: 20 } },
    { testNumber: 12, value: 8.5, results: { distance: 8.5, attempts: [8.2, 8.5, 8.3] } },
    { testNumber: 13, value: 58, results: { height: 58, attempts: [55, 58, 56] } },
    { testNumber: 16, value: 120, results: { seconds: 120 } },
  ];

  let resultsCreated = 0;
  for (const result of sampleResults) {
    const test = tests.find(t => t.testNumber === result.testNumber);
    if (test) {
      const existing = await prisma.testResult.findFirst({
        where: {
          testId: test.id,
          playerId: player.id,
        },
      });

      if (!existing) {
        await prisma.testResult.create({
          data: {
            testId: test.id,
            playerId: player.id,
            testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            value: result.value,
            pei: result.pei,
            results: result.results,
            passed: true,
          },
        });
        resultsCreated++;
      }
    }
  }
  console.log(`   ✅ Created ${resultsCreated} test results for demo player`);
}
