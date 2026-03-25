/**
 * Export DataGolf Data to CSV
 *
 * Usage: npx tsx scripts/export-datagolf-csv.ts
 *
 * Exports all DataGolf tables to CSV files in ./exports/datagolf/
 */

import prisma from '../prisma/client';
import * as fs from 'fs';
import * as path from 'path';


const EXPORT_DIR = path.join(__dirname, '../exports/datagolf');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function cleanValue(val: any): string {
  if (val === null || val === undefined) return '';

  // Convert to string first
  let str = String(val);

  // Remove surrounding quotes that Prisma Decimal adds
  str = str.replace(/^"+|"+$/g, '');

  // Handle Date objects
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]; // Just date part
  }

  // Handle objects (including Prisma Decimal)
  if (typeof val === 'object' && !(val instanceof Date)) {
    // Check if it's a Decimal-like object with toNumber
    if (typeof val.toNumber === 'function') {
      return val.toNumber().toString();
    }
    // For JSON objects
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }

  // Clean up any remaining quote issues for strings
  if (typeof val === 'string') {
    str = val.replace(/^"+|"+$/g, '');
  }

  // Quote strings with special chars
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function toCSV(data: any[], columns: string[]): string {
  if (data.length === 0) return columns.join(',') + '\n';

  const header = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => cleanValue(row[col])).join(',')
  );

  return header + '\n' + rows.join('\n');
}

async function exportSkillRatings() {
  console.log('📊 Exporting Skill Ratings...');

  const data = await prisma.dataGolfPlayer.findMany({
    orderBy: [{ tour: 'asc' }, { sgTotal: 'desc' }]
  });

  const columns = [
    'dataGolfId', 'playerName', 'tour', 'season',
    'sgTotal', 'sgOffTee', 'sgApproach', 'sgAroundGreen', 'sgPutting',
    'drivingDistance', 'drivingAccuracy', 'girPercent', 'scramblingPercent', 'puttsPerRound',
    'lastSynced'
  ];

  const csv = toCSV(data, columns);
  const filePath = path.join(EXPORT_DIR, 'datagolf_skill_ratings.csv');
  fs.writeFileSync(filePath, csv);

  console.log(`  ✅ Exported ${data.length} players to ${filePath}`);
  return data.length;
}

async function exportApproachSkill() {
  console.log('🎯 Exporting Approach Skill Data...');

  const data = await prisma.dataGolfApproachSkill.findMany({
    orderBy: [{ tour: 'asc' }, { playerName: 'asc' }]
  });

  const columns = [
    'dataGolfId', 'playerName', 'tour', 'season',
    'skill50to75', 'skill75to100', 'skill100to125',
    'skill125to150', 'skill150to175', 'skill175to200', 'skill200plus',
    'lastSynced'
  ];

  const csv = toCSV(data, columns);
  const filePath = path.join(EXPORT_DIR, 'datagolf_approach_skill.csv');
  fs.writeFileSync(filePath, csv);

  console.log(`  ✅ Exported ${data.length} approach skill records to ${filePath}`);
  return data.length;
}

async function exportHistoricalRounds() {
  console.log('📚 Exporting Historical Rounds...');

  const data = await prisma.dataGolfHistoricalRound.findMany({
    orderBy: [{ tour: 'asc' }, { roundDate: 'desc' }]
  });

  const columns = [
    'dataGolfId', 'playerName', 'tour', 'season',
    'eventId', 'eventName', 'roundNum', 'courseName', 'coursePar', 'roundDate',
    'score', 'toPar',
    'sgTotal', 'sgOffTee', 'sgApproach', 'sgAroundGreen', 'sgPutting',
    'drivingDist', 'drivingAcc', 'gir', 'scrambling'
  ];

  const csv = toCSV(data, columns);
  const filePath = path.join(EXPORT_DIR, 'datagolf_historical_rounds.csv');
  fs.writeFileSync(filePath, csv);

  console.log(`  ✅ Exported ${data.length} historical rounds to ${filePath}`);
  return data.length;
}

