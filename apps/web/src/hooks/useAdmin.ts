/**
 * useAdmin Hook
 * Manages admin functions - system status, feature flags, support cases, tiers
 */

import { useState, useCallback, useEffect } from 'react';
import { adminAPI, SystemStatus, FeatureFlag, SupportCase, SubscriptionTier } from '../services/api';

interface HookOptions {
  autoLoad?: boolean;
}

interface UseAdminReturn {
  // System Status
  systemStatus: SystemStatus | null;
  loadingStatus: boolean;
  fetchSystemStatus: () => Promise<void>;

  // Feature Flags
  featureFlags: FeatureFlag[];
  loadingFlags: boolean;
  fetchFeatureFlags: () => Promise<void>;
  createFeatureFlag: (data: { key: string; name: string; description?: string; enabled?: boolean }) => Promise<FeatureFlag | null>;
  updateFeatureFlag: (id: string, data: { name?: string; description?: string; enabled?: boolean; rolloutPercentage?: number }) => Promise<FeatureFlag | null>;
  deleteFeatureFlag: (id: string) => Promise<boolean>;
  toggleFeatureFlag: (id: string) => Promise<FeatureFlag | null>;

  // Support Cases
  supportCases: SupportCase[];
  loadingCases: boolean;
  fetchSupportCases: (status?: string) => Promise<void>;
  getSupportCase: (id: string) => Promise<SupportCase | null>;
  createSupportCase: (data: { title: string; description?: string; category?: string; priority?: string }) => Promise<SupportCase | null>;
  updateSupportCase: (id: string, data: { status?: string; resolution?: string; priority?: string }) => Promise<SupportCase | null>;
  closeSupportCase: (id: string, resolution: string) => Promise<SupportCase | null>;

  // Tiers
  tiers: SubscriptionTier[];
  loadingTiers: boolean;
  fetchTiers: () => Promise<void>;
  updateTier: (id: string, data: { active?: boolean }) => Promise<SubscriptionTier | null>;
  toggleTierActive: (id: string) => Promise<SubscriptionTier | null>;

  // General
  error: string | null;
}

