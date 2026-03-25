/**
 * Hooks Index
 *
 * Re-exports all custom hooks for easier imports
 */

// Native feature hooks
export {
  useCamera,
  useHaptics,
  usePushNotifications,
  useFileSystem,
} from './useNativeFeatures';
export type {
  CapturedMedia,
  PushNotificationHandlers,
} from './useNativeFeatures';

// Data fetching hooks
export { useHomeData } from './useHomeData';
export { useSessionData } from './useSessionData';
export { useReflectionData } from './useReflectionData';
export { useBaselineData } from './useBaselineData';
export { useTrajectoryData } from './useTrajectoryData';
export { useProofData } from './useProofData';