async function exportSchedule() {
  console.log('📅 Exporting Tournament Schedule...');

  const data = await prisma.dataGolfSchedule.findMany({
    orderBy: [{ tour: 'asc' }, { startDate: 'asc' }]
  });

  const columns = [
    'eventId', 'eventName', 'course', 'tour', 'season',
    'startDate', 'endDate', 'purse', 'winner',
    'lastSynced'
  ];

  const csv = toCSV(data, columns);
  const filePath = path.join(EXPORT_DIR, 'datagolf_schedule.csv');
  fs.writeFileSync(filePath, csv);

  console.log(`  ✅ Exported ${data.length} tournaments to ${filePath}`);
  return data.length;
}

async function exportPlayerDecompositions() {
  console.log('🔬 Exporting Player Decompositions...');

  const data = await prisma.dataGolfPlayerDecomposition.findMany({
    orderBy: [{ tour: 'asc' }, { dgRank: 'asc' }]
  });

  const columns = [
    'dataGolfId', 'playerName', 'tour', 'season',
    'dgRank', 'owgrRank', 'trueSkill',
    'sgTotal', 'sgOffTee', 'sgApproach', 'sgAroundGreen', 'sgPutting',
    'drivingDistance', 'drivingAccuracy',
    'lastSynced'
  ];

  const csv = toCSV(data, columns);
  const filePath = path.join(EXPORT_DIR, 'datagolf_player_decompositions.csv');
  fs.writeFileSync(filePath, csv);

  console.log(`  ✅ Exported ${data.length} decompositions to ${filePath}`);
  return data.length;
}

async function exportTourAverages() {
  console.log('📈 Exporting Tour Averages...');

  const data = await prisma.dataGolfTourAverage.findMany({
    orderBy: [{ tour: 'asc' }, { season: 'desc' }]
  });

  // Flatten the stats JSON for CSV
  const flatData = data.map(row => ({
    tour: row.tour,
    season: row.season,
    ...row.stats as object,
    updatedAt: row.updatedAt
  }));

  const columns = [
    'tour', 'season',
    'avgSgTotal', 'avgSgOtt', 'avgSgApp', 'avgSgArg', 'avgSgPutt',
    'avgDrivingDistance', 'avgDrivingAccuracy', 'playerCount',
    'updatedAt'
  ];

  const csv = toCSV(flatData, columns);
  const filePath = path.join(EXPORT_DIR, 'datagolf_tour_averages.csv');
  fs.writeFileSync(filePath, csv);

  console.log(`  ✅ Exported ${data.length} tour averages to ${filePath}`);
  return data.length;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('             DataGolf CSV Export Script');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Export directory: ${EXPORT_DIR}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const stats = {
    skillRatings: 0,
    approachSkill: 0,
    historicalRounds: 0,
    schedule: 0,
    decompositions: 0,
    tourAverages: 0
  };

  try {
    stats.skillRatings = await exportSkillRatings();
    stats.approachSkill = await exportApproachSkill();
    stats.historicalRounds = await exportHistoricalRounds();
    stats.schedule = await exportSchedule();
    stats.decompositions = await exportPlayerDecompositions();
    stats.tourAverages = await exportTourAverages();

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                     EXPORT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Skill Ratings:        ${stats.skillRatings.toString().padStart(6)} records`);
    console.log(`Approach Skill:       ${stats.approachSkill.toString().padStart(6)} records`);
    console.log(`Historical Rounds:    ${stats.historicalRounds.toString().padStart(6)} records`);
    console.log(`Schedule:             ${stats.schedule.toString().padStart(6)} records`);
    console.log(`Decompositions:       ${stats.decompositions.toString().padStart(6)} records`);
    console.log(`Tour Averages:        ${stats.tourAverages.toString().padStart(6)} records`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`TOTAL:                ${total.toString().padStart(6)} records`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ All files exported to: ${EXPORT_DIR}`);
    console.log('\nGenerated files:');
    console.log('  - datagolf_skill_ratings.csv');
    console.log('  - datagolf_approach_skill.csv');
    console.log('  - datagolf_historical_rounds.csv');
    console.log('  - datagolf_schedule.csv');
    console.log('  - datagolf_player_decompositions.csv');
    console.log('  - datagolf_tour_averages.csv');

  } catch (error: any) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
