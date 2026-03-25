/**
 * Golfbox Tournament Import Script
 *
 * Downloads historical tournament results from Golfbox API
 * and saves them to the IUP database.
 *
 * API Base: https://scores.golfbox.dk/Handlers/
 * Customer ID: 18 (Norges Golfforbund)
 *
 * Tour Categories:
 * - 7671: Srixon Tour (junior elite)
 * - 1276: Garmin NorgesCup (adult amateur)
 * - Nordic Golf League (pro tour events in Norway)
 */

import { PrismaClient, Prisma } from '@prisma/client';


const GOLFBOX_API_BASE = 'https://scores.golfbox.dk/Handlers';
const LANGUAGE = 1044; // Norwegian

// Tour category IDs
const TOUR_CATEGORIES = {
  SRIXON_TOUR: { id: 7671, name: 'srixon_tour' },
  GARMIN_NORGESCUP: { id: 1276, name: 'garmin_norgescup' },
  NORDIC_GOLF_LEAGUE: { id: 0, name: 'nordic_golf_league' }, // Pro tour - no NGF category ID
};

// ============================================
// SRIXON TOUR Competition IDs (Junior Elite)
// ============================================
const SRIXON_TOUR_IDS = {
  '2025': [
    4817097, // Srixon Tour 1 (U19) Bjaavann GK
    4826546, // Srixon Tour Future Camp Haugaland GK
    4759945, // Srixon Tour 2 Sola GK (Forus)
    4817104, // Srixon Tour 3 (JrNM Match) Elverum GK
    4759964, // Srixon Tour Future Camp Byneset GK
    4817196, // Srixon Tour 5 Kongsvinger GK
    4817268, // Srixon Tour 7 Stiklestad GK
  ],
  '2024': [
    4335288, // Srixon Tour 6 Nøtterøy GK
    4335303, // Srixon Tour 7 U19 Byneset GK
    4335312, // Srixon Tour 7 U15 Asker GK
  ],
  '2023': [
    3692019, // Srixon Tour 1 U19 Sola GK
    3895054, // Srixon Tour 1 U15 Bjaavann GK
    3895088, // Srixon Tour 5 Elverum GK
  ],
  '2022': [
    3182156, // Srixon Tour Finale Stavanger GK
  ],
  '2020': [
    2193454, // Srixon Tour Finale Kragerø GK
  ],
  '2019': [
    1759399, // Srixon Tour 2 Larvik GK
    1875699, // Srixon Tour Kjekstad/Asker GK (Men)
    2156433, // Srixon Tour Kjekstad/Asker GK (Women)
  ],
  '2017': [
    978205,  // Srixon Tour Byneset GK
    978225,  // Srixon Tour Holtsmark GK
  ],
};

// ============================================
// GARMIN NORGESCUP Competition IDs (Adult)
// ============================================
const GARMIN_NORGESCUP_IDS = {
  '2025': [
    4759973, // Garmin Norgescup 1 Meland GK
    4759977, // Garmin Norgescup 2 Nøtterøy GK
    4759980, // Garmin Norgescup 3 Holtsmark GK
  ],
  '2024': [
    4331158, // Garmin Norgescup 2 Moss & Rygge GK
  ],
  '2023': [
    3692337, // Garmin Norgescup 2 Norsjø GK
    3692340, // Garmin Norgescup 3 Stavanger GK
  ],
  '2016': [
    535183,  // Norgescup 1 Solastranden GK
  ],
};

