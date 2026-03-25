/**
 * Comprehensive DataGolf Sync Script
 * Downloads ALL available data from DataGolf API
 *
 * Usage: npx tsx scripts/sync-all-datagolf.ts
 *
 * Endpoints synced:
 * - /preds/skill-ratings (player ratings)
 * - /preds/get-dg-rankings (rankings)
 * - /preds/player-decompositions (detailed breakdown)
 * - /preds/approach-skill (distance-based approach data)
 * - /get-schedule (tournament schedule)
 * - /historical-raw-data/rounds (historical round data)
 */

import prisma from '../../prisma/client';
import { DataGolfClient } from '../../src/integrations/datagolf/client';

const client = new DataGolfClient();

const TOURS = ['pga', 'euro', 'kft']; // PGA, DP World Tour, Korn Ferry
const CURRENT_SEASON = new Date().getFullYear();

// Helper function to safely parse dates
function parseDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

interface SyncStats {
  endpoint: string;
  recordsProcessed: number;
  errors: string[];
  duration: number;
}

async function syncSkillRatings(): Promise<SyncStats> {
  const stats: SyncStats = {
    endpoint: '/preds/skill-ratings',
    recordsProcessed: 0,
    errors: [],
    duration: 0,
  };

  const startTime = Date.now();
  console.log('\n📊 Syncing Skill Ratings...');

  for (const tour of TOURS) {
    try {
      console.log(`  → Fetching ${tour.toUpperCase()} skill ratings...`);
      const ratings = await client.getSkillRatings(tour);

      if (!Array.isArray(ratings)) {
        stats.errors.push(`${tour}: No data returned`);
        continue;
      }

      console.log(`    Found ${ratings.length} players`);

      for (const player of ratings) {
        try {
          await prisma.dataGolfPlayer.upsert({
            where: { dataGolfId: String(player.dg_id) },
            create: {
              dataGolfId: String(player.dg_id),
              playerName: player.player_name,
              sgTotal: player.sg_total,
              sgOffTee: player.sg_ott,
              sgApproach: player.sg_app,
              sgAroundGreen: player.sg_arg,
              sgPutting: player.sg_putt,
              drivingDistance: player.driving_dist,
              drivingAccuracy: player.driving_acc,
              tour: tour,
              season: CURRENT_SEASON,
              lastSynced: new Date(),
            },
            update: {
              playerName: player.player_name,
              sgTotal: player.sg_total,
              sgOffTee: player.sg_ott,
              sgApproach: player.sg_app,
              sgAroundGreen: player.sg_arg,
              sgPutting: player.sg_putt,
              drivingDistance: player.driving_dist,
              drivingAccuracy: player.driving_acc,
              tour: tour,
              season: CURRENT_SEASON,
              lastSynced: new Date(),
            },
          });
          stats.recordsProcessed++;
        } catch (error: any) {
          stats.errors.push(`Player ${player.player_name}: ${error.message}`);
        }
      }
    } catch (error: any) {
      stats.errors.push(`${tour}: ${error.message}`);
    }
  }

  stats.duration = Date.now() - startTime;
  console.log(`  ✅ Synced ${stats.recordsProcessed} players in ${stats.duration}ms`);
  return stats;
}

