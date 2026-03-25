/**
 * useSessionPackages Hook
 * Hook for managing session packages
 *
 * Features:
 * - Fetch owned session packages
 * - Purchase session package
 * - Use session from package
 * - Track remaining sessions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing session packages
 *
 * @returns {Object} Session packages state and controls
 */
export function useSessionPackages() {
  // State
  const [ownedPackages, setOwnedPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch owned session packages from API
   */
  const fetchOwnedPackages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/payments/session-packages');

      if (!isMountedRef.current) return;

      setOwnedPackages(response.data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente sesjonspakker');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Purchase a session package
   */
  const purchasePackage = useCallback(async (packageData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/session-packages', packageData);

      if (isMountedRef.current) {
        const newPackage = response.data.data;
        setOwnedPackages((prev) => [newPackage, ...prev]);
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke kjøpe sesjonspakke');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Use a session from package
   */
  const useSession = useCallback(async (packageId) => {
    if (!packageId) return null;

    setSaving(true);
    setError(null);

    try {
      await apiClient.post(`/payments/session-packages/${packageId}/use`);

      if (isMountedRef.current) {
        // Update remaining sessions count
        setOwnedPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, remainingSessions: pkg.remainingSessions - 1 }
              : pkg
          )
        );
      }

      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke bruke sesjon');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Refresh packages from API
   */
  const refresh = useCallback(() => {
    return fetchOwnedPackages();
  }, [fetchOwnedPackages]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchOwnedPackages();
  }, [fetchOwnedPackages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ownedPackages,
    loading,
    error,
    saving,
    purchasePackage,
    useSession,
    refresh,
  };
}

export default useSessionPackages;
