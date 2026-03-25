import { z } from 'zod';

/**
 * Video Annotation validation schemas
 */

// Drawing data schema for various annotation types
const drawingDataSchema = z.object({
  // Common fields
  points: z.array(z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  })).optional(),
  // Line/Arrow specific
  startPoint: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  endPoint: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  // Circle specific
  center: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  radius: z.number().min(0).max(1).optional(),
  // Angle specific
  vertex: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  arm1End: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  arm2End: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  angleValue: z.number().min(0).max(360).optional(),
  // Text specific
  text: z.string().max(500).optional(),
  fontSize: z.number().min(8).max(72).optional(),
  position: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
});

// Create annotation
export const createAnnotationSchema = z.object({
  videoId: z.string().uuid(),
  timestamp: z.number().min(0), // seconds with decimal precision
  duration: z.number().min(0).optional(), // for range annotations
  frameNumber: z.number().int().min(0).optional(),
  type: z.enum(['line', 'circle', 'arrow', 'angle', 'freehand', 'text']),
  drawingData: drawingDataSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FF0000'),
  strokeWidth: z.number().int().min(1).max(20).default(3),
  note: z.string().max(1000).optional(),
});

export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;

// Update annotation
export const updateAnnotationSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number().min(0).optional(),
  duration: z.number().min(0).optional().nullable(),
  frameNumber: z.number().int().min(0).optional().nullable(),
  type: z.enum(['line', 'circle', 'arrow', 'angle', 'freehand', 'text']).optional(),
  drawingData: drawingDataSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  strokeWidth: z.number().int().min(1).max(20).optional(),
  note: z.string().max(1000).optional().nullable(),
});

export type UpdateAnnotationInput = z.infer<typeof updateAnnotationSchema>;

// List annotations for a video
export const listAnnotationsSchema = z.object({
  videoId: z.string().uuid(),
  type: z.enum(['line', 'circle', 'arrow', 'angle', 'freehand', 'text']).optional(),
  startTimestamp: z.number().min(0).optional(),
  endTimestamp: z.number().min(0).optional(),
});

export type ListAnnotationsInput = z.infer<typeof listAnnotationsSchema>;

// Get annotation by ID
export const getAnnotationSchema = z.object({
  id: z.string().uuid(),
});

export type GetAnnotationInput = z.infer<typeof getAnnotationSchema>;

// Delete annotation
export const deleteAnnotationSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteAnnotationInput = z.infer<typeof deleteAnnotationSchema>;

// Audio annotation - get upload URL for voice-over
export const getAudioUploadUrlSchema = z.object({
  annotationId: z.string().uuid(),
  mimeType: z.enum(['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav']),
  duration: z.number().min(0).max(300), // max 5 minutes
});

export type GetAudioUploadUrlInput = z.infer<typeof getAudioUploadUrlSchema>;

// Confirm audio upload
export const confirmAudioUploadSchema = z.object({
  annotationId: z.string().uuid(),
  audioDuration: z.number().min(0).max(300),
});

export type ConfirmAudioUploadInput = z.infer<typeof confirmAudioUploadSchema>;

// Bulk create annotations
export const bulkCreateAnnotationsSchema = z.object({
  videoId: z.string().uuid(),
  annotations: z.array(z.object({
    timestamp: z.number().min(0),
    duration: z.number().min(0).optional(),
    frameNumber: z.number().int().min(0).optional(),
    type: z.enum(['line', 'circle', 'arrow', 'angle', 'freehand', 'text']),
    drawingData: drawingDataSchema,
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FF0000'),
    strokeWidth: z.number().int().min(1).max(20).default(3),
    note: z.string().max(1000).optional(),
  })).min(1).max(50),
});

export type BulkCreateAnnotationsInput = z.infer<typeof bulkCreateAnnotationsSchema>;
