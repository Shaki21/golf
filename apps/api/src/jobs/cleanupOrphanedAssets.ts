/**
 * Orphan Cleanup Job
 *
 * Finds and cleans up orphaned storage assets:
 * 1. Storage objects where videoId doesn't exist in DB
 * 2. Videos marked as deleted (deletedAt) older than retention period
 *
 * Usage:
 *   # Dry run (log only, no deletions)
 *   CLEANUP_DRY_RUN=true npx tsx src/jobs/cleanupOrphanedAssets.ts
 *
 *   # Actual cleanup (requires explicit CLEANUP_DRY_RUN=false in production)
 *   CLEANUP_DRY_RUN=false npx tsx src/jobs/cleanupOrphanedAssets.ts
 *
 * Production Safety:
 *   In production (NODE_ENV=production), CLEANUP_DRY_RUN must be explicitly
 *   set to "false" to perform actual deletions. Any other value triggers
 *   dry-run mode with a warning.
 *
 * Exit Codes:
 *   0 - Success (or dry-run completed)
 *   1 - Critical failure or errors encountered
 *   2 - Safety guard triggered (production misconfiguration)
 *
 * Recommended schedule: Weekly (cron: 0 3 * * 0)
 */

import { getPrismaClient } from '../core/db/prisma';
import { storageService } from '../services/storage.service';
import { logger } from '../utils/logger';

// Logging prefix for monitoring/alerting
const LOG_PREFIX = '[CLEANUP_JOB]';
const ERROR_PREFIX = '[CLEANUP_JOB_ERROR]';

// Create child logger for cleanup job
const jobLogger = logger.child({ job: 'orphan-cleanup' });

// Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLEANUP_DRY_RUN_ENV = process.env.CLEANUP_DRY_RUN;
const DELETED_RETENTION_DAYS = parseInt(process.env.DELETED_RETENTION_DAYS || '30', 10);
const BATCH_SIZE = 100;

/**
 * Determine if dry-run mode is active.
 * In production, requires explicit CLEANUP_DRY_RUN=false to disable dry-run.
 */
function isDryRun(): boolean {
  if (NODE_ENV === 'production') {
    // In production, must explicitly set to "false" to run real cleanup
    return CLEANUP_DRY_RUN_ENV !== 'false';
  }
  // In non-production, default to dry-run unless explicitly set to "false"
  return CLEANUP_DRY_RUN_ENV !== 'false';
}

const DRY_RUN = isDryRun();

interface CleanupStats {
  orphanedStorageKeys: number;
  expiredDeletedVideos: number;
  storageObjectsDeleted: number;
  dbRecordsDeleted: number;
  hlsKeysScanned: number;
  videoIdsChecked: number;
  errors: string[];
  durationMs: number;
  startTime: Date;
  endTime: Date | null;
}

const prisma = getPrismaClient();

/**
 * Extract videoId from storage key
 * Patterns:
 * - tenants/{tenantId}/videos/{playerId}/{timestamp}-{filename} -> extract from DB lookup
 * - videos/{videoId}/hls/... -> extract videoId directly
 */
function extractVideoIdFromKey(key: string): string | null {
  // HLS pattern: videos/{videoId}/hls/...
  const hlsMatch = key.match(/^videos\/([a-f0-9-]{36})\/hls\//);
  if (hlsMatch) {
    return hlsMatch[1];
  }

  return null;
}

/**
 * Find orphaned HLS assets (videoId in path doesn't exist in DB)
 */
async function findOrphanedHlsAssets(stats: CleanupStats): Promise<string[]> {
  const orphanedPrefixes: string[] = [];

  // List all objects under videos/ prefix (HLS assets)
  const hlsKeys = await storageService.listObjects('videos/', 10000);
  stats.hlsKeysScanned = hlsKeys.length;

  // Extract unique videoIds
  const videoIds = new Set<string>();
  for (const key of hlsKeys) {
    const videoId = extractVideoIdFromKey(key);
    if (videoId) {
      videoIds.add(videoId);
    }
  }

  stats.videoIdsChecked = videoIds.size;

  // Check which videoIds exist in DB
  for (const videoId of videoIds) {
    const exists = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!exists) {
      orphanedPrefixes.push(`videos/${videoId}/`);
    }
  }

  return orphanedPrefixes;
}