// ============================================
// NORDIC GOLF LEAGUE Competition IDs (Pro Tour)
// Events held in Norway on the Scandinavian pro circuit
// ============================================
const NORDIC_GOLF_LEAGUE_IDS = {
  '2025': [
    4800231, // Holtsmark Open
  ],
  '2024': [
    4247929, // Gamle Fredrikstad Open
    4247946, // Holtsmark Open
  ],
  '2023': [
    3722401, // Gamle Fredrikstad Open
    // 3704270, // Nordic Golf League - Miklagard GK (no results data)
  ],
  '2022': [
    3266767, // Holtsmark Open
  ],
  // 2020-2021: Most Norwegian events cancelled due to COVID-19
  '2019': [
    1816457, // Gamle Fredrikstad Open (Winner: Niklas Nørgaard Møller -14)
    1816504, // Borre Open (Winner: Christopher Sahlström)
  ],
  '2018': [
    1407677, // Gamle Fredrikstad Open
  ],
};

interface GolfboxPlayer {
  RefID: number;
  FirstName: string;
  LastName: string;
  Nationality: string;
  Country: string;
  ClubName: string;
  BirthYear: number;
  Gender: number;
  HCP: string;
  MemberID: string;
  ResultSum?: {
    ActualText: string;
    ActualValue: number;
    ToParText: string;
    ToParValue: number;
  };
  Position?: {
    Actual: number;
    Calculated: string;
  };
  Rounds?: Record<string, GolfboxRound>;
}

interface GolfboxRound {
  Number: number;
  ScoringStatus: number;
  HoleScores?: Record<string, { Score?: { Value: number } }>;
}

interface GolfboxCompetition {
  Id: number;
  Name: string;
  Type: string;
  StartDate: string;
  EndDate: string;
  Category: number;
  Venue?: { Name: string; Latitude?: number; Longitude?: number };
}

interface GolfboxLeaderboardResponse {
  IsError?: boolean;
  ErrorMessage?: string;
  CompetitionData: GolfboxCompetition;
  Classes: Record<string, {
    RefId: number;
    Name: string;
    ShortName: string;
    Leaderboard: { Entries: Record<string, GolfboxPlayer> };
  }>;
}

/**
 * Fetch leaderboard data from Golfbox API
 */