async function syncPlayerDecompositions(): Promise<SyncStats> {
  const stats: SyncStats = {
    endpoint: '/preds/player-decompositions',
    recordsProcessed: 0,
    errors: [],
    duration: 0,
  };

  const startTime = Date.now();
  console.log('\n🔬 Syncing Player Decompositions...');

  for (const tour of TOURS) {
    try {
      console.log(`  → Fetching ${tour.toUpperCase()} decompositions...`);
      const decompositions = await client.getPlayerDecompositions(tour);

      if (!Array.isArray(decompositions)) {
        stats.errors.push(`${tour}: No data returned`);
        continue;
      }

      console.log(`    Found ${decompositions.length} player decompositions`);

      for (const player of decompositions) {
        try {
          await prisma.dataGolfPlayerDecomposition.upsert({
            where: {
              dataGolfId_tour_season: {
                dataGolfId: String(player.dg_id),
                tour: tour,
                season: CURRENT_SEASON,
              },
            },
            create: {
              dataGolfId: String(player.dg_id),
              playerName: player.player_name,
              sgTotal: player.sg_total,
              sgOffTee: player.sg_ott,
              sgApproach: player.sg_app,
              sgAroundGreen: player.sg_arg,
              sgPutting: player.sg_putt,
              drivingDistance: player.driving_distance,
              drivingAccuracy: player.driving_accuracy,
              additionalData: player as any,
              tour: tour,
              season: CURRENT_SEASON,
              lastSynced: new Date(),
            },
            update: {
              playerName: player.player_name,
              sgTotal: player.sg_total,
              sgOffTee: player.sg_ott,
              sgApproach: player.sg_app,
              sgAroundGreen: player.sg_arg,
              sgPutting: player.sg_putt,
              drivingDistance: player.driving_distance,
              drivingAccuracy: player.driving_accuracy,
              additionalData: player as any,
              lastSynced: new Date(),
            },
          });
          stats.recordsProcessed++;
        } catch (error: any) {
          stats.errors.push(`Player ${player.player_name}: ${error.message}`);
        }
      }
    } catch (error: any) {
      stats.errors.push(`${tour}: ${error.message}`);
    }
  }

  stats.duration = Date.now() - startTime;
  console.log(`  ✅ Synced ${stats.recordsProcessed} decompositions in ${stats.duration}ms`);
  return stats;
}

async function syncApproachSkill(): Promise<SyncStats> {
  const stats: SyncStats = {
    endpoint: '/preds/approach-skill',
    recordsProcessed: 0,
    errors: [],
    duration: 0,
  };

  const startTime = Date.now();
  console.log('\n🎯 Syncing Approach Skill Data...');

  for (const tour of TOURS) {
    try {
      console.log(`  → Fetching ${tour.toUpperCase()} approach skill data...`);
      const approachData = await client.getApproachSkill(tour);

      if (!Array.isArray(approachData)) {
        stats.errors.push(`${tour}: No data returned`);
        continue;
      }

      console.log(`    Found ${approachData.length} players with approach data`);

      for (const player of approachData) {
        try {
          // DataGolf API uses different field names:
          // 50_100_fw_sg_per_shot, 100_150_fw_sg_per_shot, 150_200_fw_sg_per_shot, over_200_fw_sg_per_shot
          // We map these to our schema's distance buckets
          await prisma.dataGolfApproachSkill.upsert({
            where: {
              dataGolfId_tour_season: {
                dataGolfId: String(player.dg_id),
                tour: tour,
                season: CURRENT_SEASON,
              },
            },
            create: {
              dataGolfId: String(player.dg_id),
              playerName: player.player_name,
              // Map DataGolf buckets to our schema (storing SG per shot values)
              skill50to75: player['50_100_fw_sg_per_shot'],    // 50-100 yards from fairway
              skill75to100: player['50_100_fw_sg_per_shot'],   // Same bucket
              skill100to125: player['100_150_fw_sg_per_shot'], // 100-150 yards from fairway
              skill125to150: player['100_150_fw_sg_per_shot'], // Same bucket
              skill150to175: player['150_200_fw_sg_per_shot'], // 150-200 yards from fairway
              skill175to200: player['150_200_fw_sg_per_shot'], // Same bucket
              skill200plus: player['over_200_fw_sg_per_shot'], // Over 200 yards from fairway
              tour: tour,
              season: CURRENT_SEASON,
              lastSynced: new Date(),
            },
            update: {
              playerName: player.player_name,
              skill50to75: player['50_100_fw_sg_per_shot'],
              skill75to100: player['50_100_fw_sg_per_shot'],
              skill100to125: player['100_150_fw_sg_per_shot'],
              skill125to150: player['100_150_fw_sg_per_shot'],
              skill150to175: player['150_200_fw_sg_per_shot'],
              skill175to200: player['150_200_fw_sg_per_shot'],
              skill200plus: player['over_200_fw_sg_per_shot'],
              lastSynced: new Date(),
            },
          });
          stats.recordsProcessed++;
        } catch (error: any) {
          stats.errors.push(`Player ${player.player_name}: ${error.message}`);
        }
      }
    } catch (error: any) {
      stats.errors.push(`${tour}: ${error.message}`);
    }
  }

  stats.duration = Date.now() - startTime;
  console.log(`  ✅ Synced ${stats.recordsProcessed} approach skill records in ${stats.duration}ms`);
  return stats;
}

