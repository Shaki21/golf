import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { subscribeToPush } from '../serviceWorkerRegistration';

// =============================================================================
// Types
// =============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type PushPermission = 'default' | 'granted' | 'denied';

export interface InAppNotification {
  id: number;
  message: string;
  type: NotificationType;
  title?: string;
  action?: () => void;
  actionLabel?: string;
  persistent: boolean;
  timestamp: Date;
}

export interface NotificationOptions {
  title?: string;
  action?: () => void;
  actionLabel?: string;
  showPush?: boolean;
  tag?: string;
}

export interface PushNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  vibrate?: number[];
  requireInteraction?: boolean;
  onClick?: () => void;
}

export interface NotificationContextValue {
  // In-app notifications
  notifications: InAppNotification[];
  showNotification: (message: string, type?: NotificationType, duration?: number, options?: NotificationOptions) => number;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
  success: (message: string, duration?: number, options?: NotificationOptions) => number;
  error: (message: string, duration?: number, options?: NotificationOptions) => number;
  info: (message: string, duration?: number, options?: NotificationOptions) => number;
  warning: (message: string, duration?: number, options?: NotificationOptions) => number;

  // Push notifications
  pushPermission: PushPermission;
  requestPushPermission: () => Promise<boolean>;
  showPushNotification: (title: string, options?: PushNotificationOptions) => Notification | null;
  subscribeToPushNotifications: (token: string) => Promise<boolean>;
  isPushSupported: boolean;
  isPushEnabled: boolean;

  // Real-time updates
  connectRealtime: (userId: string, token: string) => void;
  disconnectRealtime: () => void;
  realtimeConnected: boolean;
  isOnline: boolean;

  // Unread count
  unreadCount: number;
  markAsRead: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

interface RealtimeMessage {
  type: string;
  message?: string;
  notificationType?: NotificationType;
  duration?: number;
  title?: string;
  id?: string;
  from?: string;
  conversationId?: string;
  sessionTitle?: string;
  minutesUntil?: number;
  sessionId?: string;
  achievementTitle?: string;
}

// =============================================================================
// Constants
// =============================================================================

const PUSH_PERMISSION = {
  DEFAULT: 'default' as PushPermission,
  GRANTED: 'granted' as PushPermission,
  DENIED: 'denied' as PushPermission,
};

// =============================================================================
// Context
// =============================================================================

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// =============================================================================
// Provider
// =============================================================================

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [pushPermission, setPushPermission] = useState<PushPermission>(PUSH_PERMISSION.DEFAULT);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 1000; // 1 second
  const MAX_RECONNECT_DELAY = 30000; // 30 seconds

