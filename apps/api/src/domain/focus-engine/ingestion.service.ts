/**
 * DataGolf Ingestion Service
 * Parses Archive.zip and upserts data into database
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';
import { logger } from '../../utils/logger';
import type { IngestionResult, PerformanceRow, ApproachSkillRow } from './types';

// Default path relative to project root
const DEFAULT_ZIP_PATH = path.resolve(__dirname, '../../../../../Archive.zip');

export class IngestionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Main ingestion entry point
   * @param zipPath Path to Archive.zip (defaults to project root)
   */
  async ingest(zipPath: string = DEFAULT_ZIP_PATH): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const filesProcessed: string[] = [];
    let playerSeasonsUpserted = 0;
    let playerSeasonsErrors = 0;
    let approachSkillsUpserted = 0;
    let approachSkillsErrors = 0;

    logger.info({ zipPath }, 'Starting DataGolf ingestion');

    // Validate zip exists
    if (!fs.existsSync(zipPath)) {
      throw new Error(`Zip file not found: ${zipPath}`);
    }

    // Calculate source version (hash of zip)
    const sourceVersion = await this.calculateZipHash(zipPath);
    logger.info({ sourceVersion }, 'Source version calculated');

    try {
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      // Process performance files (dg_performance_YYYY.csv)
      const performanceFiles = entries.filter(e =>
        e.entryName.match(/^dg_performance_\d{4}\.csv$/) &&
        !e.entryName.startsWith('__MACOSX')
      );

      logger.info({ count: performanceFiles.length }, 'Processing performance files');

      for (const entry of performanceFiles) {
        try {
          const result = await this.processPerformanceFile(entry, sourceVersion);
          playerSeasonsUpserted += result.upserted;
          playerSeasonsErrors += result.errors;
          filesProcessed.push(entry.entryName);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to process ${entry.entryName}: ${errorMessage}`);
          logger.error({ file: entry.entryName, error: errorMessage }, 'Performance file failed');
        }
      }

      // Process approach skill files (app_skill_l24_*.csv)
      const approachFiles = entries.filter(e =>
        e.entryName.match(/^app_skill_l24_[a-z]+\.csv$/) &&
        !e.entryName.startsWith('__MACOSX')
      );

      logger.info({ count: approachFiles.length }, 'Processing approach skill files');

      for (const entry of approachFiles) {
        try {
          const result = await this.processApproachSkillFile(entry, sourceVersion);
          approachSkillsUpserted += result.upserted;
          approachSkillsErrors += result.errors;
          filesProcessed.push(entry.entryName);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to process ${entry.entryName}: ${errorMessage}`);
          logger.error({ file: entry.entryName, error: errorMessage }, 'Approach file failed');
        }
      }

      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      logger.info({
        success,
        playerSeasonsUpserted,
        approachSkillsUpserted,
        filesProcessed: filesProcessed.length,
        errors: errors.length,
        duration,
      }, 'Ingestion completed');

      return {
        success,
        sourceVersion,
        stats: {
          playerSeasons: { upserted: playerSeasonsUpserted, errors: playerSeasonsErrors },
          approachSkills: { upserted: approachSkillsUpserted, errors: approachSkillsErrors },
          filesProcessed,
        },
        errors,
        duration,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: errorMessage }, 'Ingestion failed');
      throw error;
    }
  }

  /**
   * Process a performance CSV file
   */
  private async processPerformanceFile(
    entry: AdmZip.IZipEntry,
    sourceVersion: string
  ): Promise<{ upserted: number; errors: number }> {
    const content = entry.getData().toString('utf-8');

    // Validate file is not empty
    if (!content.trim()) {
      throw new Error('File is empty');
    }

    // Parse CSV
    const records: PerformanceRow[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Extract season from filename (dg_performance_2025.csv -> 2025)
    const seasonMatch = entry.entryName.match(/dg_performance_(\d{4})\.csv/);
    if (!seasonMatch) {
      throw new Error('Could not extract season from filename');
    }
    const season = parseInt(seasonMatch[1], 10);

    // Validate required columns
    const requiredColumns = ['player_name', 'ott_true', 'app_true', 'arg_true', 'putt_true', 'total_true'];
    const firstRecord = records[0];
    if (firstRecord) {
      const missing = requiredColumns.filter(col => !(col in firstRecord));
      if (missing.length > 0) {
        throw new Error(`Missing required columns: ${missing.join(', ')}`);
      }
    }

    let upserted = 0;
    let errors = 0;

    for (const row of records) {
      try {
        await this.prisma.dgPlayerSeason.upsert({
          where: {
            playerId_season: {
              playerId: row.player_name,
              season,
            },
          },
          create: {
            playerId: row.player_name,
            season,
            ottTrue: this.parseDecimal(row.ott_true),
            appTrue: this.parseDecimal(row.app_true),
            argTrue: this.parseDecimal(row.arg_true),
            puttTrue: this.parseDecimal(row.putt_true),
            t2gTrue: this.parseDecimal(row.t2g_true),
            totalTrue: this.parseDecimal(row.total_true),
            roundsPlayed: this.parseInt(row.rounds_played),
            eventsPlayed: this.parseInt(row.events_played),
            wins: this.parseInt(row.wins),
            xWins: this.parseDecimal(row.x_wins),
            sourceVersion,
          },
          update: {
            ottTrue: this.parseDecimal(row.ott_true),
            appTrue: this.parseDecimal(row.app_true),
            argTrue: this.parseDecimal(row.arg_true),
            puttTrue: this.parseDecimal(row.putt_true),
            t2gTrue: this.parseDecimal(row.t2g_true),
            totalTrue: this.parseDecimal(row.total_true),
            roundsPlayed: this.parseInt(row.rounds_played),
            eventsPlayed: this.parseInt(row.events_played),
            wins: this.parseInt(row.wins),
            xWins: this.parseDecimal(row.x_wins),
            sourceVersion,
            ingestedAt: new Date(),
          },
        });
        upserted++;
      } catch (error: unknown) {
        errors++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.warn({ player: row.player_name, error: errorMessage }, 'Failed to upsert player season');
      }
    }

    logger.info({ file: entry.entryName, season, upserted, errors }, 'Processed performance file');
    return { upserted, errors };
  }

  /**
   * Process an approach skill CSV file
   */
  private async processApproachSkillFile(
    entry: AdmZip.IZipEntry,
    sourceVersion: string
  ): Promise<{ upserted: number; errors: number }> {
    const content = entry.getData().toString('utf-8');

    if (!content.trim()) {
      throw new Error('File is empty');
    }

    // Parse CSV
    const records: ApproachSkillRow[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Extract stat type from filename (app_skill_l24_sg.csv -> sg)
    const statMatch = entry.entryName.match(/app_skill_l24_([a-z]+)\.csv/);
    if (!statMatch) {
      throw new Error('Could not extract stat type from filename');
    }
    const stat = statMatch[1]; // "sg", "prox", "gh", "great", "bad"

    // Map stat types to readable names
    const statNames: Record<string, string> = {
      sg: 'sg_per_shot',
      prox: 'proximity_ft',
      gh: 'green_hit_rate',
      great: 'good_shot_rate',
      bad: 'poor_shot_avoidance',
    };
    const statName = statNames[stat] || stat;

    let upserted = 0;
    let errors = 0;

    // Process each row - extract each bucket/lie combination
    const buckets = [
      { key: '50_100_fw', bucket: '50_100', lie: 'fairway' },
      { key: '100_150_fw', bucket: '100_150', lie: 'fairway' },
      { key: '150_200_fw', bucket: '150_200', lie: 'fairway' },
      { key: 'over_200_fw', bucket: 'over_200', lie: 'fairway' },
      { key: 'under_150_rgh', bucket: 'under_150', lie: 'rough' },
      { key: 'over_150_rgh', bucket: 'over_150', lie: 'rough' },
    ];

    for (const row of records) {
      for (const { key, bucket, lie } of buckets) {
        try {
          const shotCountKey = `${key}_shot_count` as keyof ApproachSkillRow;
          const valueKey = `${key}_value` as keyof ApproachSkillRow;

          const shotCount = this.parseInt(row[shotCountKey] as string | undefined);
          const value = this.parseDecimal(row[valueKey] as string | undefined);

          // Skip if no data
          if (shotCount === null && value === null) continue;

          await this.prisma.dgApproachSkillL24.upsert({
            where: {
              playerId_bucket_lie_stat: {
                playerId: row.player_name,
                bucket,
                lie,
                stat: statName,
              },
            },
            create: {
              playerId: row.player_name,
              bucket,
              lie,
              stat: statName,
              value,
              shotCount,
              sourceVersion,
            },
            update: {
              value,
              shotCount,
              sourceVersion,
              ingestedAt: new Date(),
            },
          });
          upserted++;
        } catch (error: unknown) {
          errors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.warn({
            player: row.player_name,
            bucket,
            lie,
            error: errorMessage,
          }, 'Failed to upsert approach skill');
        }
      }
    }

    logger.info({ file: entry.entryName, stat: statName, upserted, errors }, 'Processed approach skill file');
    return { upserted, errors };
  }

  /**
   * Calculate SHA256 hash of zip file
   */
  private async calculateZipHash(zipPath: string): Promise<string> {
    const buffer = fs.readFileSync(zipPath);
    return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  }

  /**
   * Parse decimal value safely
   */
  private parseDecimal(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Parse integer value safely
   */
  private parseInt(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? null : parsed;
  }
}
