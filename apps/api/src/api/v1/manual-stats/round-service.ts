/**
 * Round Management Service
 *
 * Orchestrates the complete flow from round creation through SG calculation.
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  RoundStatus,
  ExtractionStatus,
  type NormalizedHoleData,
  type SGRoundResultData,
  type ShotEventData,
} from './types';
import type {
  CreateRoundRequest,
  ManualHolesEntry,
  FinalizeRoundRequest,
} from './schemas';
import { getShotNormalizer } from './shot-normalizer';
import { getSGEngine, initializeSGEngine } from './sg-engine';
import { getExtractionService } from './extraction-service';
import { logger } from '../../../utils/logger';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';

// ============================================================================
// ROUND SERVICE
// ============================================================================

export class RoundService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new round
   */
  async createRound(
    tenantId: string,
    input: CreateRoundRequest
  ): Promise<{ id: string; status: RoundStatus }> {
    const id = uuidv4();

    await this.prisma.$executeRaw`
      INSERT INTO golf_rounds (
        id, tenant_id, player_id, round_date, course_name, course_id, tee_box,
        total_par, holes_played, status, input_method, created_at, updated_at
      ) VALUES (
        ${id}::uuid,
        ${tenantId}::uuid,
        ${input.playerId}::uuid,
        ${input.roundDate}::date,
        ${input.courseName ?? null},
        ${input.courseId ? `${input.courseId}::uuid` : null},
        ${input.teeBox ?? null},
        ${input.totalPar ?? 72},
        ${input.holesPlayed ?? 18},
        'DRAFT',
        'manual',
        now(),
        now()
      )
    `;

    logger.info({ roundId: id, playerId: input.playerId }, 'Round created');

    return { id, status: RoundStatus.DRAFT };
  }

  /**
   * Get round by ID
   */
  async getRound(tenantId: string, roundId: string): Promise<{
    id: string;
    playerId: string;
    roundDate: string;
    courseName: string | null;
    status: RoundStatus;
    dataQuality: number | null;
    sgComputable: boolean;
    totalScore: number | null;
    sgResult: SGRoundResultData | null;
  } | null> {
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        player_id: string;
        round_date: Date;
        course_name: string | null;
        status: RoundStatus;
        data_quality: number | null;
        sg_computable: boolean;
        total_score: number | null;
      }>
    >`
      SELECT id, player_id, round_date, course_name, status, data_quality, sg_computable, total_score
      FROM golf_rounds
      WHERE id = ${roundId}::uuid AND tenant_id = ${tenantId}::uuid
    `;

    if (result.length === 0) return null;

    const round = result[0];

    // Get SG result if exists
    const sgResult = await this.getSGResult(roundId);

    return {
      id: round.id,
      playerId: round.player_id,
      roundDate: round.round_date.toISOString().split('T')[0],
      courseName: round.course_name,
      status: round.status,
      dataQuality: round.data_quality,
      sgComputable: round.sg_computable,
      totalScore: round.total_score,
      sgResult,
    };
  }

  /**
   * Add images to round and start extraction
   */
  async addImageAndStartExtraction(
    roundId: string,
    imagePath: string,
    thumbnailPath: string | null,
    mimeType: string,
    fileSizeBytes: number,
    holesOnImage?: number[]
  ): Promise<{ imageId: string; extractionId: string }> {
    const imageId = uuidv4();

    // Insert image record
    await this.prisma.$executeRaw`
      INSERT INTO round_images (
        id, round_id, original_path, thumbnail_path, mime_type, file_size_bytes,
        image_order, holes_on_image, uploaded_at
      ) VALUES (
        ${imageId}::uuid,
        ${roundId}::uuid,
        ${imagePath},
        ${thumbnailPath},
        ${mimeType},
        ${fileSizeBytes},
        0,
        ${holesOnImage ?? []},
        now()
      )
    `;

    // Update round status
    await this.prisma.$executeRaw`
      UPDATE golf_rounds SET status = 'PENDING_EXTRACTION', updated_at = now()
      WHERE id = ${roundId}::uuid
    `;

    // Start extraction
    const extractionService = getExtractionService(this.prisma);
    const extractionId = await extractionService.startExtraction(imageId);

    return { imageId, extractionId };
  }

  /**
   * Add manual hole entries
   */
  async addManualHoles(
    tenantId: string,
    roundId: string,
    input: ManualHolesEntry
  ): Promise<{ holesAdded: number; shots: number }> {
    // Verify round exists and is editable
    const round = await this.getRound(tenantId, roundId);
    if (!round) {
      throw new NotFoundError('Round not found');
    }
    if (round.status === RoundStatus.FINALIZED || round.status === RoundStatus.ARCHIVED) {
      throw new BadRequestError('Cannot modify finalized or archived round');
    }

    // Normalize holes to shots
    const normalizer = getShotNormalizer();
    const normalizedHoles = normalizer.normalizeManualHoles(input.holes);

    // Insert hole data and shots
    let totalShots = 0;

    for (const hole of normalizedHoles) {
      // Upsert round hole data
      await this.prisma.$executeRaw`
        INSERT INTO round_hole_data (
          id, round_id, hole_number, hole_length_m, hole_par, hole_score,
          is_complete, sg_computable, data_source, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${roundId}::uuid,
          ${hole.holeNumber},
          ${hole.holeLengthM ?? null},
          ${hole.holePar ?? null},
          ${hole.holeScore ?? null},
          ${hole.isComplete},
          ${hole.sgComputable},
          'manual',
          now(),
          now()
        )
        ON CONFLICT (round_id, hole_number) DO UPDATE SET
          hole_length_m = EXCLUDED.hole_length_m,
          hole_par = EXCLUDED.hole_par,
          hole_score = EXCLUDED.hole_score,
          is_complete = EXCLUDED.is_complete,
          sg_computable = EXCLUDED.sg_computable,
          data_source = 'manual',
          updated_at = now()
      `;

      // Delete existing shots for this hole
      await this.prisma.$executeRaw`
        DELETE FROM shot_events WHERE round_id = ${roundId}::uuid AND hole_number = ${hole.holeNumber}
      `;

      // Insert new shots
      for (const shot of hole.shots) {
        await this.insertShot(roundId, shot);
        totalShots++;
      }
    }

    // Update round status and data quality
    const dataQuality = normalizer.calculateDataQuality(normalizedHoles);
    const sgCoverage = normalizer.calculateSGCoverage(normalizedHoles);
    const totalScore = normalizedHoles.reduce((sum, h) => sum + (h.holeScore ?? 0), 0);

    await this.prisma.$executeRaw`
      UPDATE golf_rounds SET
        input_method = 'manual',
        status = 'DRAFT',
        data_quality = ${dataQuality},
        sg_computable = ${sgCoverage > 50},
        total_score = ${totalScore > 0 ? totalScore : null},
        updated_at = now()
      WHERE id = ${roundId}::uuid
    `;

    return { holesAdded: normalizedHoles.length, shots: totalShots };
  }

  /**
   * Insert a shot event
   */
  private async insertShot(roundId: string, shot: ShotEventData): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO shot_events (
        id, round_id, hole_number, shot_number,
        start_distance_m, start_lie, end_distance_m, end_lie, is_holed,
        club, distance_type, shot_category,
        is_estimated, data_source, confidence,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${roundId}::uuid,
        ${shot.holeNumber},
        ${shot.shotNumber},
        ${shot.startDistanceM},
        ${shot.startLie}::text,
        ${shot.endDistanceM},
        ${shot.endLie}::text,
        ${shot.isHoled},
        ${shot.club ?? null},
        ${shot.distanceType ?? null}::text,
        ${shot.shotCategory}::text,
        ${shot.isEstimated},
        ${shot.dataSource},
        ${shot.confidence ?? null},
        now(),
        now()
      )
    `;
  }

  /**
   * Get extraction status for a round
   */
  async getExtractionStatus(roundId: string): Promise<{
    status: ExtractionStatus;
    images: Array<{
      imageId: string;
      status: ExtractionStatus;
      overallConfidence: number | null;
      fieldsRequiringReview: number;
    }>;
    holes: Array<{
      holeNumber: number;
      requiresReview: boolean;
      reviewFields: string[];
      confidence: number | null;
    }>;
  }> {
    // Get all images and their extraction status
    const images = await this.prisma.$queryRaw<
      Array<{
        image_id: string;
        status: ExtractionStatus;
        overall_confidence: number | null;
        fields_requiring_review: number;
      }>
    >`
      SELECT ri.id as image_id, ie.status, ie.overall_confidence, ie.fields_requiring_review
      FROM round_images ri
      LEFT JOIN image_extractions ie ON ie.image_id = ri.id
      WHERE ri.round_id = ${roundId}::uuid
      ORDER BY ri.image_order
    `;

    // Get hole-level extraction data
    const holes = await this.prisma.$queryRaw<
      Array<{
        hole_number: number;
        requires_review: boolean;
        review_fields: string[];
        overall_confidence: number | null;
      }>
    >`
      SELECT ehd.hole_number, ehd.requires_review, ehd.review_fields, ehd.overall_confidence
      FROM extraction_hole_data ehd
      JOIN image_extractions ie ON ie.id = ehd.extraction_id
      JOIN round_images ri ON ri.id = ie.image_id
      WHERE ri.round_id = ${roundId}::uuid
      ORDER BY ehd.hole_number
    `;

    // Determine overall status
    let overallStatus = ExtractionStatus.PENDING;
    if (images.length === 0) {
      overallStatus = ExtractionStatus.PENDING;
    } else if (images.every((i) => i.status === ExtractionStatus.COMPLETED)) {
      overallStatus = ExtractionStatus.COMPLETED;
    } else if (images.some((i) => i.status === ExtractionStatus.REQUIRES_REVIEW)) {
      overallStatus = ExtractionStatus.REQUIRES_REVIEW;
    } else if (images.some((i) => i.status === ExtractionStatus.FAILED)) {
      overallStatus = ExtractionStatus.FAILED;
    } else if (images.some((i) => i.status === ExtractionStatus.PROCESSING)) {
      overallStatus = ExtractionStatus.PROCESSING;
    }

    return {
      status: overallStatus,
      images: images.map((i) => ({
        imageId: i.image_id,
        status: i.status ?? ExtractionStatus.PENDING,
        overallConfidence: i.overall_confidence,
        fieldsRequiringReview: i.fields_requiring_review ?? 0,
      })),
      holes: holes.map((h) => ({
        holeNumber: h.hole_number,
        requiresReview: h.requires_review,
        reviewFields: h.review_fields,
        confidence: h.overall_confidence,
      })),
    };
  }

  /**
   * Finalize round and compute SG
   */
  async finalizeRound(
    tenantId: string,
    roundId: string,
    input: FinalizeRoundRequest
  ): Promise<SGRoundResultData> {
    const round = await this.getRound(tenantId, roundId);
    if (!round) {
      throw new NotFoundError('Round not found');
    }

    if (round.status === RoundStatus.FINALIZED) {
      throw new BadRequestError('Round is already finalized');
    }

    // Check if we have enough data
    const shots = await this.getShots(roundId);
    if (shots.length === 0) {
      throw new BadRequestError('No shot data available for this round');
    }

    // Initialize SG engine
    const sgEngine = await initializeSGEngine(this.prisma);

    // Calculate SG for each shot
    const sgResults: Array<{ shot: ShotEventData; sg: { shotId: string; expectedStrokesStart: number; expectedStrokesEnd: number; strokesGained: number; shotCategory: string; baselineVersion: string } }> = [];

    for (const shot of shots) {
      const sg = sgEngine.calculateShotSG(shot);
      if (sg) {
        sgResults.push({ shot, sg: { ...sg, shotId: shot.shotId ?? '' } });

        // Persist shot SG result
        await this.prisma.$executeRaw`
          INSERT INTO sg_shot_results (
            id, shot_id, expected_strokes_start, expected_strokes_end, strokes_gained,
            baseline_version, calculated_at
          ) VALUES (
            gen_random_uuid(),
            ${shot.shotId}::uuid,
            ${sg.expectedStrokesStart},
            ${sg.expectedStrokesEnd},
            ${sg.strokesGained},
            ${sg.baselineVersion},
            now()
          )
          ON CONFLICT (shot_id) DO UPDATE SET
            expected_strokes_start = EXCLUDED.expected_strokes_start,
            expected_strokes_end = EXCLUDED.expected_strokes_end,
            strokes_gained = EXCLUDED.strokes_gained,
            baseline_version = EXCLUDED.baseline_version,
            calculated_at = now()
        `;
      }
    }

    // Calculate round aggregates
    const roundSG = sgEngine.calculateRoundSG(sgResults as any);
    roundSG.roundId = roundId;

    // Persist round SG result
    await this.prisma.$executeRaw`
      INSERT INTO sg_round_results (
        id, round_id, sg_tee, sg_approach, sg_short_game, sg_putting, sg_total,
        shot_count_tee, shot_count_approach, shot_count_short_game, shot_count_putting,
        holes_with_sg, total_holes, coverage_percent, baseline_version, calculated_at
      ) VALUES (
        gen_random_uuid(),
        ${roundId}::uuid,
        ${roundSG.sgTee},
        ${roundSG.sgApproach},
        ${roundSG.sgShortGame},
        ${roundSG.sgPutting},
        ${roundSG.sgTotal},
        ${roundSG.shotCountTee},
        ${roundSG.shotCountApproach},
        ${roundSG.shotCountShortGame},
        ${roundSG.shotCountPutting},
        ${roundSG.holesWithSG},
        ${roundSG.totalHoles},
        ${roundSG.coveragePercent},
        ${roundSG.baselineVersion},
        now()
      )
      ON CONFLICT (round_id) DO UPDATE SET
        sg_tee = EXCLUDED.sg_tee,
        sg_approach = EXCLUDED.sg_approach,
        sg_short_game = EXCLUDED.sg_short_game,
        sg_putting = EXCLUDED.sg_putting,
        sg_total = EXCLUDED.sg_total,
        shot_count_tee = EXCLUDED.shot_count_tee,
        shot_count_approach = EXCLUDED.shot_count_approach,
        shot_count_short_game = EXCLUDED.shot_count_short_game,
        shot_count_putting = EXCLUDED.shot_count_putting,
        holes_with_sg = EXCLUDED.holes_with_sg,
        total_holes = EXCLUDED.total_holes,
        coverage_percent = EXCLUDED.coverage_percent,
        baseline_version = EXCLUDED.baseline_version,
        calculated_at = now()
    `;

    // Update round status
    await this.prisma.$executeRaw`
      UPDATE golf_rounds SET
        status = 'FINALIZED',
        sg_computable = true,
        data_quality = ${roundSG.coveragePercent / 100},
        finalized_at = now(),
        updated_at = now()
      WHERE id = ${roundId}::uuid
    `;

    logger.info({ roundId, sgTotal: roundSG.sgTotal, coverage: roundSG.coveragePercent }, 'Round finalized');

    return roundSG;
  }

  /**
   * Get shots for a round
   */
  private async getShots(roundId: string): Promise<Array<ShotEventData & { shotId: string }>> {
    const shots = await this.prisma.$queryRaw<
      Array<{
        id: string;
        hole_number: number;
        shot_number: number;
        start_distance_m: number;
        start_lie: string;
        end_distance_m: number | null;
        end_lie: string | null;
        is_holed: boolean;
        club: string | null;
        distance_type: string | null;
        shot_category: string;
        is_estimated: boolean;
        data_source: string;
        confidence: number | null;
      }>
    >`
      SELECT id, hole_number, shot_number, start_distance_m, start_lie,
             end_distance_m, end_lie, is_holed, club, distance_type,
             shot_category, is_estimated, data_source, confidence
      FROM shot_events
      WHERE round_id = ${roundId}::uuid
      ORDER BY hole_number, shot_number
    `;

    return shots.map((s) => ({
      shotId: s.id,
      holeNumber: s.hole_number,
      shotNumber: s.shot_number,
      startDistanceM: s.start_distance_m,
      startLie: s.start_lie as any,
      endDistanceM: s.end_distance_m,
      endLie: s.end_lie as any,
      isHoled: s.is_holed,
      club: s.club ?? undefined,
      distanceType: s.distance_type as any,
      shotCategory: s.shot_category as any,
      isEstimated: s.is_estimated,
      dataSource: s.data_source as any,
      confidence: s.confidence ?? undefined,
    }));
  }

  /**
   * Get SG result for a round
   */
  private async getSGResult(roundId: string): Promise<SGRoundResultData | null> {
    const result = await this.prisma.$queryRaw<
      Array<{
        sg_tee: number | null;
        sg_approach: number | null;
        sg_short_game: number | null;
        sg_putting: number | null;
        sg_total: number | null;
        shot_count_tee: number;
        shot_count_approach: number;
        shot_count_short_game: number;
        shot_count_putting: number;
        holes_with_sg: number;
        total_holes: number;
        coverage_percent: number;
        baseline_version: string;
      }>
    >`
      SELECT sg_tee, sg_approach, sg_short_game, sg_putting, sg_total,
             shot_count_tee, shot_count_approach, shot_count_short_game, shot_count_putting,
             holes_with_sg, total_holes, coverage_percent, baseline_version
      FROM sg_round_results
      WHERE round_id = ${roundId}::uuid
    `;

    if (result.length === 0) return null;

    const r = result[0];
    return {
      roundId,
      sgTee: r.sg_tee,
      sgApproach: r.sg_approach,
      sgShortGame: r.sg_short_game,
      sgPutting: r.sg_putting,
      sgTotal: r.sg_total,
      shotCountTee: r.shot_count_tee,
      shotCountApproach: r.shot_count_approach,
      shotCountShortGame: r.shot_count_short_game,
      shotCountPutting: r.shot_count_putting,
      holesWithSG: r.holes_with_sg,
      totalHoles: r.total_holes,
      coveragePercent: r.coverage_percent,
      baselineVersion: r.baseline_version,
    };
  }

  /**
   * Get player SG trends
   */
  async getPlayerTrends(
    tenantId: string,
    playerId: string,
    options: { period: string; minCoverage: number }
  ): Promise<{
    rounds: Array<{
      roundId: string;
      roundDate: string;
      courseName: string | null;
      sgTee: number | null;
      sgApproach: number | null;
      sgShortGame: number | null;
      sgPutting: number | null;
      sgTotal: number | null;
      coveragePercent: number;
    }>;
    averages: {
      sgTee: number | null;
      sgApproach: number | null;
      sgShortGame: number | null;
      sgPutting: number | null;
      sgTotal: number | null;
    };
  }> {
    // Calculate date range
    const periodDays: Record<string, number> = {
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '1y': 365,
      all: 3650,
    };
    const days = periodDays[options.period] ?? 90;

    const rounds = await this.prisma.$queryRaw<
      Array<{
        round_id: string;
        round_date: Date;
        course_name: string | null;
        sg_tee: number | null;
        sg_approach: number | null;
        sg_short_game: number | null;
        sg_putting: number | null;
        sg_total: number | null;
        coverage_percent: number;
      }>
    >`
      SELECT gr.id as round_id, gr.round_date, gr.course_name,
             sr.sg_tee, sr.sg_approach, sr.sg_short_game, sr.sg_putting, sr.sg_total,
             sr.coverage_percent
      FROM golf_rounds gr
      JOIN sg_round_results sr ON sr.round_id = gr.id
      WHERE gr.tenant_id = ${tenantId}::uuid
        AND gr.player_id = ${playerId}::uuid
        AND gr.status = 'FINALIZED'
        AND gr.round_date >= now() - ${days + ' days'}::interval
        AND sr.coverage_percent >= ${options.minCoverage}
      ORDER BY gr.round_date DESC
    `;

    // Calculate averages
    const validRounds = rounds.filter((r) => r.sg_total !== null);
    const avg = (field: 'sg_tee' | 'sg_approach' | 'sg_short_game' | 'sg_putting' | 'sg_total') => {
      const values = validRounds.map((r) => r[field]).filter((v): v is number => v !== null);
      return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 1000) / 1000 : null;
    };

    return {
      rounds: rounds.map((r) => ({
        roundId: r.round_id,
        roundDate: r.round_date.toISOString().split('T')[0],
        courseName: r.course_name,
        sgTee: r.sg_tee,
        sgApproach: r.sg_approach,
        sgShortGame: r.sg_short_game,
        sgPutting: r.sg_putting,
        sgTotal: r.sg_total,
        coveragePercent: r.coverage_percent,
      })),
      averages: {
        sgTee: avg('sg_tee'),
        sgApproach: avg('sg_approach'),
        sgShortGame: avg('sg_short_game'),
        sgPutting: avg('sg_putting'),
        sgTotal: avg('sg_total'),
      },
    };
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function getRoundService(prisma: PrismaClient): RoundService {
  return new RoundService(prisma);
}