/**
 * Find videos marked as deleted older than retention period
 */
async function findExpiredDeletedVideos(): Promise<Array<{
  id: string;
  s3Key: string;
  thumbnailKey: string | null;
  hlsManifestKey: string | null;
}>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DELETED_RETENTION_DAYS);

  const expiredVideos = await prisma.video.findMany({
    where: {
      deletedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      s3Key: true,
      thumbnailKey: true,
      hlsManifestKey: true,
    },
    take: BATCH_SIZE,
  });

  return expiredVideos;
}

/**
 * Clean up orphaned HLS prefixes
 */
async function cleanupOrphanedHls(
  prefixes: string[],
  stats: CleanupStats
): Promise<void> {
  for (const prefix of prefixes) {
    console.log(`${LOG_PREFIX}   - ${prefix}`);

    if (!DRY_RUN) {
      try {
        const deleted = await storageService.deletePrefix(prefix);
        stats.storageObjectsDeleted += deleted;
        console.log(`${LOG_PREFIX}     Deleted ${deleted} objects`);
      } catch (err) {
        const errorMsg = `Failed to delete prefix ${prefix}: ${err}`;
        console.error(`${ERROR_PREFIX}     ${errorMsg}`);
        jobLogger.error({ prefix, error: err }, 'Failed to delete prefix');
        stats.errors.push(errorMsg);
      }
    }
  }
}

/**
 * Clean up expired deleted videos (storage + DB record)
 */
async function cleanupExpiredVideos(
  videos: Array<{
    id: string;
    s3Key: string;
    thumbnailKey: string | null;
    hlsManifestKey: string | null;
  }>,
  stats: CleanupStats
): Promise<void> {
  for (const video of videos) {
    console.log(`${LOG_PREFIX}   - Video ${video.id}`);
    console.log(`${LOG_PREFIX}     s3Key: ${video.s3Key}`);
    if (video.thumbnailKey) console.log(`${LOG_PREFIX}     thumbnail: ${video.thumbnailKey}`);
    if (video.hlsManifestKey) console.log(`${LOG_PREFIX}     hls: ${video.hlsManifestKey}`);

    if (!DRY_RUN) {
      try {
        // Generate HLS prefix from manifest key
        const hlsPrefix = video.hlsManifestKey
          ? video.hlsManifestKey.replace(/\/master\.m3u8$/, '/')
          : null;

        // Delete storage assets
        const result = await storageService.deleteVideoAssets(
          video.s3Key,
          video.thumbnailKey,
          hlsPrefix
        );

        stats.storageObjectsDeleted += (result.video ? 1 : 0) + (result.thumbnail ? 1 : 0) + result.hlsCount;
        console.log(`${LOG_PREFIX}     Deleted: video=${result.video}, thumb=${result.thumbnail}, hls=${result.hlsCount}`);

        // Delete DB record
        await prisma.video.delete({
          where: { id: video.id },
        });
        stats.dbRecordsDeleted++;
        console.log(`${LOG_PREFIX}     DB record deleted`);
      } catch (err) {
        const errorMsg = `Failed to cleanup video ${video.id}: ${err}`;
        console.error(`${ERROR_PREFIX}     ${errorMsg}`);
        jobLogger.error({ videoId: video.id, error: err }, 'Failed to cleanup video');
        stats.errors.push(errorMsg);
      }
    }
  }
}

/**
 * Check production safety guard.
 * Returns true if safe to proceed, false if should abort.
 */