async function syncSchedule(): Promise<SyncStats> {
  const stats: SyncStats = {
    endpoint: '/get-schedule',
    recordsProcessed: 0,
    errors: [],
    duration: 0,
  };

  const startTime = Date.now();
  console.log('\n📅 Syncing Tournament Schedule...');

  // Sync current and previous year for historical data
  const years = [CURRENT_SEASON, CURRENT_SEASON - 1];

  for (const tour of TOURS) {
    for (const year of years) {
      try {
        console.log(`  → Fetching ${tour.toUpperCase()} ${year} schedule...`);
        const schedule = await client.getSchedule(tour, year);

        if (!Array.isArray(schedule)) {
          stats.errors.push(`${tour} ${year}: No data returned`);
          continue;
        }

        console.log(`    Found ${schedule.length} tournaments`);

        for (const event of schedule) {
          try {
            const startDate = parseDate(event.start_date);
            const endDate = parseDate(event.end_date);

            await prisma.dataGolfSchedule.upsert({
              where: {
                eventId_tour_season: {
                  eventId: String(event.event_id || event.dg_id || 'unknown'),
                  tour: tour,
                  season: year,
                },
              },
              create: {
                eventId: String(event.event_id || event.dg_id || 'unknown'),
                eventName: event.event_name || event.tournament || 'Unknown',
                course: event.course || null,
                startDate: startDate,
                endDate: endDate,
                tour: tour,
                season: year,
                lastSynced: new Date(),
              },
              update: {
                eventName: event.event_name || event.tournament || 'Unknown',
                course: event.course || null,
                startDate: startDate,
                endDate: endDate,
                lastSynced: new Date(),
              },
            });
            stats.recordsProcessed++;
          } catch (error: any) {
            stats.errors.push(`Event ${event.event_name}: ${error.message}`);
          }
        }
      } catch (error: any) {
        stats.errors.push(`${tour} ${year}: ${error.message}`);
      }
    }
  }

  stats.duration = Date.now() - startTime;
  console.log(`  ✅ Synced ${stats.recordsProcessed} tournaments in ${stats.duration}ms`);
  return stats;
}