export function useAdmin(): UseAdminReturn {
  // System Status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Feature Flags state
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(false);

  // Support Cases state
  const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // Tiers state
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // System Status
  // ============================================================================

  const fetchSystemStatus = useCallback(async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const response = await adminAPI.getSystemStatus();
      if (response.data?.data) {
        setSystemStatus(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente systemstatus');
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // ============================================================================
  // Feature Flags
  // ============================================================================

  const fetchFeatureFlags = useCallback(async () => {
    setLoadingFlags(true);
    setError(null);
    try {
      const response = await adminAPI.getFeatureFlags();
      if (response.data?.data) {
        setFeatureFlags(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente feature flags');
    } finally {
      setLoadingFlags(false);
    }
  }, []);

  const createFeatureFlag = useCallback(async (data: {
    key: string;
    name: string;
    description?: string;
    enabled?: boolean;
  }): Promise<FeatureFlag | null> => {
    setError(null);
    try {
      const response = await adminAPI.createFeatureFlag(data);
      if (response.data?.data) {
        const newFlag = response.data.data;
        setFeatureFlags(prev => [...prev, newFlag]);
        return newFlag;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke opprette feature flag');
      return null;
    }
  }, []);

  const updateFeatureFlag = useCallback(async (
    id: string,
    data: { name?: string; description?: string; enabled?: boolean; rolloutPercentage?: number }
  ): Promise<FeatureFlag | null> => {
    setError(null);
    try {
      const response = await adminAPI.updateFeatureFlag(id, data);
      if (response.data?.data) {
        const updatedFlag = response.data.data;
        setFeatureFlags(prev => prev.map(f => f.id === id ? updatedFlag : f));
        return updatedFlag;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke oppdatere feature flag');
      return null;
    }
  }, []);

  const deleteFeatureFlag = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await adminAPI.deleteFeatureFlag(id);
      if (response.data?.success) {
        setFeatureFlags(prev => prev.filter(f => f.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke slette feature flag');
      return false;
    }
  }, []);

  const toggleFeatureFlag = useCallback(async (id: string): Promise<FeatureFlag | null> => {
    const flag = featureFlags.find(f => f.id === id);
    if (!flag) return null;
    return updateFeatureFlag(id, { enabled: !flag.enabled });
  }, [featureFlags, updateFeatureFlag]);

  // ============================================================================
  // Support Cases
  // ============================================================================

  const fetchSupportCases = useCallback(async (status?: string) => {
    setLoadingCases(true);
    setError(null);
    try {
      const response = await adminAPI.getSupportCases(status);
      if (response.data?.data) {
        setSupportCases(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente support-saker');
    } finally {
      setLoadingCases(false);
    }
  }, []);

  const getSupportCase = useCallback(async (id: string): Promise<SupportCase | null> => {
    setError(null);
    try {
      const response = await adminAPI.getSupportCase(id);
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente support-sak');
      return null;
    }
  }, []);

  const createSupportCase = useCallback(async (data: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
  }): Promise<SupportCase | null> => {
    setError(null);
    try {
      const response = await adminAPI.createSupportCase(data);
      if (response.data?.data) {
        const newCase = response.data.data;
        setSupportCases(prev => [newCase, ...prev]);
        return newCase;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke opprette support-sak');
      return null;
    }
  }, []);

  const updateSupportCase = useCallback(async (
    id: string,
    data: { status?: string; resolution?: string; priority?: string }
  ): Promise<SupportCase | null> => {
    setError(null);
    try {
      const response = await adminAPI.updateSupportCase(id, data);
      if (response.data?.data) {
        const updatedCase = response.data.data;
        setSupportCases(prev => prev.map(c => c.id === id ? updatedCase : c));
        return updatedCase;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke oppdatere support-sak');
      return null;
    }
  }, []);

  const closeSupportCase = useCallback(async (id: string, resolution: string): Promise<SupportCase | null> => {
    return updateSupportCase(id, { status: 'closed', resolution });
  }, [updateSupportCase]);

  // ============================================================================
  // Tiers
  // ============================================================================

  const fetchTiers = useCallback(async () => {
    setLoadingTiers(true);
    setError(null);
    try {
      const response = await adminAPI.getTiers();
      if (response.data?.data?.tiers) {
        setTiers(response.data.data.tiers);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente abonnementsnivåer');
    } finally {
      setLoadingTiers(false);
    }
  }, []);

  const updateTier = useCallback(async (
    id: string,
    data: { active?: boolean }
  ): Promise<SubscriptionTier | null> => {
    setError(null);
    try {
      const response = await adminAPI.updateTier(id, data);
      if (response.data?.data) {
        const updatedTier = response.data.data;
        setTiers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        return updatedTier;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke oppdatere abonnementsnivå');
      return null;
    }
  }, []);

  const toggleTierActive = useCallback(async (id: string): Promise<SubscriptionTier | null> => {
    const tier = tiers.find(t => t.id === id);
    if (!tier) return null;
    return updateTier(id, { active: !tier.active });
  }, [tiers, updateTier]);

  return {
    // System Status
    systemStatus,
    loadingStatus,
    fetchSystemStatus,

    // Feature Flags
    featureFlags,
    loadingFlags,
    fetchFeatureFlags,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
    toggleFeatureFlag,

    // Support Cases
    supportCases,
    loadingCases,
    fetchSupportCases,
    getSupportCase,
    createSupportCase,
    updateSupportCase,
    closeSupportCase,

    // Tiers
    tiers,
    loadingTiers,
    fetchTiers,
    updateTier,
    toggleTierActive,

    // General
    error,
  };
}

// ============================================================================
// Individual Hook Exports
// ============================================================================

export function useSystemStatus(options: HookOptions = {}) {
  const { systemStatus, loadingStatus, fetchSystemStatus, error } = useAdmin();

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchSystemStatus();
    }
  }, [fetchSystemStatus, options.autoLoad]);

  return { status: systemStatus, loading: loadingStatus, error, refetch: fetchSystemStatus };
}

export function useFeatureFlags(options: HookOptions = {}) {
  const { featureFlags, loadingFlags, fetchFeatureFlags, error } = useAdmin();

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchFeatureFlags();
    }
  }, [fetchFeatureFlags, options.autoLoad]);

  return { flags: featureFlags, loading: loadingFlags, error, refetch: fetchFeatureFlags };
}

export function useCreateFeatureFlag() {
  const { createFeatureFlag, error } = useAdmin();
  return { createFlag: createFeatureFlag, error };
}

export function useUpdateFeatureFlag() {
  const { updateFeatureFlag, error } = useAdmin();
  return { updateFlag: updateFeatureFlag, error };
}

export function useDeleteFeatureFlag() {
  const { deleteFeatureFlag, error } = useAdmin();
  return { deleteFlag: deleteFeatureFlag, error };
}

export function useSupportCases(options: { status?: string } = {}) {
  const { supportCases, loadingCases, fetchSupportCases, error } = useAdmin();

  useEffect(() => {
    fetchSupportCases(options.status);
  }, [fetchSupportCases, options.status]);

  return { cases: supportCases, loading: loadingCases, error, refetch: () => fetchSupportCases(options.status) };
}

export function useUpdateSupportCase() {
  const { updateSupportCase, error } = useAdmin();
  return { updateCase: updateSupportCase, error };
}

export function useTiers(options: HookOptions = {}) {
  const { tiers, loadingTiers, fetchTiers, error } = useAdmin();

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchTiers();
    }
  }, [fetchTiers, options.autoLoad]);

  return { tiers, loading: loadingTiers, error, refetch: fetchTiers };
}

export default useAdmin;
