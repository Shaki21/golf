/**
 * TIER Golf - Offline Indicator
 *
 * Shows network status and pending sync count.
 * Displays banner when offline, toast when coming back online.
 */

import React, { useEffect, useState } from 'react';
import { WifiOff, CloudOff, RefreshCw, Check } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { processQueue } from '../../services/offlineStore';

interface OfflineIndicatorProps {
  showPendingSyncs?: boolean;
  position?: 'top' | 'bottom';
  onSyncComplete?: (result: { success: number; failed: number }) => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showPendingSyncs = true,
  position = 'top',
  onSyncComplete,
}) => {
  const { isOnline, wasOffline, pendingSyncs } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  // Handle coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);

      // Auto-sync pending changes
      if (pendingSyncs > 0) {
        handleSync();
      }

      // Hide reconnected message after 3 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setSyncResult(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, pendingSyncs]);

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      const result = await processQueue(async (url, options) => {
        const token = localStorage.getItem('auth_token');
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
      });

      setSyncResult(result);
      onSyncComplete?.(result);
    } catch (error) {
      console.error('[OfflineIndicator] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show anything if online and no pending syncs
  if (isOnline && !showReconnected && pendingSyncs === 0) {
    return null;
  }

  const positionClass = position === 'top' ? 'top-0 rounded-b-lg' : 'bottom-0 rounded-t-lg';

  // Show reconnected toast
  if (showReconnected && isOnline) {
    return (
      <div
        className={`fixed left-1/2 -translate-x-1/2 ${positionClass} flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-[11px] font-medium z-[9999] shadow-md`}
        role="status"
        aria-live="polite"
      >
        <Check size={16} />
        <span>
          {syncResult
            ? `Tilkoblet igjen - ${syncResult.success} endringer synkronisert`
            : 'Tilkoblet igjen'}
        </span>
      </div>
    );
  }

  // Show offline banner
  if (!isOnline) {
    return (
      <div
        className={`fixed left-1/2 -translate-x-1/2 ${positionClass} flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-[11px] font-medium z-[9999] shadow-md`}
        role="alert"
        aria-live="assertive"
      >
        <WifiOff size={16} />
        <span>Du er offline - endringer lagres lokalt</span>
      </div>
    );
  }

  // Show pending syncs indicator
  if (showPendingSyncs && pendingSyncs > 0) {
    return (
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`fixed right-4 ${positionClass} flex items-center gap-2 px-3 py-2 bg-white border border-tier-border-default rounded-lg text-tier-text-secondary text-[11px] cursor-pointer z-[9999] transition-all hover:border-tier-gold disabled:opacity-50`}
        aria-label={`${pendingSyncs} ventende endringer - klikk for å synkronisere`}
      >
        {isSyncing ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <CloudOff size={16} />
        )}
        <span>{pendingSyncs} ventende</span>
      </button>
    );
  }

  return null;
};

export default OfflineIndicator;