async function syncHistoricalRounds(): Promise<SyncStats> {
  const stats: SyncStats = {
    endpoint: '/historical-raw-data/rounds',
    recordsProcessed: 0,
    errors: [],
    duration: 0,
  };

  const startTime = Date.now();
  console.log('\n📚 Syncing Historical Rounds (this may take a while)...');

  // Get events from the schedule we've already synced
  const years = [CURRENT_SEASON, CURRENT_SEASON - 1];

  for (const tour of ['pga', 'euro']) {
    for (const year of years) {
      try {
        // Get events from database
        const events = await prisma.dataGolfSchedule.findMany({
          where: {
            tour: tour,
            season: year,
            startDate: { lt: new Date() } // Only completed events
          },
          select: { eventId: true, eventName: true },
        });

        if (events.length === 0) {
          console.log(`  → No ${tour.toUpperCase()} ${year} events found in schedule`);
          continue;
        }

        console.log(`  → Fetching ${tour.toUpperCase()} ${year} historical rounds (${events.length} events)...`);

        let eventCount = 0;
        for (const event of events) {
          try {
            // Fetch rounds for this specific event
            const response = await client.getHistoricalRounds(tour, event.eventId, year);

            // The response has nested round data per player: { scores: [{ dg_id, player_name, round_1: {...}, round_2: {...} }] }
            if (!Array.isArray(response) || response.length === 0) continue;

            for (const playerData of response) {
              // Process each round (round_1 through round_4)
              for (let roundNum = 1; roundNum <= 4; roundNum++) {
                const roundKey = `round_${roundNum}` as keyof typeof playerData;
                const roundData = playerData[roundKey] as any;

                if (!roundData || typeof roundData !== 'object') continue;

                try {
                  await prisma.dataGolfHistoricalRound.upsert({
                    where: {
                      dataGolfId_eventId_roundNum: {
                        dataGolfId: String(playerData.dg_id),
                        eventId: event.eventId,
                        roundNum: roundNum,
                      },
                    },
                    create: {
                      dataGolfId: String(playerData.dg_id),
                      playerName: playerData.player_name,
                      eventId: event.eventId,
                      eventName: event.eventName,
                      roundNum: roundNum,
                      courseName: roundData.course_name,
                      coursePar: roundData.course_par,
                      roundDate: new Date(),
                      score: roundData.score,
                      toPar: roundData.score - (roundData.course_par || 72),
                      sgTotal: roundData.sg_total,
                      sgOffTee: roundData.sg_ott,
                      sgApproach: roundData.sg_app,
                      sgAroundGreen: roundData.sg_arg,
                      sgPutting: roundData.sg_putt,
                      drivingDist: roundData.driving_dist,
                      drivingAcc: roundData.driving_acc,
                      gir: roundData.gir,
                      scrambling: roundData.scrambling,
                      proxFairway: roundData.prox_fw,
                      proxRough: roundData.prox_rgh,
                      tour: tour,
                      season: year,
                    },
                    update: {
                      playerName: playerData.player_name,
                      eventName: event.eventName,
                      courseName: roundData.course_name,
                      coursePar: roundData.course_par,
                      score: roundData.score,
                      toPar: roundData.score - (roundData.course_par || 72),
                      sgTotal: roundData.sg_total,
                      sgOffTee: roundData.sg_ott,
                      sgApproach: roundData.sg_app,
                      sgAroundGreen: roundData.sg_arg,
                      sgPutting: roundData.sg_putt,
                      drivingDist: roundData.driving_dist,
                      drivingAcc: roundData.driving_acc,
                      gir: roundData.gir,
                      scrambling: roundData.scrambling,
                      proxFairway: roundData.prox_fw,
                      proxRough: roundData.prox_rgh,
                    },
                  });
                  stats.recordsProcessed++;
                } catch (error: any) {
                  // Skip individual errors
                }
              }
            }

            eventCount++;
            if (eventCount % 5 === 0) {
              console.log(`    Processed ${eventCount}/${events.length} events...`);
            }
          } catch (error: any) {
            // Some events may not have data, skip silently
          }
        }

        console.log(`    Completed ${tour.toUpperCase()} ${year}: ${eventCount} events processed`);
      } catch (error: any) {
        stats.errors.push(`${tour} ${year}: ${error.message}`);
      }
    }
  }

  stats.duration = Date.now() - startTime;
  console.log(`  ✅ Synced ${stats.recordsProcessed} historical rounds in ${stats.duration}ms`);
  return stats;
}

async function syncDGRankings(): Promise<SyncStats> {
  const stats: SyncStats = {
    endpoint: '/preds/get-dg-rankings',
    recordsProcessed: 0,
    errors: [],
    duration: 0,
  };

  const startTime = Date.now();
  console.log('\n🏆 Syncing DG Rankings...');

  try {
    const rankings = await client.getDGRankings();

    if (!Array.isArray(rankings)) {
      stats.errors.push('No rankings data returned');
      return stats;
    }

    console.log(`  Found ${rankings.length} ranked players`);

    for (const player of rankings) {
      try {
        // Update decomposition with ranking info
        await prisma.dataGolfPlayerDecomposition.upsert({
          where: {
            dataGolfId_tour_season: {
              dataGolfId: String(player.dg_id),
              tour: player.primary_tour || 'pga',
              season: CURRENT_SEASON,
            },
          },
          create: {
            dataGolfId: String(player.dg_id),
            playerName: player.player_name,
            dgRank: player.dg_rank,
            owgrRank: player.owgr_rank,
            trueSkill: player.dg_skill_estimate,
            tour: player.primary_tour || 'pga',
            season: CURRENT_SEASON,
            lastSynced: new Date(),
          },
          update: {
            dgRank: player.dg_rank,
            owgrRank: player.owgr_rank,
            trueSkill: player.dg_skill_estimate,
            lastSynced: new Date(),
          },
        });
        stats.recordsProcessed++;
      } catch (error: any) {
        stats.errors.push(`Player ${player.player_name}: ${error.message}`);
      }
    }
  } catch (error: any) {
    stats.errors.push(`Rankings: ${error.message}`);
  }

  stats.duration = Date.now() - startTime;
  console.log(`  ✅ Synced ${stats.recordsProcessed} rankings in ${stats.duration}ms`);
  return stats;
}

