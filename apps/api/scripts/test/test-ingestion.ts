/**
 * Test script for Focus Engine ingestion
 * Run with: npx tsx scripts/test-ingestion.ts [path-to-archive.zip]
 */

import prisma from '../prisma/client';
import { IngestionService } from '../src/domain/focus-engine/ingestion.service';
import { WeightsService } from '../src/domain/focus-engine/weights.service';
import * as path from 'path';
import * as fs from 'fs';


async function main() {
  console.log('=== Focus Engine Ingestion Test ===\n');

  // Allow path override via command line argument
  const defaultZipPath = path.resolve(__dirname, '../../../../Archive.zip');
  const zipPath = process.argv[2] || defaultZipPath;

  if (!fs.existsSync(zipPath)) {
    console.error(`Archive not found: ${zipPath}`);
    console.error('Usage: npx tsx scripts/test-ingestion.ts [path-to-archive.zip]');
    process.exit(1);
  }

  // Step 1: Ingest data
  console.log('1. Ingesting DataGolf data from Archive.zip...');
  const ingestionService = new IngestionService(prisma);

  try {
    const result = await ingestionService.ingest(zipPath);

    if (result.success) {
      console.log('   ✅ Ingestion successful!');
      console.log(`   - Source version: ${result.sourceVersion}`);
      console.log(`   - Files processed: ${result.stats.filesProcessed.join(', ')}`);
      console.log(`   - Player seasons upserted: ${result.stats.playerSeasons.upserted}`);
      console.log(`   - Approach skills upserted: ${result.stats.approachSkills.upserted}`);
    } else {
      console.log('   ❌ Ingestion failed:');
      result.errors.forEach(err => console.log(`      - ${err}`));
    }
  } catch (error) {
    console.error('   ❌ Ingestion error:', error);
    throw error;
  }

  // Step 2: Verify data in database
  console.log('\n2. Verifying database records...');

  const playerSeasonCount = await prisma.dgPlayerSeason.count();
  const approachSkillCount = await prisma.dgApproachSkillL24.count();
  const mappingCount = await prisma.testComponentMapping.count();

  console.log(`   - Player seasons: ${playerSeasonCount}`);
  console.log(`   - Approach skills: ${approachSkillCount}`);
  console.log(`   - Test-component mappings: ${mappingCount}`);

  // Step 3: Show sample data
  console.log('\n3. Sample player data (top 5 by total SG):');
  const topPlayers = await prisma.dgPlayerSeason.findMany({
    where: { season: 2025 },
    orderBy: { totalTrue: 'desc' },
    take: 5,
  });

  topPlayers.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.playerId}: ${Number(p.totalTrue).toFixed(3)} total SG`);
  });

  // Step 4: Compute weights
  console.log('\n4. Computing component weights...');
  const weightsService = new WeightsService(prisma);

  try {
    const weights = await weightsService.computeWeights({ windowSize: 3, minPlayers: 50 });
    console.log('   ✅ Weights computed:');
    console.log(`   - OTT: ${(weights.wOtt * 100).toFixed(1)}%`);
    console.log(`   - APP: ${(weights.wApp * 100).toFixed(1)}%`);
    console.log(`   - ARG: ${(weights.wArg * 100).toFixed(1)}%`);
    console.log(`   - PUTT: ${(weights.wPutt * 100).toFixed(1)}%`);
    console.log(`   - Window: ${weights.windowStartSeason}-${weights.windowEndSeason}`);
  } catch (error) {
    console.error('   ❌ Weights computation error:', error);
  }

  // Step 5: Verify active weights in DB
  console.log('\n5. Active weights in database:');
  const activeWeight = await prisma.dgComponentWeight.findFirst({
    where: { isActive: true },
    orderBy: { computedAt: 'desc' },
  });

  if (activeWeight) {
    console.log(`   - OTT: ${(Number(activeWeight.wOtt) * 100).toFixed(1)}%`);
    console.log(`   - APP: ${(Number(activeWeight.wApp) * 100).toFixed(1)}%`);
    console.log(`   - ARG: ${(Number(activeWeight.wArg) * 100).toFixed(1)}%`);
    console.log(`   - PUTT: ${(Number(activeWeight.wPutt) * 100).toFixed(1)}%`);
  } else {
    console.log('   No active weights found');
  }

  console.log('\n=== Test Complete ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
