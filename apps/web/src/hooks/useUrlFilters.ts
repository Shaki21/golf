/**
 * useUrlFilters - Hook for URL-persisted filter state
 *
 * Syncs filter state with URL query parameters for shareable/bookmarkable filters.
 *
 * @example
 * const [filters, setFilter, clearFilters] = useUrlFilters({
 *   status: 'all',
 *   category: null,
 *   search: ''
 * });
 *
 * // Updates URL: ?status=active
 * setFilter('status', 'active');
 *
 * // URL: ?status=active&category=A
 * setFilter('category', 'A');
 *
 * // Clears all filters
 * clearFilters();
 */

import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

type FilterValue = string | number | boolean | null | undefined;
type Filters = Record<string, FilterValue>;

export function useUrlFilters<T extends Filters>(defaultFilters: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo(() => {
    const result: Filters = { ...defaultFilters };

    for (const key in defaultFilters) {
      const urlValue = searchParams.get(key);

      if (urlValue !== null) {
        // Parse based on default value type
        const defaultValue = defaultFilters[key];

        if (typeof defaultValue === 'boolean') {
          result[key] = urlValue === 'true';
        } else if (typeof defaultValue === 'number') {
          result[key] = Number(urlValue);
        } else {
          result[key] = urlValue;
        }
      }
    }

    return result as T;
  }, [searchParams, defaultFilters]);

  // Set a single filter
  const setFilter = useCallback((key: keyof T, value: FilterValue) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      if (value === null || value === undefined || value === '' || value === defaultFilters[key]) {
        // Remove param if value is default/empty
        newParams.delete(String(key));
      } else {
        newParams.set(String(key), String(value));
      }

      return newParams;
    });
  }, [setSearchParams, defaultFilters]);

  // Set multiple filters at once
  const setFilters = useCallback((updates: Partial<T>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      for (const key in updates) {
        const value = updates[key];

        if (value === null || value === undefined || value === '' || value === defaultFilters[key]) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      }

      return newParams;
    });
  }, [setSearchParams, defaultFilters]);

  // Clear all filters (reset to defaults)
  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Check if any filters are active (different from defaults)
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(
      key => filters[key] !== defaultFilters[key] &&
             filters[key] !== null &&
             filters[key] !== ''
    );
  }, [filters, defaultFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters
  };
}

/**
 * Example usage:
 *
 * function AthleteList() {
 *   const { filters, setFilter, clearFilters, hasActiveFilters } = useUrlFilters({
 *     status: 'all',
 *     category: null,
 *     search: ''
 *   });
 *
 *   const filteredAthletes = athletes.filter(a => {
 *     if (filters.status !== 'all' && a.status !== filters.status) return false;
 *     if (filters.category && a.category !== filters.category) return false;
 *     if (filters.search && !a.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
 *     return true;
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         value={filters.search}
 *         onChange={(e) => setFilter('search', e.target.value)}
 *         placeholder="Search..."
 *       />
 *
 *       <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
 *         <option value="all">All</option>
 *         <option value="active">Active</option>
 *         <option value="inactive">Inactive</option>
 *       </select>
 *
 *       {hasActiveFilters && (
 *         <button onClick={clearFilters}>Clear Filters</button>
 *       )}
 *
 *       {filteredAthletes.map(athlete => (
 *         <div key={athlete.id}>{athlete.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 */