async function calculateTourAverages(): Promise<void> {
  console.log('\n📈 Calculating Tour Averages...');

  for (const tour of TOURS) {
    const players = await prisma.dataGolfPlayer.findMany({
      where: {
        tour: tour,
        season: CURRENT_SEASON,
      },
    });

    if (players.length === 0) continue;

    const avg = (field: string) => {
      const values = players
        .map((p: any) => p[field])
        .filter((v: any) => v !== null && v !== undefined);
      if (values.length === 0) return 0;
      return Number(values.reduce((a: number, b: number) => Number(a) + Number(b), 0)) / values.length;
    };

    const stats = {
      avgSgTotal: avg('sgTotal'),
      avgSgOtt: avg('sgOffTee'),
      avgSgApp: avg('sgApproach'),
      avgSgArg: avg('sgAroundGreen'),
      avgSgPutt: avg('sgPutting'),
      avgDrivingDistance: avg('drivingDistance'),
      avgDrivingAccuracy: avg('drivingAccuracy'),
      playerCount: players.length,
    };

    await prisma.dataGolfTourAverage.upsert({
      where: {
        tour_season: {
          tour: tour,
          season: CURRENT_SEASON,
        },
      },
      create: {
        tour: tour,
        season: CURRENT_SEASON,
        stats: stats,
      },
      update: {
        stats: stats,
      },
    });

    console.log(`  ✅ ${tour.toUpperCase()}: ${players.length} players, avg SG Total: ${stats.avgSgTotal.toFixed(3)}`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('             DataGolf Complete Sync Script');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Season: ${CURRENT_SEASON}`);
  console.log(`Tours: ${TOURS.join(', ').toUpperCase()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (!client.isConfigured()) {
    console.error('\n❌ Error: DATAGOLF_API_KEY is not configured!');
    console.error('Please set the environment variable and try again.');
    process.exit(1);
  }

  const allStats: SyncStats[] = [];
  const totalStartTime = Date.now();

  try {
    // Sync in order of importance
    allStats.push(await syncSkillRatings());
    allStats.push(await syncDGRankings());
    allStats.push(await syncPlayerDecompositions());
    allStats.push(await syncApproachSkill());
    allStats.push(await syncSchedule());
    allStats.push(await syncHistoricalRounds());

    // Calculate averages
    await calculateTourAverages();

    const totalDuration = Date.now() - totalStartTime;

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                     SYNC SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');

    let totalRecords = 0;
    let totalErrors = 0;

    for (const stat of allStats) {
      totalRecords += stat.recordsProcessed;
      totalErrors += stat.errors.length;
      console.log(`${stat.endpoint.padEnd(35)} ${stat.recordsProcessed.toString().padStart(6)} records  ${(stat.duration / 1000).toFixed(1)}s`);
    }

    console.log('───────────────────────────────────────────────────────────────');
    console.log(`Total Records:                      ${totalRecords.toString().padStart(6)}`);
    console.log(`Total Errors:                       ${totalErrors.toString().padStart(6)}`);
    console.log(`Total Duration:                     ${(totalDuration / 1000).toFixed(1)}s`);
    console.log('═══════════════════════════════════════════════════════════════');

    if (totalErrors > 0) {
      console.log('\n⚠️  Some errors occurred. First 10 errors:');
      const allErrors = allStats.flatMap((s) => s.errors);
      allErrors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
    }

    console.log('\n✅ DataGolf sync complete!');
  } catch (error: any) {
    console.error('\n❌ Fatal error during sync:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
