import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeUpdates, WS_EVENTS } from './useRealtimeUpdates';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook for handling video-related WebSocket notifications
 * Subscribe to video events and show toast notifications
 */
export function useVideoNotifications() {
  const { subscribe, isConnected } = useRealtimeUpdates({ autoConnect: true });
  const { success, info, showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers = [];

    // Video uploaded notification
    unsubscribers.push(
      subscribe(WS_EVENTS.VIDEO_UPLOADED, (payload) => {
        success(`Video "${payload.title}" er lastet opp`, 4000, {
          title: 'Video lastet opp',
          showPush: true,
          action: () => navigate(`/videos/${payload.videoId}`),
          actionLabel: 'Se video',
        });
      })
    );

    // Video request created notification (for players)
    unsubscribers.push(
      subscribe(WS_EVENTS.VIDEO_REQUEST_CREATED, (payload) => {
        showNotification(
          `Treneren din har bedt om en ${payload.drillType || payload.category || 'video'}`,
          'info',
          0, // Persistent until dismissed
          {
            title: 'Ny videoforespørsel',
            showPush: true,
            action: () => navigate('/videos?tab=requests'),
            actionLabel: 'Last opp video',
          }
        );
      })
    );

    // Video shared notification (for players)
    unsubscribers.push(
      subscribe(WS_EVENTS.VIDEO_SHARED, (payload) => {
        info(`Treneren har delt en video med deg: "${payload.title}"`, 5000, {
          title: 'Ny delt video',
          showPush: true,
          action: () => navigate(`/videos/${payload.videoId}`),
          actionLabel: 'Se video',
        });
      })
    );

    // Video reviewed notification (for players)
    unsubscribers.push(
      subscribe(WS_EVENTS.VIDEO_REVIEWED, (payload) => {
        success(`Videoen din "${payload.title}" er gjennomgått av treneren`, 5000, {
          title: 'Video gjennomgått',
          showPush: true,
          action: () => navigate(`/videos/${payload.videoId}`),
          actionLabel: 'Se tilbakemelding',
        });
      })
    );

    // Annotation added notification (for video owners)
    unsubscribers.push(
      subscribe(WS_EVENTS.ANNOTATION_ADDED, (payload) => {
        info(`Ny annotasjon på "${payload.videoTitle}"`, 4000, {
          title: 'Ny annotasjon',
          showPush: true,
          action: () => navigate(`/videos/${payload.videoId}?t=${payload.timestamp}`),
          actionLabel: 'Se annotasjon',
        });
      })
    );

    // Video comment added notification
    unsubscribers.push(
      subscribe(WS_EVENTS.VIDEO_COMMENT_ADDED, (payload) => {
        info(`Ny kommentar på "${payload.videoTitle}"`, 4000, {
          title: 'Ny kommentar',
          showPush: true,
          action: () => navigate(`/videos/${payload.videoId}`),
          actionLabel: 'Se kommentar',
        });
      })
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [isConnected, subscribe, success, info, showNotification, navigate]);

  return { isConnected };
}

export default useVideoNotifications;
