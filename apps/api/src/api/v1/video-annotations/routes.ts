/**
 * Video Annotations API Routes
 *
 * Endpoints for creating and managing video annotations (drawings, angles, etc.)
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import * as videoAnnotationsController from './controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/video-annotations/:videoId
 * Get all annotations for a specific video
 */
router.get('/:videoId', videoAnnotationsController.getAnnotationsByVideo);

/**
 * POST /api/v1/video-annotations
 * Create a new annotation on a video
 */
router.post('/', videoAnnotationsController.createAnnotation);

/**
 * PATCH /api/v1/video-annotations/:id
 * Update an existing annotation
 */
router.patch('/:id', videoAnnotationsController.updateAnnotation);

/**
 * DELETE /api/v1/video-annotations/:id
 * Delete an annotation
 */
router.delete('/:id', videoAnnotationsController.deleteAnnotation);

/**
 * GET /api/v1/video-annotations/:videoId/at/:timestamp
 * Get annotations at a specific timestamp
 */
router.get('/:videoId/at/:timestamp', videoAnnotationsController.getAnnotationsAtTimestamp);

export default router;
