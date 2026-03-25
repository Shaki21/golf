/**
 * DataGolf Sync Cron Job
 * Runs daily at 03:00 UTC to sync player data and tour averages from DataGolf API
 */

import cron from 'node-cron';
import { DataGolfService } from '../api/v1/datagolf/service';
import { getPrismaClient } from '../core/db/prisma';
import { logger } from '../utils/logger';

/**
 * Start the DataGolf sync cron job
 */
export const startDataGolfSyncJob = () => {
  const syncEnabled = process.env.DATAGOLF_SYNC_ENABLED === 'true';
  const schedule = process.env.DATAGOLF_SYNC_SCHEDULE || '0 3 * * *'; // Default: 03:00 UTC daily
  const defaultTenantId = process.env.DEFAULT_TENANT_ID || '00000000-0000-0000-0000-000000000001';

  if (!syncEnabled) {
    logger.info('DataGolf sync job disabled (DATAGOLF_SYNC_ENABLED=false)');
    return;
  }

  if (!process.env.DATAGOLF_API_KEY) {
    logger.warn('DataGolf sync job disabled (DATAGOLF_API_KEY not configured)');
    return;
  }

  logger.info({ schedule }, 'Starting DataGolf sync job');

  // Schedule the cron job
  cron.schedule(schedule, async () => {
    logger.info('Running scheduled DataGolf sync');

    try {
      const prisma = getPrismaClient();
      const dataGolfService = new DataGolfService(prisma);

      const result = await dataGolfService.syncDataGolf(defaultTenantId);

      if (result.syncStatus === 'success') {
        logger.info({
          playersUpdated: result.playersUpdated,
          tourAveragesUpdated: result.tourAveragesUpdated,
          nextSync: result.nextSyncAt
        }, 'DataGolf sync completed successfully');
      } else if (result.syncStatus === 'completed_with_errors') {
        logger.warn({
          playersUpdated: result.playersUpdated,
          tourAveragesUpdated: result.tourAveragesUpdated,
          errors: result.errors
        }, 'DataGolf sync completed with errors');
      } else {
        logger.error({
          status: result.syncStatus,
          errors: result.errors
        }, 'DataGolf sync failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: errorMessage }, 'DataGolf sync job failed');
    }
  });

  logger.info('DataGolf sync job started successfully');
};
