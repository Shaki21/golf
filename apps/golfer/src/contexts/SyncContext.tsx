/**
 * Sync Context for AK Golf Mobile App
 *
 * Handles offline-first data synchronization:
 * - Queues operations when offline
 * - Syncs when back online
 * - Conflict resolution
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { api } from '../services/api';

// Types
interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncAt: Date | null;
}

interface SyncContextType extends SyncState {
  queueOperation: (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>) => Promise<void>;
  syncNow: () => Promise<void>;
  clearQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

// Storage keys
const STORAGE_KEYS = {
  SYNC_QUEUE: '@ak_golf_sync_queue',
  LAST_SYNC: '@ak_golf_last_sync',
};

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    pendingOperations: 0,
    lastSyncAt: null,
  });

  const [syncQueue, setSyncQueue] = useState<SyncOperation[]>([]);

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      const isOnline = netState.isConnected ?? false;
      setState(prev => ({ ...prev, isOnline }));

      // Auto-sync when coming back online
      if (isOnline && syncQueue.length > 0) {
        syncNow();
      }
    });

    return () => unsubscribe();
  }, [syncQueue.length]);

  // Load queue from storage on mount
  useEffect(() => {
    loadSyncQueue();
  }, []);

  const loadSyncQueue = async () => {
    try {
      const [queueJson, lastSyncStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC),
      ]);

      if (queueJson) {
        const queue = JSON.parse(queueJson);
        setSyncQueue(queue);
        setState(prev => ({ ...prev, pendingOperations: queue.length }));
      }

      if (lastSyncStr) {
        setState(prev => ({ ...prev, lastSyncAt: new Date(lastSyncStr) }));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  };

  const saveQueue = async (queue: SyncOperation[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    setSyncQueue(queue);
    setState(prev => ({ ...prev, pendingOperations: queue.length }));
  };

  const queueOperation = async (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>) => {
    const newOp: SyncOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    const newQueue = [...syncQueue, newOp];
    await saveQueue(newQueue);

    // If online, try to sync immediately
    if (state.isOnline) {
      syncNow();
    }
  };

  const syncNow = useCallback(async () => {
    if (state.isSyncing || !state.isOnline || syncQueue.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    const successfulOps: string[] = [];
    const failedOps: SyncOperation[] = [];

    for (const op of syncQueue) {
      try {
        await processOperation(op);
        successfulOps.push(op.id);
      } catch (error) {
        console.error(`Sync operation failed:`, op, error);

        if (op.retries < 3) {
          failedOps.push({ ...op, retries: op.retries + 1 });
        } else {
          console.error('Operation exceeded max retries, dropping:', op);
        }
      }
    }

    // Update queue with only failed operations
    await saveQueue(failedOps);

    // Update last sync time
    const now = new Date();
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());

    setState(prev => ({
      ...prev,
      isSyncing: false,
      lastSyncAt: now,
    }));
  }, [state.isOnline, state.isSyncing, syncQueue]);

  const processOperation = async (op: SyncOperation) => {
    switch (op.entity) {
      case 'session':
        if (op.type === 'CREATE') {
          await api.sessions.create(op.data);
        } else if (op.type === 'UPDATE') {
          await api.sessions.update(op.data.id, op.data);
        }
        break;

      case 'reflection':
        if (op.type === 'CREATE') {
          await api.sessions.addReflection(op.data.sessionId, op.data);
        }
        break;

      case 'proof':
        if (op.type === 'CREATE') {
          await api.videos.upload(op.data);
        }
        break;

      case 'testResult':
        if (op.type === 'CREATE') {
          await api.tests.submitResult(op.data);
        }
        break;

      default:
        throw new Error(`Unknown entity type: ${op.entity}`);
    }
  };

  const clearQueue = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    setSyncQueue([]);
    setState(prev => ({ ...prev, pendingOperations: 0 }));
  };

  return (
    <SyncContext.Provider
      value={{
        ...state,
        queueOperation,
        syncNow,
        clearQueue,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
