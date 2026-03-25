import { useVideoNotifications } from '../hooks/useVideoNotifications';

/**
 * Component that initializes and manages video-related WebSocket notifications.
 * Must be rendered inside NotificationProvider and AuthProvider.
 * This component doesn't render anything - it just sets up the event listeners.
 */
export function VideoNotificationManager() {
  useVideoNotifications();
  return null;
}

export default VideoNotificationManager;
