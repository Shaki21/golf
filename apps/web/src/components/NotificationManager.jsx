/**
 * NotificationManager - Initializes real-time notification connection
 *
 * This component sets up the SSE connection for real-time notifications
 * when the user is authenticated. It automatically reconnects on connection loss.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export function NotificationManager() {
  const { user } = useAuth();
  const { connectRealtime, disconnectRealtime, isOnline } = useNotification();
  const [token, setToken] = useState(null);

  // Get token from localStorage when user changes
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, [user]);

  useEffect(() => {
    // Connect to real-time notifications when user is authenticated
    if (user?.id && token && isOnline) {
      connectRealtime(user.id, token);
    }

    // Cleanup on unmount or when user changes
    return () => {
      disconnectRealtime();
    };
  }, [user?.id, token, isOnline, connectRealtime, disconnectRealtime]);

  // This component doesn't render anything
  return null;
}

export default NotificationManager;