function checkProductionSafety(): { safe: boolean; exitCode: number } {
  if (NODE_ENV === 'production' && CLEANUP_DRY_RUN_ENV === undefined) {
    console.error(`${ERROR_PREFIX} Production safety guard triggered!`);
    console.error(`${ERROR_PREFIX} In production, CLEANUP_DRY_RUN must be explicitly set.`);
    console.error(`${ERROR_PREFIX} Set CLEANUP_DRY_RUN=false for real cleanup, or CLEANUP_DRY_RUN=true for dry-run.`);
    console.error(`${ERROR_PREFIX} Aborting to prevent accidental data loss.`);
    jobLogger.error({ env: NODE_ENV }, 'Production safety guard triggered - CLEANUP_DRY_RUN not set');
    return { safe: false, exitCode: 2 };
  }

  if (NODE_ENV === 'production' && DRY_RUN && CLEANUP_DRY_RUN_ENV !== 'true') {
    console.warn(`${LOG_PREFIX} WARNING: Production mode with ambiguous CLEANUP_DRY_RUN value.`);
    console.warn(`${LOG_PREFIX} Defaulting to dry-run for safety. Set CLEANUP_DRY_RUN=false for real cleanup.`);
    jobLogger.warn({ env: NODE_ENV, dryRunEnv: CLEANUP_DRY_RUN_ENV }, 'Production mode with ambiguous CLEANUP_DRY_RUN');
  }

  return { safe: true, exitCode: 0 };
}

/**
 * Log final summary with structured output for monitoring.
 */
function logSummary(stats: CleanupStats): void {
  const separator = '='.repeat(60);

  console.log(separator);
  console.log(`${LOG_PREFIX} SUMMARY`);
  console.log(separator);
  console.log(`${LOG_PREFIX} Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`${LOG_PREFIX} Environment: ${NODE_ENV}`);
  console.log(`${LOG_PREFIX} Duration: ${stats.durationMs}ms`);
  console.log(`${LOG_PREFIX} HLS keys scanned: ${stats.hlsKeysScanned}`);
  console.log(`${LOG_PREFIX} Video IDs checked: ${stats.videoIdsChecked}`);
  console.log(`${LOG_PREFIX} Orphaned HLS prefixes: ${stats.orphanedStorageKeys}`);
  console.log(`${LOG_PREFIX} Expired deleted videos: ${stats.expiredDeletedVideos}`);
  console.log(`${LOG_PREFIX} Storage objects deleted: ${stats.storageObjectsDeleted}`);
  console.log(`${LOG_PREFIX} DB records deleted: ${stats.dbRecordsDeleted}`);
  console.log(`${LOG_PREFIX} Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log(`${LOG_PREFIX} Error details:`);
    stats.errors.forEach((e, i) => {
      console.error(`${ERROR_PREFIX} ${i + 1}. ${e}`);
    });
  }

  console.log(`${LOG_PREFIX} Started: ${stats.startTime.toISOString()}`);
  console.log(`${LOG_PREFIX} Completed: ${stats.endTime?.toISOString() || 'N/A'}`);

  // Structured JSON summary for log aggregation
  const summaryJson = {
    job: 'cleanup_orphaned_assets',
    mode: DRY_RUN ? 'dry_run' : 'live',
    env: NODE_ENV,
    durationMs: stats.durationMs,
    hlsKeysScanned: stats.hlsKeysScanned,
    videoIdsChecked: stats.videoIdsChecked,
    orphanedPrefixes: stats.orphanedStorageKeys,
    expiredVideos: stats.expiredDeletedVideos,
    storageDeleted: stats.storageObjectsDeleted,
    dbDeleted: stats.dbRecordsDeleted,
    errorCount: stats.errors.length,
    success: stats.errors.length === 0,
  };
  console.log(`${LOG_PREFIX} JSON_SUMMARY: ${JSON.stringify(summaryJson)}`);

  // Structured logging for monitoring systems
  if (stats.errors.length === 0) {
    jobLogger.info(summaryJson, 'Cleanup job completed successfully');
  } else {
    jobLogger.error(summaryJson, 'Cleanup job completed with errors');
  }
}

