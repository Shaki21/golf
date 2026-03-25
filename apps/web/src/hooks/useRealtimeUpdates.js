import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket event types
 */
export const WS_EVENTS = {
  // Session events
  SESSION_CREATED: 'session:created',
  SESSION_UPDATED: 'session:updated',
  SESSION_STARTED: 'session:started',
  SESSION_COMPLETED: 'session:completed',
  SESSION_EVALUATION_ADDED: 'session:evaluation_added',

  // Training plan events
  PLAN_UPDATED: 'plan:updated',
  PLAN_WEEK_CHANGED: 'plan:week_changed',

  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  BADGE_EARNED: 'badge:earned',

  // Coach events
  COACH_NOTE_ADDED: 'coach:note_added',
  COACH_FEEDBACK: 'coach:feedback',

  // Video events
  VIDEO_UPLOADED: 'video:uploaded',
  VIDEO_REQUEST_CREATED: 'video:request_created',
  VIDEO_SHARED: 'video:shared',
  VIDEO_REVIEWED: 'video:reviewed',
  ANNOTATION_ADDED: 'annotation:added',
  VIDEO_COMMENT_ADDED: 'video:comment_added',

  // Notification events
  NOTIFICATION: 'notification',

  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  CONNECTION_ACK: 'connection:ack',
  PING: 'ping',
  PONG: 'pong',
};

/**
 * Connection states
 */
export const WS_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

/**
 * Hook for real-time updates via WebSocket
 */
export function useRealtimeUpdates(options = {}) {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    baseReconnectDelay = 1000,
    maxReconnectDelay = 30000,
    pingInterval = 30000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const listenersRef = useRef(new Map());

  // Use refs for connection state to avoid re-renders on connection errors
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(WS_STATE.CLOSED);
  const [lastMessage, setLastMessage] = useState(null);
  const errorRef = useRef(null);
  const [error, setError] = useState(null);

  /**
   * Calculate exponential backoff delay
   */
  const getReconnectDelay = useCallback((attempt) => {
    const delay = Math.min(baseReconnectDelay * Math.pow(2, attempt), maxReconnectDelay);
    // Add jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Math.floor(delay + jitter);
  }, [baseReconnectDelay, maxReconnectDelay]);

  /**
   * Get WebSocket URL with auth token
   * Note: WebSocket endpoint is at /ws on the server root, not under /api/v1
   */
  const getWsUrl = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Extract just the host from API URL, removing protocol and path (e.g., /api/v1)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const url = new URL(apiUrl);
    const host = url.host; // Just host:port, no path

    return `${protocol}//${host}/ws?token=${token}`;
  }, []);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    const url = getWsUrl();
    if (!url) {
      console.warn('[WS] No auth token, cannot connect');
      return;
    }

    if (wsRef.current?.readyState === WS_STATE.OPEN) {
      return;
    }

    try {
      setConnectionState(WS_STATE.CONNECTING);
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionState(WS_STATE.OPEN);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WS_STATE.OPEN) {
            wsRef.current.send(JSON.stringify({ type: WS_EVENTS.PING }));
          }
        }, pingInterval);

        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Notify listeners
          const listeners = listenersRef.current.get(data.type) || [];
          listeners.forEach((callback) => callback(data.payload, data));

          // Also notify wildcard listeners
          const wildcardListeners = listenersRef.current.get('*') || [];
          wildcardListeners.forEach((callback) => callback(data.payload, data));
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionState(WS_STATE.CLOSED);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        onDisconnect?.();

        // Attempt reconnection with exponential backoff
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < reconnectAttempts
        ) {
          const delay = getReconnectDelay(reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else if (reconnectAttemptsRef.current >= reconnectAttempts) {
          console.warn('[WS] Max reconnect attempts reached. Giving up.');
        }
      };

      wsRef.current.onerror = (event) => {
        // Only log error, don't update state to avoid re-renders
        console.error('[WS] Error:', event);
        errorRef.current = new Error('WebSocket error');
        // Only set error state once, not on every retry
        if (!error) {
          setError(errorRef.current);
        }
        onError?.(event);
      };
    } catch (err) {
      console.error('[WS] Failed to connect:', err);
      setError(err);
    }
  }, [getWsUrl, onConnect, onDisconnect, onError, pingInterval, reconnectAttempts, getReconnectDelay, error]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    // Prevent auto-reconnect first
    reconnectAttemptsRef.current = reconnectAttempts;

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      setConnectionState(WS_STATE.CLOSING);
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, [reconnectAttempts]);

  /**
   * Subscribe to a specific event type
   */
  const subscribe = useCallback((eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, []);
    }
    listenersRef.current.get(eventType).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(eventType) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  /**
   * Send a message to the server
   */
  const send = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WS_STATE.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WS] Cannot send message, not connected');
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect when auth changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'accessToken') {
        if (event.newValue) {
          connect();
        } else {
          disconnect();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    connect,
    disconnect,
    subscribe,
    send,
  };
}

/**
 * Hook for subscribing to specific event types
 */
export function useRealtimeEvent(eventType, callback, deps = []) {
  const { subscribe } = useRealtimeUpdates({ autoConnect: true });

  useEffect(() => {
    const unsubscribe = subscribe(eventType, callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, subscribe, ...deps]);
}

export default useRealtimeUpdates;
