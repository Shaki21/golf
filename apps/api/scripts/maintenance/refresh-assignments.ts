/**
 * ================================================================
 * Dynamic Assignment Refresh Script
 * ================================================================
 *
 * Regenerates training assignments for "today + N weeks" to keep
 * the development database populated with current data.
 *
 * Usage:
 *   npm run seed:refresh-assignments
 *   npm run seed:refresh-assignments -- --weeks=4
 */

import prisma from '../prisma/client';
import { addDays, getWeekNumber } from '../src/utils/date-helpers';


interface RefreshOptions {
  weeks?: number;
  dryRun?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): RefreshOptions {
  const args = process.argv.slice(2);
  const options: RefreshOptions = {
    weeks: 4, // Default to 4 weeks
    dryRun: false,
  };

  args.forEach(arg => {
    if (arg.startsWith('--weeks=')) {
      options.weeks = parseInt(arg.split('=')[1], 10);
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
    }
  });

  return options;
}

/**
 * Main refresh function
 */
async function refreshAssignments() {
  const options = parseArgs();
  console.log(`🔄 Refreshing assignments for next ${options.weeks} weeks...`);
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }

  try {
    // Calculate date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, (options.weeks! * 7));

    console.log(`📅 Date range: ${today.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Get all active players
    const players = await prisma.player.findMany({
      where: {
        status: 'active',
      },
      include: {
        currentAnnualPlan: true,
      },
    });

    console.log(`👤 Found ${players.length} active players`);

    let totalCreated = 0;
    let totalUpdated = 0;

    // Process each player
    for (const player of players) {
      if (!player.currentAnnualPlan) {
        console.log(`⚠️  Skipping player ${player.id} - no annual plan`);
        continue;
      }

      console.log(`\n📝 Processing player: ${player.firstName} ${player.lastName}`);

      // Delete old assignments in the date range
      if (!options.dryRun) {
        const deleted = await prisma.dailyTrainingAssignment.deleteMany({
          where: {
            playerId: player.id,
            assignedDate: {
              gte: today,
              lte: endDate,
            },
          },
        });
        console.log(`  🗑️  Deleted ${deleted.count} old assignments`);
      }

      // Generate new assignments
      const assignments: any[] = [];
      let currentDate = new Date(today);

      while (currentDate <= endDate) {
        const weekNumber = getWeekNumber(currentDate);
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Get periodization for this week
        const periodization = await prisma.periodization.findFirst({
          where: {
            playerId: player.id,
            weekNumber,
          },
          orderBy: { createdAt: 'desc' },
        });

        // Skip weekends (Saturday=6, Sunday=0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Determine session type based on day of week
          let sessionType: 'training' | 'test' | 'recovery' = 'training';

          if (dayOfWeek === 3) {
            // Wednesday = potential test day
            sessionType = Math.random() > 0.7 ? 'test' : 'training';
          } else if (dayOfWeek === 5) {
            // Friday = recovery
            sessionType = 'recovery';
          }

          // Get or create session template
          const template = await prisma.sessionTemplate.findFirst({
            where: {
              tenantId: player.tenantId,
              sessionType,
              tier: player.category || 'beginner',
            },
          });

          if (template) {
            assignments.push({
              tenantId: player.tenantId,
              playerId: player.id,
              annualPlanId: player.currentAnnualPlan.id,
              weekNumber,
              assignedDate: new Date(currentDate),
              sessionType,
              sessionTemplateId: template.id,
              estimatedDuration: template.duration,
              status: 'pending',
              learningPhase: periodization?.learningPhase || 'build',
              clubSpeed: 'moderate',
            });
          }
        }

        currentDate = addDays(currentDate, 1);
      }

      if (!options.dryRun) {
        const created = await prisma.dailyTrainingAssignment.createMany({
          data: assignments,
        });
        console.log(`  ✅ Created ${created.count} new assignments`);
        totalCreated += created.count;
      } else {
        console.log(`  🔍 Would create ${assignments.length} assignments`);
        totalCreated += assignments.length;
      }
    }

    console.log(`\n✨ Refresh complete!`);
    console.log(`   Total assignments created: ${totalCreated}`);
    console.log(`   Total assignments updated: ${totalUpdated}`);

  } catch (error) {
    console.error('❌ Error refreshing assignments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
refreshAssignments()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
