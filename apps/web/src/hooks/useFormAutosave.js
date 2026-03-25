import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-saving form data to localStorage
 *
 * @param {string} key - Unique key for localStorage
 * @param {object} initialData - Initial form data
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 1000ms)
 * @returns {object} - { data, setData, clearSavedData, isDirty, lastSaved }
 *
 * @example
 * const { data, setData, clearSavedData, isDirty, lastSaved } = useFormAutosave(
 *   'profile-wizard',
 *   { name: '', email: '' },
 *   1000
 * );
 */
export default function useFormAutosave(key, initialData, debounceMs = 1000) {
  // Try to load saved data from localStorage
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (e) {
      console.warn('Failed to load autosaved data:', e);
    }
    return null;
  };

  const savedData = getSavedData();
  const [data, setDataState] = useState(savedData || initialData);
  const [isDirty, setIsDirty] = useState(!!savedData);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);
  const initialDataRef = useRef(initialData);

  // Check if data has changed from initial
  const hasChanges = useCallback(() => {
    return JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
  }, [data]);

  // Save to localStorage with debounce
  const saveToStorage = useCallback((newData) => {
    try {
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data: newData,
        timestamp: Date.now(),
      }));
      setLastSaved(new Date());
    } catch (e) {
      console.warn('Failed to autosave data:', e);
    }
  }, [key]);

  // Debounced setter
  const setData = useCallback((newDataOrUpdater) => {
    setDataState((prevData) => {
      const newData = typeof newDataOrUpdater === 'function'
        ? newDataOrUpdater(prevData)
        : newDataOrUpdater;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for autosave
      timeoutRef.current = setTimeout(() => {
        saveToStorage(newData);
        setIsDirty(true);
      }, debounceMs);

      return newData;
    });
  }, [debounceMs, saveToStorage]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(`autosave_${key}`);
      setIsDirty(false);
      setLastSaved(null);
    } catch (e) {
      console.warn('Failed to clear autosaved data:', e);
    }
  }, [key]);

  // Reset to initial data
  const resetData = useCallback(() => {
    setDataState(initialData);
    clearSavedData();
  }, [initialData, clearSavedData]);

  // Update a single field
  const updateField = useCallback((field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, [setData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get timestamp of last save
  const getLastSavedTimestamp = useCallback(() => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Date(parsed.timestamp);
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [key]);

  return {
    data,
    setData,
    updateField,
    clearSavedData,
    resetData,
    isDirty,
    hasChanges: hasChanges(),
    lastSaved: lastSaved || getLastSavedTimestamp(),
  };
}

/**
 * Format the last saved time for display
 * @param {Date|null} lastSaved - Last saved timestamp
 * @returns {string} - Formatted time string
 */
export function formatLastSaved(lastSaved) {
  if (!lastSaved) return '';

  const now = new Date();
  const diff = now - lastSaved;

  if (diff < 60000) {
    return 'Just saved';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Saved ${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Saved ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `Saved ${lastSaved.toLocaleDateString('en-US')}`;
  }
}
