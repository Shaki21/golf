// Hooks Index
// Export all custom hooks for easy importing

export { default as useFormAutosave, formatLastSaved } from './useFormAutosave';
export { default as useVideoPlayer, PLAYBACK_SPEEDS } from './useVideoPlayer';
export { default as useAnnotationCanvas, TOOL_TYPES, ANNOTATION_COLORS, STROKE_WIDTHS } from './useAnnotationCanvas';
export { default as useVideoComparison, VIEW_MODES, SYNC_MODES } from './useVideoComparison';
export { default as useVideoUpload, UPLOAD_STATES, VIDEO_CATEGORIES, VIEW_ANGLES } from './useVideoUpload';
export { default as useAudioRecording, RECORDING_STATES, AUDIO_SETTINGS } from './useAudioRecording';
export { default as useVideos, useVideo, useVideoPlayback } from './useVideos';
export { default as useVideoAnnotations, useAnnotationAudio, useVideoComments } from './useVideoAnnotations';
export { default as useComparisonData, useComparisonVideos, useComparisonsList } from './useVideoComparisonApi';
export { default as useVideoRequests, REQUEST_STATUS } from './useVideoRequests';
export { default as useStrokesGained, useStrokesGained as useStrokesGainedNamed, usePeiToSg } from './useStrokesGained';
export { useRealTimePolling, formatLastUpdated } from './useRealTimePolling';
