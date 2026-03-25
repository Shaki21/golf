/**
 * DataGolf Performance Import Script
 *
 * Imports historical season-level strokes gained data from DataGolf CSV files.
 * Data covers 2000-2025+ with ~400 players per season.
 *
 * CSV Format:
 * player_name,events_played,wins,x_wins,x_wins_majors,rounds_played,
 * shotlink_played,putt_true,arg_true,app_true,ott_true,t2g_true,total_true
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


interface DgPerformanceRow {
  player_name: string;
  events_played: number;
  wins: number;
  x_wins: number;
  x_wins_majors: number;
  rounds_played: number;
  shotlink_played: number;
  putt_true: number;
  arg_true: number;
  app_true: number;
  ott_true: number;
  t2g_true: number;
  total_true: number;
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

function parseNumber(value: string): number | null {
  if (!value || value === '' || value === 'NA') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function parsePerformanceCsv(filePath: string): DgPerformanceRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);
  const rows: DgPerformanceRow[] = [];

  for (const line of dataLines) {
    const columns = parseCsvLine(line);

    if (columns.length < 13) continue;

    rows.push({
      player_name: columns[0].replace(/"/g, ''),
      events_played: parseInt(columns[1]) || 0,
      wins: parseInt(columns[2]) || 0,
      x_wins: parseNumber(columns[3]) || 0,
      x_wins_majors: parseNumber(columns[4]) || 0,
      rounds_played: parseInt(columns[5]) || 0,
      shotlink_played: parseInt(columns[6]) || 0,
      putt_true: parseNumber(columns[7]) || 0,
      arg_true: parseNumber(columns[8]) || 0,
      app_true: parseNumber(columns[9]) || 0,
      ott_true: parseNumber(columns[10]) || 0,
      t2g_true: parseNumber(columns[11]) || 0,
      total_true: parseNumber(columns[12]) || 0,
    });
  }

  return rows;
}

function extractYearFromFilename(filename: string): number {
  const match = filename.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

function getFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 16);
}

async function importPerformanceFile(
  filePath: string
): Promise<{ success: boolean; players: number; season: number }> {
  const filename = path.basename(filePath);
  const season = extractYearFromFilename(filename);

  if (!season) {
    console.log(`  ✗ Could not extract year from ${filename}`);
    return { success: false, players: 0, season: 0 };
  }

  const rows = parsePerformanceCsv(filePath);
  const sourceVersion = getFileHash(filePath);

  // Delete existing data for this season
  await prisma.dgPlayerSeason.deleteMany({
    where: { season },
  });

  // Insert all rows
  const createData: Prisma.DgPlayerSeasonCreateManyInput[] = rows.map(row => ({
    playerId: row.player_name,
    season,
    ottTrue: row.ott_true ? new Prisma.Decimal(row.ott_true) : null,
    appTrue: row.app_true ? new Prisma.Decimal(row.app_true) : null,
    argTrue: row.arg_true ? new Prisma.Decimal(row.arg_true) : null,
    puttTrue: row.putt_true ? new Prisma.Decimal(row.putt_true) : null,
    t2gTrue: row.t2g_true ? new Prisma.Decimal(row.t2g_true) : null,
    totalTrue: row.total_true ? new Prisma.Decimal(row.total_true) : null,
    roundsPlayed: row.rounds_played,
    eventsPlayed: row.events_played,
    wins: row.wins,
    xWins: row.x_wins ? new Prisma.Decimal(row.x_wins) : null,
    sourceVersion,
  }));

  await prisma.dgPlayerSeason.createMany({
    data: createData,
    skipDuplicates: true,
  });

  return { success: true, players: rows.length, season };
}

async function main() {
  const args = process.argv.slice(2);

  // Data folder relative to project root
  const dataDir = path.resolve(__dirname, '../../../../data/datagolf/performance');

  if (!fs.existsSync(dataDir)) {
    console.log(`Data directory not found: ${dataDir}`);
    console.log('Expected location: <project-root>/data/datagolf/performance/');
    return;
  }

  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('dg_performance_') && f.endsWith('.csv'))
    .map(f => path.join(dataDir, f))
    .sort();

  if (files.length === 0) {
    console.log(`No dg_performance_*.csv files found in ${dataDir}`);
    return;
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     DataGolf Performance Import                            ║');
  console.log('║     Importing season-level strokes gained data             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nFound ${files.length} files to import\n`);

  let totalPlayers = 0;
  let successCount = 0;

  for (const filePath of files) {
    const result = await importPerformanceFile(filePath);

    if (result.success) {
      console.log(`  ✓ ${result.season}: ${result.players} players`);
      totalPlayers += result.players;
      successCount++;
    } else {
      console.log(`  ✗ ${path.basename(filePath)}: Failed`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  IMPORT FULLFØRT');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Sesonger:      ${successCount}`);
  console.log(`  Spiller-år:    ${totalPlayers.toLocaleString()}`);
  console.log('════════════════════════════════════════════════════════════');

  // Show database stats
  const count = await prisma.dgPlayerSeason.count();
  const seasons = await prisma.dgPlayerSeason.groupBy({
    by: ['season'],
    _count: true,
    orderBy: { season: 'desc' },
  });

  console.log(`\n  Database status:`);
  console.log(`    dg_player_seasons: ${count.toLocaleString()} rader`);
  console.log(`    Sesonger: ${seasons.map(s => s.season).slice(0, 5).join(', ')}...`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
