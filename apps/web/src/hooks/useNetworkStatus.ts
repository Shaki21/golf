/**
 * TIER Golf - Network Status Hook
 *
 * Provides real-time network connectivity status.
 * Used for offline indicators and sync decisions.
 */

import { useState, useEffect, useCallback } from 'react';
import { queueCount } from '../services/offlineStore';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  pendingSyncs: number;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
}

interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    pendingSyncs: 0,
  });

  const updateNetworkInfo = useCallback(() => {
    const connection = navigator.connection;
    if (connection) {
      setStatus(prev => ({
        ...prev,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      }));
    }
  }, []);

  const updatePendingSyncs = useCallback(async () => {
    try {
      const count = await queueCount();
      setStatus(prev => ({ ...prev, pendingSyncs: count }));
    } catch (error) {
      console.error('[useNetworkStatus] Failed to get pending syncs:', error);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
      }));
      updateNetworkInfo();
      updatePendingSyncs();
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
      }));
    };

    // Initial setup
    updateNetworkInfo();
    updatePendingSyncs();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network info changes
    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Check pending syncs periodically
    const syncInterval = setInterval(updatePendingSyncs, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
      clearInterval(syncInterval);
    };
  }, [updateNetworkInfo, updatePendingSyncs]);

  return status;
}

export default useNetworkStatus;
