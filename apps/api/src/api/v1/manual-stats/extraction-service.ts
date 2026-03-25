/**
 * Image Extraction Service
 *
 * AI-powered extraction of golf round data from images of paper notes.
 * Supports human-in-the-loop review for low-confidence fields.
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  ExtractionStatus,
  type AIExtractionOutput,
  type ExtractionHoleData,
} from './types';
import { AIExtractionOutputSchema } from './schemas';
import { logger } from '../../../utils/logger';
import { config } from '../../../config';

// ============================================================================
// CONFIDENCE THRESHOLDS
// ============================================================================

const CONFIDENCE_THRESHOLDS = {
  FIELD_REQUIRES_REVIEW: 0.7, // Fields below this need review
  HOLE_REQUIRES_REVIEW: 0.65, // Holes below this are flagged
  EXTRACTION_AUTO_APPROVE: 0.85, // Above this, extraction is auto-approved
};

// ============================================================================
// AI PROMPT TEMPLATES
// ============================================================================

const EXTRACTION_SYSTEM_PROMPT = `You are a golf scorecard OCR system. You extract data from images of handwritten golf notes.

OUTPUT FORMAT: JSON matching this exact schema:
{
  "round_date": "YYYY-MM-DD or null",
  "course": "course name or null",
  "holes": [
    {
      "hole_number": 1-18,
      "hole_length_m": meters or null,
      "hole_par": 3-6 or null,
      "hole_score": score or null,
      "tee": {
        "club": "Driver/3W/etc",
        "distance_m": total distance,
        "distance_type": "TOTAL" or "CARRY",
        "confidence": 0.0-1.0
      } or null,
      "approach": {
        "start_distance_m": distance to pin,
        "lie": "FAIRWAY/ROUGH/BUNKER/RECOVERY/GREEN/OTHER",
        "club": "7i/8i/PW/etc",
        "end": {
          "distance_to_hole_m": distance after shot,
          "lie": "GREEN/ROUGH/BUNKER/etc"
        } or null,
        "confidence": 0.0-1.0
      } or null,
      "short_game": {
        "start_distance_m": distance to pin,
        "lie": "ROUGH/BUNKER/FAIRWAY/OTHER",
        "club": "SW/LW/etc or null",
        "end_distance_m": putt length after or null,
        "confidence": 0.0-1.0
      } or null,
      "putting": {
        "first_putt_m": first putt length,
        "putts": total putts,
        "confidence": 0.0-1.0
      } or null,
      "notes": "any special notes",
      "overall_confidence": 0.0-1.0,
      "requires_review": true/false,
      "review_fields": ["field1", "field2"]
    }
  ],
  "notes": "general notes",
  "overall_confidence": 0.0-1.0
}

RULES:
1. Extract ALL visible hole data, even if partial
2. Use confidence 0.0-1.0 based on legibility
3. Mark "requires_review: true" if any field confidence < 0.7
4. List specific fields needing review in "review_fields"
5. Distances should be in METERS
6. Common clubs: Driver, 3W, 5W, 3-9i, PW, GW, SW, LW, Putter
7. If unsure between two values, pick most likely and lower confidence
8. NEVER guess values - use null if truly unreadable`;

const EXTRACTION_USER_PROMPT = `Extract all golf round data from this scorecard image.
Pay special attention to:
- Hole numbers and scores
- Club selections (Driver, irons, wedges)
- Distances to hole (in meters)
- Lie types (Fairway, Rough, Bunker)
- Putt counts and distances

Return ONLY valid JSON matching the specified schema.`;

// ============================================================================
// EXTRACTION SERVICE
// ============================================================================

export class ExtractionService {
  private readonly modelVersion = 'claude-3-5-sonnet-20241022';
  private readonly promptVersion = 'v1.0';

  constructor(private prisma: PrismaClient) {}

  /**
   * Start extraction for an image
   */
  async startExtraction(imageId: string): Promise<string> {
    const extractionId = uuidv4();

    // Create extraction record
    await this.prisma.$executeRaw`
      INSERT INTO image_extractions
      (id, image_id, status, attempt_count, model_version, prompt_version, created_at)
      VALUES (${extractionId}::uuid, ${imageId}::uuid, 'PENDING', 0, ${this.modelVersion}, ${this.promptVersion}, now())
    `;

    // Queue extraction job
    // In production, this would go to BullMQ
    this.processExtraction(extractionId).catch((error) => {
      logger.error({ error, extractionId }, 'Extraction processing failed');
    });

    return extractionId;
  }

  /**
   * Process extraction (async job)
   */
  async processExtraction(extractionId: string): Promise<void> {
    try {
      // Update status to processing
      await this.prisma.$executeRaw`
        UPDATE image_extractions
        SET status = 'PROCESSING', attempt_count = attempt_count + 1, last_attempt_at = now()
        WHERE id = ${extractionId}::uuid
      `;

      // Get image data
      const extraction = await this.prisma.$queryRaw<
        Array<{
          id: string;
          image_id: string;
          original_path: string;
        }>
      >`
        SELECT ie.id, ie.image_id, ri.original_path
        FROM image_extractions ie
        JOIN round_images ri ON ri.id = ie.image_id
        WHERE ie.id = ${extractionId}::uuid
      `;

      if (extraction.length === 0) {
        throw new Error('Extraction not found');
      }

      // Call AI for extraction
      const rawExtraction = await this.callAIExtraction(extraction[0].original_path);

      // Validate and parse
      const parsedData = this.validateAndEnhance(rawExtraction);

      // Determine status based on confidence
      const status = this.determineStatus(parsedData);

      // Update extraction record
      await this.prisma.$executeRaw`
        UPDATE image_extractions
        SET
          status = ${status}::text,
          raw_extraction = ${JSON.stringify(rawExtraction)}::jsonb,
          parsed_data = ${JSON.stringify(parsedData)}::jsonb,
          overall_confidence = ${parsedData.overall_confidence},
          fields_requiring_review = ${this.countReviewFields(parsedData)},
          completed_at = now()
        WHERE id = ${extractionId}::uuid
      `;

      // Create hole extraction records
      await this.createHoleExtractions(extractionId, parsedData.holes);

      logger.info(
        { extractionId, status, confidence: parsedData.overall_confidence },
        'Extraction completed'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ error: message, extractionId }, 'Extraction failed');

      await this.prisma.$executeRaw`
        UPDATE image_extractions
        SET status = 'FAILED', error_message = ${message}
        WHERE id = ${extractionId}::uuid
      `;
    }
  }

  /**
   * Call AI model for extraction (mock for development)
   */
  private async callAIExtraction(imagePath: string): Promise<unknown> {
    // In production, this would call Claude API with the image
    // For now, return a mock extraction
    logger.info({ imagePath }, 'Calling AI extraction (mock)');

    // Mock response for development
    return {
      round_date: new Date().toISOString().split('T')[0],
      course: 'Mock Golf Course',
      holes: this.generateMockHoles(),
      notes: 'Mock extraction',
      overall_confidence: 0.82,
      extraction_timestamp: new Date().toISOString(),
      model_version: this.modelVersion,
      prompt_version: this.promptVersion,
    };
  }

  /**
   * Generate mock holes for testing
   */
  private generateMockHoles(): ExtractionHoleData[] {
    const holes: ExtractionHoleData[] = [];
    const clubs = ['Driver', '3W', '5i', '6i', '7i', '8i', '9i', 'PW', 'SW'];
    const lies = ['FAIRWAY', 'ROUGH', 'BUNKER'] as const;

    for (let i = 1; i <= 18; i++) {
      const par = i <= 4 ? 4 : i % 3 === 0 ? 3 : i % 5 === 0 ? 5 : 4;
      const holeLength = par === 3 ? 150 : par === 5 ? 480 : 380;
      const teeDistance = par === 3 ? 0 : Math.floor(220 + Math.random() * 60);
      const approachDistance = Math.floor(holeLength - teeDistance);
      const puttLength = Math.floor(3 + Math.random() * 8);
      const putts = puttLength > 6 ? 2 : 1;

      holes.push({
        hole_number: i,
        hole_length_m: holeLength,
        hole_par: par,
        hole_score: par + Math.floor(Math.random() * 2),
        tee:
          par > 3
            ? {
                club: 'Driver',
                distance_m: teeDistance,
                distance_type: 'TOTAL' as const,
                confidence: 0.75 + Math.random() * 0.2,
              }
            : undefined,
        approach:
          approachDistance > 0
            ? {
                start_distance_m: approachDistance,
                lie: lies[Math.floor(Math.random() * lies.length)],
                club: clubs[Math.floor(4 + Math.random() * 5)],
                end: {
                  distance_to_hole_m: puttLength,
                  lie: 'GREEN' as const,
                },
                confidence: 0.7 + Math.random() * 0.25,
              }
            : undefined,
        putting: {
          first_putt_m: puttLength,
          putts: putts,
          confidence: 0.8 + Math.random() * 0.15,
        },
        overall_confidence: 0.75 + Math.random() * 0.2,
        requires_review: Math.random() < 0.2,
        review_fields: Math.random() < 0.2 ? ['tee.distance_m'] : [],
      });
    }

    return holes;
  }

  /**
   * Validate and enhance extraction result
   */
  private validateAndEnhance(raw: unknown): AIExtractionOutput {
    try {
      const parsed = AIExtractionOutputSchema.parse(raw);

      // Enhance with review flags
      for (const hole of parsed.holes) {
        const reviewFields: string[] = [];

        if (hole.tee && hole.tee.confidence < CONFIDENCE_THRESHOLDS.FIELD_REQUIRES_REVIEW) {
          reviewFields.push('tee.distance_m', 'tee.club');
        }
        if (hole.approach && hole.approach.confidence < CONFIDENCE_THRESHOLDS.FIELD_REQUIRES_REVIEW) {
          reviewFields.push('approach.start_distance_m', 'approach.lie', 'approach.club');
        }
        if (hole.putting && hole.putting.confidence < CONFIDENCE_THRESHOLDS.FIELD_REQUIRES_REVIEW) {
          reviewFields.push('putting.first_putt_m', 'putting.putts');
        }

        hole.review_fields = [...new Set([...hole.review_fields, ...reviewFields])];
        hole.requires_review = hole.review_fields.length > 0;
      }

      return parsed;
    } catch (error) {
      logger.warn({ error }, 'Extraction validation failed, using fallback');
      throw error;
    }
  }

  /**
   * Determine extraction status based on confidence
   */
  private determineStatus(data: AIExtractionOutput): ExtractionStatus {
    if (data.overall_confidence >= CONFIDENCE_THRESHOLDS.EXTRACTION_AUTO_APPROVE) {
      return ExtractionStatus.COMPLETED;
    }

    const reviewCount = data.holes.filter((h) => h.requires_review).length;
    if (reviewCount > 0) {
      return ExtractionStatus.REQUIRES_REVIEW;
    }

    return ExtractionStatus.COMPLETED;
  }

  /**
   * Count fields requiring review
   */
  private countReviewFields(data: AIExtractionOutput): number {
    return data.holes.reduce((sum, hole) => sum + hole.review_fields.length, 0);
  }

  /**
   * Create hole extraction records
   */
  private async createHoleExtractions(
    extractionId: string,
    holes: ExtractionHoleData[]
  ): Promise<void> {
    for (const hole of holes) {
      await this.prisma.$executeRaw`
        INSERT INTO extraction_hole_data (
          id, extraction_id, hole_number, hole_length_m, hole_par, hole_score,
          tee_club, tee_distance_m, tee_distance_type, tee_confidence,
          approach_start_distance_m, approach_lie, approach_club, approach_end_distance_m, approach_end_lie, approach_confidence,
          first_putt_length_m, putts_count, putting_confidence,
          overall_confidence, is_partial, requires_review, review_fields
        ) VALUES (
          gen_random_uuid(),
          ${extractionId}::uuid,
          ${hole.hole_number},
          ${hole.hole_length_m ?? null},
          ${hole.hole_par ?? null},
          ${hole.hole_score ?? null},
          ${hole.tee?.club ?? null},
          ${hole.tee?.distance_m ?? null},
          ${hole.tee?.distance_type ?? null},
          ${hole.tee?.confidence ?? null},
          ${hole.approach?.start_distance_m ?? null},
          ${hole.approach?.lie ?? null},
          ${hole.approach?.club ?? null},
          ${hole.approach?.end?.distance_to_hole_m ?? null},
          ${hole.approach?.end?.lie ?? null},
          ${hole.approach?.confidence ?? null},
          ${hole.putting?.first_putt_m ?? null},
          ${hole.putting?.putts ?? null},
          ${hole.putting?.confidence ?? null},
          ${hole.overall_confidence},
          ${hole.overall_confidence < 0.5},
          ${hole.requires_review},
          ${hole.review_fields}
        )
      `;
    }
  }

  /**
   * Get extraction status
   */
  async getExtractionStatus(extractionId: string): Promise<{
    status: ExtractionStatus;
    overallConfidence: number | null;
    fieldsRequiringReview: number;
    errorMessage: string | null;
    holes: ExtractionHoleData[];
  } | null> {
    const result = await this.prisma.$queryRaw<
      Array<{
        status: ExtractionStatus;
        overall_confidence: number | null;
        fields_requiring_review: number;
        error_message: string | null;
        parsed_data: AIExtractionOutput | null;
      }>
    >`
      SELECT status, overall_confidence, fields_requiring_review, error_message, parsed_data
      FROM image_extractions
      WHERE id = ${extractionId}::uuid
    `;

    if (result.length === 0) return null;

    const extraction = result[0];
    return {
      status: extraction.status,
      overallConfidence: extraction.overall_confidence,
      fieldsRequiringReview: extraction.fields_requiring_review,
      errorMessage: extraction.error_message,
      holes: extraction.parsed_data?.holes ?? [],
    };
  }

  /**
   * Apply user correction to extraction
   */
  async applyCorrection(
    extractionId: string,
    holeNumber: number,
    field: string,
    value: unknown,
    userId: string,
    reason?: string
  ): Promise<void> {
    // Get round ID for audit trail
    const extraction = await this.prisma.$queryRaw<
      Array<{ round_id: string; entity_id: string }>
    >`
      SELECT ri.round_id, ehd.id as entity_id
      FROM image_extractions ie
      JOIN round_images ri ON ri.id = ie.image_id
      JOIN extraction_hole_data ehd ON ehd.extraction_id = ie.id AND ehd.hole_number = ${holeNumber}
      WHERE ie.id = ${extractionId}::uuid
    `;

    if (extraction.length === 0) {
      throw new Error('Extraction or hole not found');
    }

    // Get previous value
    const previousValue = await this.getFieldValue(extractionId, holeNumber, field);

    // Update the field
    await this.updateExtractionField(extractionId, holeNumber, field, value);

    // Create audit record
    await this.prisma.$executeRaw`
      INSERT INTO user_overrides (
        id, round_id, user_id, entity_type, entity_id, field_name, previous_value, new_value, reason, created_at
      ) VALUES (
        gen_random_uuid(),
        ${extraction[0].round_id}::uuid,
        ${userId}::uuid,
        'extraction_hole',
        ${extraction[0].entity_id}::uuid,
        ${field},
        ${previousValue ? String(previousValue) : null},
        ${String(value)},
        ${reason ?? null},
        now()
      )
    `;
  }

  /**
   * Get a field value from extraction
   */
  private async getFieldValue(
    extractionId: string,
    holeNumber: number,
    field: string
  ): Promise<unknown> {
    // Map field names to database columns
    const fieldMap: Record<string, string> = {
      'tee.club': 'tee_club',
      'tee.distance_m': 'tee_distance_m',
      'approach.start_distance_m': 'approach_start_distance_m',
      'approach.lie': 'approach_lie',
      'approach.club': 'approach_club',
      'putting.first_putt_m': 'first_putt_length_m',
      'putting.putts': 'putts_count',
    };

    const column = fieldMap[field];
    if (!column) return null;

    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT ${column} as value
      FROM extraction_hole_data
      WHERE extraction_id = ${extractionId}::uuid AND hole_number = ${holeNumber}
    `;

    return result[0]?.value ?? null;
  }

  /**
   * Update an extraction field
   */
  private async updateExtractionField(
    extractionId: string,
    holeNumber: number,
    field: string,
    value: unknown
  ): Promise<void> {
    // Map field to column
    const fieldMap: Record<string, string> = {
      'tee.club': 'tee_club',
      'tee.distance_m': 'tee_distance_m',
      'approach.start_distance_m': 'approach_start_distance_m',
      'approach.lie': 'approach_lie',
      'approach.club': 'approach_club',
      'putting.first_putt_m': 'first_putt_length_m',
      'putting.putts': 'putts_count',
      hole_score: 'hole_score',
    };

    const column = fieldMap[field];
    if (!column) {
      throw new Error(`Unknown field: ${field}`);
    }

    // Dynamic update (safe because column is from our whitelist)
    await this.prisma.$executeRawUnsafe(
      `UPDATE extraction_hole_data SET ${column} = $1 WHERE extraction_id = $2::uuid AND hole_number = $3`,
      value,
      extractionId,
      holeNumber
    );

    // Remove from review fields
    await this.prisma.$executeRaw`
      UPDATE extraction_hole_data
      SET review_fields = array_remove(review_fields, ${field})
      WHERE extraction_id = ${extractionId}::uuid AND hole_number = ${holeNumber}
    `;
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function getExtractionService(prisma: PrismaClient): ExtractionService {
  return new ExtractionService(prisma);
}
