/**
 * WAGR Rankings Import Script
 *
 * Imports World Amateur Golf Ranking data from CSV files
 * Source: https://wagr.com
 */

import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';


interface WagrCsvRow {
  rank: number;
  move: string;
  country: string;
  playerName: string;
  divisor: number;
  pointsAverage: number;
}

function parseMove(move: string): { previousRank: number | null; rankChange: number | null } {
  if (!move || move === '-' || move === 'NEW') {
    return { previousRank: null, rankChange: null };
  }

  // Parse movement like "+5" or "-3"
  const parsed = parseInt(move, 10);
  if (!isNaN(parsed)) {
    return { previousRank: null, rankChange: parsed };
  }

  return { previousRank: null, rankChange: null };
}

function getCountryCode(country: string): string | null {
  // Common country mappings
  const countryCodes: Record<string, string> = {
    'Norway': 'NOR',
    'Sweden': 'SWE',
    'Denmark': 'DEN',
    'Finland': 'FIN',
    'United States': 'USA',
    'England': 'ENG',
    'Scotland': 'SCO',
    'Ireland': 'IRL',
    'Germany': 'GER',
    'France': 'FRA',
    'Spain': 'ESP',
    'Italy': 'ITA',
    'Australia': 'AUS',
    'New Zealand': 'NZL',
    'Japan': 'JPN',
    'Korea': 'KOR',
    'South Korea': 'KOR',
    'China': 'CHN',
    'Chinese Taipei': 'TPE',
    'Thailand': 'THA',
    'Mexico': 'MEX',
    'Canada': 'CAN',
    'South Africa': 'RSA',
    'Netherlands': 'NED',
    'Belgium': 'BEL',
    'Austria': 'AUT',
    'Switzerland': 'SUI',
    'Czech Republic': 'CZE',
    'Poland': 'POL',
    'Portugal': 'POR',
    'Argentina': 'ARG',
    'Brazil': 'BRA',
    'Chile': 'CHI',
    'Colombia': 'COL',
    'India': 'IND',
    'Philippines': 'PHI',
    'Singapore': 'SIN',
    'Malaysia': 'MAS',
    'Indonesia': 'INA',
    'Wales': 'WAL',
    'Northern Ireland': 'NIR',
  };

  return countryCodes[country] || null;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseWagrCsv(filePath: string): WagrCsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);

  const rows: WagrCsvRow[] = [];

  for (const line of dataLines) {
    const columns = parseCsvLine(line);

    if (columns.length < 6) continue;

    // CSV format: "Rank","Move","Ctry","Player","Divisor","Pts Avg"
    const [rankStr, move, country, playerName, divisorStr, ptsAvgStr] = columns;

    const rank = parseInt(rankStr, 10);
    const divisor = parseFloat(divisorStr);
    const pointsAverage = parseFloat(ptsAvgStr);

    if (isNaN(rank) || isNaN(divisor) || isNaN(pointsAverage)) {
      console.warn(`Skipping invalid row: ${line}`);
      continue;
    }

    rows.push({
      rank,
      move,
      country,
      playerName,
      divisor,
      pointsAverage
    });
  }

  return rows;
}

async function importWagrRankings(
  filePath: string,
  gender: 'M' | 'F',
  rankingYear: number = 2025
): Promise<number> {
  console.log(`\nImporting ${gender === 'M' ? 'Men' : 'Women'} WAGR rankings from ${filePath}...`);

  const rows = parseWagrCsv(filePath);
  console.log(`Parsed ${rows.length} players`);

  let imported = 0;
  let errors = 0;

  // Process in batches of 100
  const batchSize = 100;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const createData: Prisma.WagrRankingCreateManyInput[] = batch.map(row => {
      const { previousRank, rankChange } = parseMove(row.move);

      return {
        rank: row.rank,
        previousRank,
        rankChange,
        playerName: row.playerName,
        country: row.country,
        countryCode: getCountryCode(row.country),
        pointsAverage: new Prisma.Decimal(row.pointsAverage),
        divisor: new Prisma.Decimal(row.divisor),
        gender,
        rankingYear,
        rankingWeek: null
      };
    });

    try {
      const result = await prisma.wagrRanking.createMany({
        data: createData,
        skipDuplicates: true
      });

      imported += result.count;

      if ((i + batchSize) % 500 === 0 || i + batchSize >= rows.length) {
        console.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} (${imported} imported)`);
      }
    } catch (error) {
      console.error(`Error in batch starting at ${i}:`, error);
      errors++;
    }
  }

  console.log(`✓ Completed: ${imported} players imported (${errors} batch errors)`);
  return imported;
}

async function main() {
  console.log('=== WAGR Rankings Import ===\n');

  // Data folder relative to project root
  const dataDir = path.resolve(__dirname, '../../../../data/wagr');

  // Define file paths
  const menFile = path.join(dataDir, 'Men_Ranking_FilteredBy_Year_2025.csv');
  const womenFile = path.join(dataDir, 'Women_Ranking_FilteredBy_Year_2025.csv');

  // Check files exist
  if (!fs.existsSync(menFile)) {
    console.error(`Men's ranking file not found: ${menFile}`);
    console.error('Expected location: <project-root>/data/wagr/');
    process.exit(1);
  }

  if (!fs.existsSync(womenFile)) {
    console.error(`Women's ranking file not found: ${womenFile}`);
    console.error('Expected location: <project-root>/data/wagr/');
    process.exit(1);
  }

  // Clear existing data for 2025
  console.log('Clearing existing 2025 WAGR data...');
  const deleted = await prisma.wagrRanking.deleteMany({
    where: { rankingYear: 2025 }
  });
  console.log(`Deleted ${deleted.count} existing records`);

  // Import both files
  const menCount = await importWagrRankings(menFile, 'M', 2025);
  const womenCount = await importWagrRankings(womenFile, 'F', 2025);

  console.log('\n=== Import Summary ===');
  console.log(`Men:   ${menCount.toLocaleString()} players`);
  console.log(`Women: ${womenCount.toLocaleString()} players`);
  console.log(`Total: ${(menCount + womenCount).toLocaleString()} players`);

  // Show Norwegian players
  console.log('\n=== Norwegian Players ===');

  const norwegianPlayers = await prisma.wagrRanking.findMany({
    where: {
      country: 'Norway',
      rankingYear: 2025
    },
    orderBy: [
      { gender: 'asc' },
      { rank: 'asc' }
    ]
  });

  console.log(`\nFound ${norwegianPlayers.length} Norwegian players:\n`);

  const men = norwegianPlayers.filter(p => p.gender === 'M');
  const women = norwegianPlayers.filter(p => p.gender === 'F');

  console.log('Men:');
  men.slice(0, 10).forEach(p => {
    console.log(`  #${p.rank}: ${p.playerName} (${p.pointsAverage} pts avg)`);
  });
  if (men.length > 10) console.log(`  ... and ${men.length - 10} more`);

  console.log('\nWomen:');
  women.slice(0, 10).forEach(p => {
    console.log(`  #${p.rank}: ${p.playerName} (${p.pointsAverage} pts avg)`);
  });
  if (women.length > 10) console.log(`  ... and ${women.length - 10} more`);
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