async function fetchLeaderboard(competitionId: number): Promise<GolfboxLeaderboardResponse | null> {
  const url = `${GOLFBOX_API_BASE}/LeaderboardHandler/GetLeaderboard/CompetitionId/${competitionId}/language/${LANGUAGE}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonText = text.replace(/!0/g, 'true').replace(/!1/g, 'false');
    const data = JSON.parse(jsonText) as GolfboxLeaderboardResponse;

    if (data.IsError) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function parseGolfboxDate(dateStr: string): Date {
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));
  return new Date(year, month, day);
}

function extractRoundScores(rounds: Record<string, GolfboxRound> | undefined): Record<string, number> | null {
  if (!rounds) return null;

  const scores: Record<string, number> = {};
  for (const [key, round] of Object.entries(rounds)) {
    if (round.HoleScores) {
      let total = 0;
      for (const hole of Object.values(round.HoleScores)) {
        if (hole.Score?.Value) {
          total += hole.Score.Value;
        }
      }
      if (total > 0) {
        scores[`R${round.Number}`] = total;
      }
    }
  }
  return Object.keys(scores).length > 0 ? scores : null;
}

function parseHandicap(hcp: string | undefined): number | null {
  if (!hcp) return null;
  const parsed = parseFloat(hcp.replace(',', '.'));
  return isNaN(parsed) ? null : parsed / 1000; // Golfbox stores as integer * 1000
}

function getGenderFromCode(code: number | undefined): string | null {
  if (code === 1) return 'M';
  if (code === 2) return 'F';
  return null;
}

/**
 * Import a single competition to database
 */
async function importCompetition(
  competitionId: number,
  tourCategory: { id: number; name: string }
): Promise<{ success: boolean; players: number; name: string }> {
  const data = await fetchLeaderboard(competitionId);

  if (!data) {
    return { success: false, players: 0, name: '' };
  }

  const comp = data.CompetitionData;
  const startDate = parseGolfboxDate(comp.StartDate);
  const endDate = parseGolfboxDate(comp.EndDate);
  const year = startDate.getFullYear();

  // Extract all players
  const players: Array<{
    player: GolfboxPlayer;
    className: string;
    classShortName: string;
  }> = [];

  if (data.Classes) {
    for (const [, classData] of Object.entries(data.Classes)) {
      if (classData?.Leaderboard?.Entries) {
        for (const [, player] of Object.entries(classData.Leaderboard.Entries)) {
          players.push({
            player,
            className: classData.Name,
            classShortName: classData.ShortName,
          });
        }
      }
    }
  }

  const classes = [...new Set(players.map(p => p.classShortName))];

  // Upsert competition
  const competition = await prisma.golfboxCompetition.upsert({
    where: { golfboxId: competitionId },
    create: {
      golfboxId: competitionId,
      name: comp.Name,
      tourCategory: tourCategory.name,
      tourCategoryId: tourCategory.id,
      competitionType: comp.Type,
      venueName: comp.Venue?.Name || null,
      venueLatitude: comp.Venue?.Latitude ? new Prisma.Decimal(comp.Venue.Latitude) : null,
      venueLongitude: comp.Venue?.Longitude ? new Prisma.Decimal(comp.Venue.Longitude) : null,
      startDate,
      endDate,
      year,
      totalPlayers: players.length,
      classes,
    },
    update: {
      name: comp.Name,
      venueName: comp.Venue?.Name || null,
      venueLatitude: comp.Venue?.Latitude ? new Prisma.Decimal(comp.Venue.Latitude) : null,
      venueLongitude: comp.Venue?.Longitude ? new Prisma.Decimal(comp.Venue.Longitude) : null,
      totalPlayers: players.length,
      classes,
      updatedAt: new Date(),
    },
  });

  // Delete existing results for this competition (to handle updates)
  await prisma.golfboxResult.deleteMany({
    where: { competitionId: competition.id },
  });

  // Insert all player results
  const resultData: Prisma.GolfboxResultCreateManyInput[] = players.map(({ player, className, classShortName }) => ({
    competitionId: competition.id,
    golfboxPlayerId: player.RefID,
    firstName: player.FirstName?.trim() || '',
    lastName: player.LastName?.trim() || '',
    clubName: player.ClubName || null,
    nationality: player.Country || null,
    countryCode: player.Nationality || null,
    birthYear: player.BirthYear || null,
    gender: getGenderFromCode(player.Gender),
    memberId: player.MemberID || null,
    className,
    classShortName,
    position: player.Position?.Actual || null,
    totalStrokes: player.ResultSum?.ActualValue ? Math.round(player.ResultSum.ActualValue / 10000) : null,
    toPar: player.ResultSum?.ToParValue ? Math.round(player.ResultSum.ToParValue / 10000) : null,
    toParText: player.ResultSum?.ToParText || null,
    roundScores: extractRoundScores(player.Rounds),
    handicap: parseHandicap(player.HCP),
  }));

  await prisma.golfboxResult.createMany({
    data: resultData,
    skipDuplicates: true,
  });

  return { success: true, players: players.length, name: comp.Name };
}

/**
 * Import all competitions from a tour
 */
async function importTour(
  tourName: string,
  tourCategory: { id: number; name: string },
  competitionIds: Record<string, number[]>
): Promise<{ tournaments: number; players: number }> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${tourName}`);
  console.log(`${'='.repeat(60)}\n`);

  const allIds: number[] = [];
  for (const year of Object.keys(competitionIds).sort().reverse()) {
    allIds.push(...competitionIds[year]);
  }

  let totalTournaments = 0;
  let totalPlayers = 0;

  for (const competitionId of allIds) {
    const result = await importCompetition(competitionId, tourCategory);

    if (result.success) {
      console.log(`  ✓ [${competitionId}] ${result.name} - ${result.players} spillere`);
      totalTournaments++;
      totalPlayers += result.players;
    } else {
      console.log(`  ✗ [${competitionId}] Ikke funnet`);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n  ${tourName}: ${totalTournaments} turneringer, ${totalPlayers} spillere\n`);

  return { tournaments: totalTournaments, players: totalPlayers };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'save';

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Golfbox Tournament Import - Norwegian Golf             ║');
  console.log('║     Lagrer til database: golfbox_competitions/results      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (command === 'save' || command === 'all') {
    const srixon = await importTour(
      'SRIXON TOUR (Junior Elite)',
      TOUR_CATEGORIES.SRIXON_TOUR,
      SRIXON_TOUR_IDS
    );

    const norgescup = await importTour(
      'GARMIN NORGESCUP (Adult Amateur)',
      TOUR_CATEGORIES.GARMIN_NORGESCUP,
      GARMIN_NORGESCUP_IDS
    );

    const nordicLeague = await importTour(
      'NORDIC GOLF LEAGUE (Pro Tour - Norway)',
      TOUR_CATEGORIES.NORDIC_GOLF_LEAGUE,
      NORDIC_GOLF_LEAGUE_IDS
    );

    const totalTournaments = srixon.tournaments + norgescup.tournaments + nordicLeague.tournaments;
    const totalPlayers = srixon.players + norgescup.players + nordicLeague.players;

    console.log('═'.repeat(60));
    console.log('  IMPORT FULLFØRT');
    console.log('═'.repeat(60));
    console.log(`  Srixon Tour:        ${srixon.tournaments} turneringer, ${srixon.players} spillere`);
    console.log(`  Garmin NorgesCup:   ${norgescup.tournaments} turneringer, ${norgescup.players} spillere`);
    console.log(`  Nordic Golf League: ${nordicLeague.tournaments} turneringer, ${nordicLeague.players} spillere`);
    console.log(`  ─────────────────────────────────────────────────`);
    console.log(`  TOTALT:             ${totalTournaments} turneringer, ${totalPlayers} spillere`);
    console.log('═'.repeat(60));

    // Show database stats
    const compCount = await prisma.golfboxCompetition.count();
    const resultCount = await prisma.golfboxResult.count();
    console.log(`\n  Database status:`);
    console.log(`    golfbox_competitions: ${compCount} rader`);
    console.log(`    golfbox_results:      ${resultCount} rader\n`);

  } else if (command === 'stats') {
    // Show database statistics
    const competitions = await prisma.golfboxCompetition.findMany({
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { results: true } } },
    });

    console.log('\nLagrede turneringer:\n');
    for (const comp of competitions) {
      const date = comp.startDate.toISOString().split('T')[0];
      console.log(`  [${date}] ${comp.name} - ${comp._count.results} spillere (${comp.tourCategory})`);
    }

    const byYear = await prisma.golfboxCompetition.groupBy({
      by: ['year', 'tourCategory'],
      _count: true,
      orderBy: { year: 'desc' },
    });

    console.log('\nPer år:');
    for (const row of byYear) {
      console.log(`  ${row.year} ${row.tourCategory}: ${row._count} turneringer`);
    }

  } else if (command === 'clear') {
    console.log('\nSletter all Golfbox-data...');
    const deleted = await prisma.golfboxResult.deleteMany();
    const deletedComp = await prisma.golfboxCompetition.deleteMany();
    console.log(`  Slettet ${deletedComp.count} turneringer og ${deleted.count} resultater\n`);

  } else {
    console.log(`
Bruk:
  npx tsx scripts/golfbox-import.ts [kommando]

Kommandoer:
  save     Importer og lagre alle turneringer til database (standard)
  stats    Vis statistikk over lagrede turneringer
  clear    Slett all Golfbox-data fra databasen
`);
  }
}

export {
  fetchLeaderboard,
  importCompetition,
  importTour,
  SRIXON_TOUR_IDS,
  GARMIN_NORGESCUP_IDS,
  NORDIC_GOLF_LEAGUE_IDS,
  TOUR_CATEGORIES,
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