/**
 * Main cleanup function
 */
async function runCleanup(): Promise<CleanupStats> {
  const startTime = new Date();
  const stats: CleanupStats = {
    orphanedStorageKeys: 0,
    expiredDeletedVideos: 0,
    storageObjectsDeleted: 0,
    dbRecordsDeleted: 0,
    hlsKeysScanned: 0,
    videoIdsChecked: 0,
    errors: [],
    durationMs: 0,
    startTime,
    endTime: null,
  };

  console.log('='.repeat(60));
  console.log(`${LOG_PREFIX} ORPHAN CLEANUP JOB`);
  console.log('='.repeat(60));
  console.log(`${LOG_PREFIX} Mode: ${DRY_RUN ? 'DRY RUN (no deletions)' : 'LIVE'}`);
  console.log(`${LOG_PREFIX} Environment: ${NODE_ENV}`);
  console.log(`${LOG_PREFIX} Deleted retention: ${DELETED_RETENTION_DAYS} days`);
  console.log(`${LOG_PREFIX} Batch size: ${BATCH_SIZE}`);
  console.log(`${LOG_PREFIX} Started: ${startTime.toISOString()}`);
  console.log();

  jobLogger.info({
    mode: DRY_RUN ? 'dry-run' : 'live',
    env: NODE_ENV,
    retentionDays: DELETED_RETENTION_DAYS,
    batchSize: BATCH_SIZE,
    startTime: startTime.toISOString(),
  }, 'Cleanup job started');

  // Step 1: Find orphaned HLS assets
  console.log(`${LOG_PREFIX} Step 1: Finding orphaned HLS assets...`);
  try {
    const orphanedPrefixes = await findOrphanedHlsAssets(stats);
    stats.orphanedStorageKeys = orphanedPrefixes.length;
    console.log(`${LOG_PREFIX} Found ${orphanedPrefixes.length} orphaned HLS prefixes`);

    if (orphanedPrefixes.length > 0) {
      await cleanupOrphanedHls(orphanedPrefixes, stats);
    }
  } catch (err) {
    const errorMsg = `Failed to find orphaned HLS: ${err}`;
    console.error(`${ERROR_PREFIX} ${errorMsg}`);
    jobLogger.error({ step: 1, error: err }, 'Failed to find orphaned HLS assets');
    stats.errors.push(errorMsg);
  }
  console.log();

  // Step 2: Find expired deleted videos
  console.log(`${LOG_PREFIX} Step 2: Finding expired deleted videos...`);
  try {
    const expiredVideos = await findExpiredDeletedVideos();
    stats.expiredDeletedVideos = expiredVideos.length;
    console.log(`${LOG_PREFIX} Found ${expiredVideos.length} expired deleted videos`);

    if (expiredVideos.length > 0) {
      await cleanupExpiredVideos(expiredVideos, stats);
    }
  } catch (err) {
    const errorMsg = `Failed to find expired videos: ${err}`;
    console.error(`${ERROR_PREFIX} ${errorMsg}`);
    jobLogger.error({ step: 2, error: err }, 'Failed to find expired deleted videos');
    stats.errors.push(errorMsg);
  }
  console.log();

  // Finalize stats
  stats.endTime = new Date();
  stats.durationMs = stats.endTime.getTime() - startTime.getTime();

  // Log summary
  logSummary(stats);

  return stats;
}

// Run if executed directly
if (require.main === module) {
  // Check production safety guard first
  const safetyCheck = checkProductionSafety();
  if (!safetyCheck.safe) {
    process.exit(safetyCheck.exitCode);
  }

  runCleanup()
    .then((stats) => {
      if (stats.errors.length > 0) {
        console.error(`${ERROR_PREFIX} Job completed with ${stats.errors.length} error(s)`);
        process.exit(1);
      }
      console.log(`${LOG_PREFIX} Job completed successfully`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`${ERROR_PREFIX} Fatal error: ${err}`);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { runCleanup, CleanupStats };