  // Check push notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission as PushPermission);
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request push notification permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission as PushPermission);
      return permission === PUSH_PERMISSION.GRANTED;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  // Show a browser push notification
  const showPushNotification = useCallback((title: string, options: PushNotificationOptions = {}): Notification | null => {
    if (pushPermission !== PUSH_PERMISSION.GRANTED) {
      console.warn('Push notifications not permitted');
      return null;
    }

    const defaultOptions: NotificationOptions & { icon: string; badge: string; vibrate: number[]; requireInteraction: boolean } = {
      icon: '/logo192.png',
      badge: '/badge-icon.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      notification.onclick = (): void => {
        window.focus();
        if (options.onClick) options.onClick();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Failed to show push notification:', error);
      return null;
    }
  }, [pushPermission]);

  // Subscribe to push notifications and register with backend
  const subscribeToPushNotifications = useCallback(async (token: string): Promise<boolean> => {
    if (pushPermission !== PUSH_PERMISSION.GRANTED) {
      console.warn('Push notifications not permitted');
      return false;
    }

    try {
      // Get push subscription from service worker
      const subscription = await subscribeToPush();
      if (!subscription) {
        console.error('Failed to get push subscription');
        return false;
      }

      // Extract keys from subscription
      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys;
      if (!keys || !keys.p256dh || !keys.auth) {
        console.error('Push subscription missing keys');
        return false;
      }

      // Send subscription to backend
      const apiUrl = process.env.REACT_APP_API_URL || '/api/v1';
      const response = await fetch(`${apiUrl}/notifications/push-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
          deviceType: 'web',
        }),
      });

      if (!response.ok) {
        console.error('Failed to register push subscription with backend');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [pushPermission]);

  // Show in-app notification (toast)
  const showNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    duration: number = 3000,
    options: NotificationOptions = {}
  ): number => {
    const id = Date.now();
    const notification: InAppNotification = {
      id,
      message,
      type,
      title: options.title,
      action: options.action,
      actionLabel: options.actionLabel,
      persistent: duration === 0,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, notification]);

    // Also show push notification if enabled and app is in background
    if (options.showPush && document.hidden && pushPermission === PUSH_PERMISSION.GRANTED) {
      showPushNotification(options.title || 'TIER Golf', {
        body: message,
        tag: options.tag,
        onClick: options.action,
      });
    }

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, [pushPermission, showPushNotification]);

  const removeNotification = useCallback((id: number): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  // Handle incoming realtime messages
  const handleRealtimeMessage = useCallback((data: RealtimeMessage): void => {
    switch (data.type) {
      case 'notification':
        showNotification(data.message || '', data.notificationType || 'info', data.duration, {
          title: data.title,
          showPush: true,
          tag: data.id,
        });
        setUnreadCount(prev => prev + 1);
        break;

      case 'message':
        showNotification(`New message from ${data.from}`, 'info', 5000, {
          title: 'New message',
          showPush: true,
          action: () => { window.location.href = `/messages/${data.conversationId}`; },
          actionLabel: 'View message',
        });
        break;

      case 'session_reminder':
        showNotification(
          `Training session "${data.sessionTitle}" starts in ${data.minutesUntil} minutes`,
          'warning',
          0,
          {
            title: 'Reminder',
            showPush: true,
            action: () => { window.location.href = `/sessions/${data.sessionId}`; },
            actionLabel: 'View session',
          }
        );
        break;

      case 'achievement':
        showNotification(
          `You have unlocked "${data.achievementTitle}"!`,
          'success',
          5000,
          {
            title: 'New achievement!',
            showPush: true,
          }
        );
        break;

      case 'goal_progress':
        showNotification(
          data.message || '',
          'info',
          4000,
          {
            title: 'Goal progress',
            showPush: false,
          }
        );
        break;

      case 'coach_note':
        showNotification(
          `Your coach has added a note`,
          'info',
          5000,
          {
            title: 'New coach note',
            showPush: true,
            action: () => { window.location.href = '/notater'; },
            actionLabel: 'View note',
          }
        );
        break;

      default:
        console.warn('Unknown realtime message type:', data.type);
    }
  }, [showNotification]);

  /**
   * Calculate exponential backoff delay with jitter
   */
  const getReconnectDelay = useCallback((attempt: number): number => {
    const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, attempt), MAX_RECONNECT_DELAY);
    // Add jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Math.floor(delay + jitter);
  }, []);

  // Real-time updates with Server-Sent Events
  const connectRealtime = useCallback((userId: string, token: string): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (!userId || !token) {
      console.warn('Cannot connect to realtime: missing userId or token');
      return;
    }

    // Check if max attempts reached
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('Max reconnect attempts reached for realtime. Giving up.');
      return;
    }

    try {
      // Use notifications/stream endpoint with token in query param
      // (EventSource doesn't support custom headers)
      const apiUrl = process.env.REACT_APP_API_URL || '/api/v1';
      const eventSource = new EventSource(
        `${apiUrl}/notifications/stream?token=${token}`
      );

      eventSource.onopen = (): void => {
        setRealtimeConnected(true);
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event: MessageEvent): void => {
        try {
          const data = JSON.parse(event.data) as RealtimeMessage;
          handleRealtimeMessage(data);
        } catch (error) {
          console.error('Failed to parse realtime message:', error);
        }
      };

      eventSource.onerror = (): void => {
        // Only log once, don't spam console
        if (reconnectAttemptsRef.current === 0) {
          console.warn('Realtime connection error');
        }
        setRealtimeConnected(false);
        eventSource.close();

        // Check if we should retry
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && isOnline) {
          const delay = getReconnectDelay(reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;

          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isOnline) {
              connectRealtime(userId, token);
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.warn('Max reconnect attempts reached for realtime. Giving up.');
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to connect to realtime:', error);
    }
  }, [isOnline, handleRealtimeMessage, getReconnectDelay]);

  const disconnectRealtime = useCallback((): void => {
    // Stop any pending reconnect attempts
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setRealtimeConnected(false);
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback((): void => {
    setUnreadCount(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectRealtime();
    };
  }, [disconnectRealtime]);

  const value: NotificationContextValue = {
    // In-app notifications
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    success: (message, duration, options) => showNotification(message, 'success', duration, options),
    error: (message, duration, options) => showNotification(message, 'error', duration, options),
    info: (message, duration, options) => showNotification(message, 'info', duration, options),
    warning: (message, duration, options) => showNotification(message, 'warning', duration, options),

    // Push notifications
    pushPermission,
    requestPushPermission,
    showPushNotification,
    subscribeToPushNotifications,
    isPushSupported: 'Notification' in window,
    isPushEnabled: pushPermission === PUSH_PERMISSION.GRANTED,

    // Real-time updates
    connectRealtime,
    disconnectRealtime,
    realtimeConnected,
    isOnline,

    // Unread count
    unreadCount,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
