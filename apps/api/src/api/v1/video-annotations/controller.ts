/**
 * Video Annotations Controller
 *
 * Handles video annotation operations (drawings, angles, text, etc.)
 */

import { Request, Response } from 'express';
import * as videoAnnotationsService from './service.js';
import { z } from 'zod';

// Validation schemas
const createAnnotationSchema = z.object({
  videoId: z.string().uuid(),
  type: z.enum(['line', 'circle', 'arrow', 'angle', 'freehand', 'text']),
  timestamp: z.number().min(0),
  duration: z.number().min(0).optional(),
  frameNumber: z.number().int().optional(),
  drawingData: z.object({
    points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
    text: z.string().optional(),
    angle: z.number().optional(),
  }),
  color: z.string().default('#FF0000'),
  strokeWidth: z.number().int().min(1).max(20).default(3),
  note: z.string().optional(),
  audioKey: z.string().optional(),
  audioDuration: z.number().optional(),
});

const updateAnnotationSchema = createAnnotationSchema.partial().omit({ videoId: true });

/**
 * Get all annotations for a video
 */
export async function getAnnotationsByVideo(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    const annotations = await videoAnnotationsService.getAnnotationsByVideoId(videoId);

    res.json({
      success: true,
      data: annotations,
    });
  } catch (error) {
    console.error('Error fetching video annotations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch annotations',
    });
  }
}

/**
 * Create a new annotation
 */
export async function createAnnotation(req: Request, res: Response) {
  try {
    const validated = createAnnotationSchema.parse(req.body);
    const userId = req.user!.id;

    const annotation = await videoAnnotationsService.createAnnotation({
      ...validated,
      createdById: userId,
    });

    res.status(201).json({
      success: true,
      data: annotation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error creating annotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create annotation',
    });
  }
}

/**
 * Update an annotation
 */
export async function updateAnnotation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = updateAnnotationSchema.parse(req.body);
    const userId = req.user!.id;

    const annotation = await videoAnnotationsService.updateAnnotation(id, userId, validated);

    if (!annotation) {
      return res.status(404).json({
        success: false,
        error: 'Annotation not found or unauthorized',
      });
    }

    res.json({
      success: true,
      data: annotation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error updating annotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update annotation',
    });
  }
}

/**
 * Delete an annotation
 */
export async function deleteAnnotation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const deleted = await videoAnnotationsService.deleteAnnotation(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Annotation not found or unauthorized',
      });
    }

    res.json({
      success: true,
      message: 'Annotation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete annotation',
    });
  }
}

/**
 * Get annotations at a specific timestamp
 */
export async function getAnnotationsAtTimestamp(req: Request, res: Response) {
  try {
    const { videoId, timestamp } = req.params;
    const timestampNum = parseFloat(timestamp);

    if (isNaN(timestampNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timestamp',
      });
    }

    const annotations = await videoAnnotationsService.getAnnotationsAtTimestamp(
      videoId,
      timestampNum
    );

    res.json({
      success: true,
      data: annotations,
    });
  } catch (error) {
    console.error('Error fetching annotations at timestamp:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch annotations',
    });
  }
}
