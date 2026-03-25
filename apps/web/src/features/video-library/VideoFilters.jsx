/**
 * VideoFilters Component
 * Filter and sort controls for the video library
 *
 * Features:
 * - Search input for filtering by title
 * - Category filter dropdown
 * - Sort by dropdown (date, title, duration)
 * - View toggle (grid/list)
 * - Player filter (coach view only)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Button from '../../ui/primitives/Button';

// Filter options
export const VIDEO_CATEGORIES = [
  { value: '', label: 'Alle kategorier' },
  { value: 'swing', label: 'Full sving' },
  { value: 'putting', label: 'Putting' },
  { value: 'short_game', label: 'Naerspill' },
  { value: 'other', label: 'Annet' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Nyeste først' },
  { value: 'createdAt:asc', label: 'Eldste først' },
  { value: 'title:asc', label: 'Tittel A-Å' },
  { value: 'title:desc', label: 'Tittel Å-A' },
  { value: 'duration:desc', label: 'Lengste først' },
  { value: 'duration:asc', label: 'Korteste først' },
];

export const VIDEO_STATUSES = [
  { value: '', label: 'Alle statuser' },
  { value: 'ready', label: 'Klar' },
  { value: 'reviewed', label: 'Gjennomgått' },
  { value: 'processing', label: 'Behandles' },
  { value: 'failed', label: 'Feilet' },
];

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
};

// Tailwind classes
const tw = {
  container: 'flex flex-col gap-3 p-4 bg-surface rounded-xl border border-border',
  row: 'flex flex-wrap gap-3 items-center',
  searchContainer: 'flex-[1_1_250px] relative',
  searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--video-text-tertiary)] pointer-events-none',
  searchInput: 'w-full py-2.5 pr-3 pl-10 text-sm text-[var(--text-inverse)] bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg outline-none transition-colors duration-200 focus:border-primary',
  clearButton: 'absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer text-[var(--video-text-tertiary)] rounded-md flex items-center justify-center',
  select: "py-2.5 pl-3 pr-9 text-sm text-[var(--text-inverse)] bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] min-w-[150px] transition-colors duration-200 focus:border-primary",
  viewToggle: 'flex bg-[rgb(var(--tier-navy-dark))] rounded-lg p-1 gap-1',
  viewButton: 'py-2 px-3 bg-transparent border-none rounded-md cursor-pointer text-[var(--video-text-secondary)] flex items-center justify-center transition-all duration-200',
  viewButtonActive: 'bg-primary text-white',
  viewIcon: 'w-[18px] h-[18px]',
  playerSelect: 'min-w-[180px]',
  activeFilters: 'flex flex-wrap gap-2 items-center',
  filterChip: 'flex items-center gap-1 py-1 pl-3 pr-2 bg-primary/20 text-primary rounded-full text-xs font-medium',
  filterChipRemove: 'p-0.5 bg-transparent border-none cursor-pointer text-inherit rounded-full flex items-center justify-center opacity-70 transition-opacity duration-200 hover:opacity-100',
  clearAllButton: 'py-1 px-3 bg-transparent border border-border rounded-full text-[var(--video-text-secondary)] text-xs cursor-pointer transition-all duration-200 hover:border-primary',
  resultCount: 'ml-auto text-[13px] text-[var(--video-text-secondary)]',
};

// Select dropdown arrow SVG as background
const selectBgImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

// Icons
const SearchIcon = () => (
  <svg className={tw.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ClearIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GridIcon = () => (
  <svg className={tw.viewIcon} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg className={tw.viewIcon} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <rect x="3" y="10" width="18" height="4" rx="1" />
    <rect x="3" y="16" width="18" height="4" rx="1" />
  </svg>
);

/**
 * VideoFilters Component
 */
export function VideoFilters({
  filters = {},
  onFilterChange,
  viewMode = VIEW_MODES.GRID,
  onViewModeChange,
  players = [],
  showPlayerFilter = false,
  resultCount,
  style,
  className,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Handle search with debounce
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      onFilterChange?.({ ...filters, search: value });
    }, 300);
  }, [filters, onFilterChange]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onFilterChange?.({ ...filters, search: '' });
  }, [filters, onFilterChange]);

  // Handle category change
  const handleCategoryChange = useCallback((e) => {
    onFilterChange?.({ ...filters, category: e.target.value });
  }, [filters, onFilterChange]);

  // Handle status change
  const handleStatusChange = useCallback((e) => {
    onFilterChange?.({ ...filters, status: e.target.value });
  }, [filters, onFilterChange]);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    const [sortBy, sortOrder] = e.target.value.split(':');
    onFilterChange?.({ ...filters, sortBy, sortOrder });
  }, [filters, onFilterChange]);

  // Handle player change
  const handlePlayerChange = useCallback((e) => {
    onFilterChange?.({ ...filters, playerId: e.target.value });
  }, [filters, onFilterChange]);

  // Remove individual filter
  const handleRemoveFilter = useCallback((filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    if (filterKey === 'search' && searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onFilterChange?.({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: '',
    });
  }, [onFilterChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.category || filters.status || filters.playerId;

  // Get current sort value
  const currentSort = `${filters.sortBy || 'createdAt'}:${filters.sortOrder || 'desc'}`;

  // Get category label for chip
  const getCategoryLabel = (value) => {
    const option = VIDEO_CATEGORIES.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // Get player label for chip
  const getPlayerLabel = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Ukjent spiller';
  };

  // Get status label for chip
  const getStatusLabel = (value) => {
    const option = VIDEO_STATUSES.find((opt) => opt.value === value);
    return option?.label || value;
  };

  return (
    <div className={`${tw.container} ${className || ''}`} style={style}>
      {/* Main filter row */}
      <div className={tw.row}>
        {/* Search */}
        <div className={tw.searchContainer}>
          <SearchIcon />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Søk etter videoer..."
            defaultValue={filters.search || ''}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={tw.searchInput}
          />
          {filters.search && (
            <button
              className={tw.clearButton}
              onClick={handleClearSearch}
              aria-label="Tøm søk"
            >
              <ClearIcon size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={filters.category || ''}
          onChange={handleCategoryChange}
          className={tw.select}
          style={{ backgroundImage: selectBgImage }}
          aria-label="Filtrer etter kategori"
        >
          {VIDEO_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className={tw.select}
          style={{ backgroundImage: selectBgImage }}
          aria-label="Filtrer etter status"
        >
          {VIDEO_STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Player filter (coach view) */}
        {showPlayerFilter && players.length > 0 && (
          <select
            value={filters.playerId || ''}
            onChange={handlePlayerChange}
            className={`${tw.select} ${tw.playerSelect}`}
            style={{ backgroundImage: selectBgImage }}
            aria-label="Filtrer etter spiller"
          >
            <option value="">Alle spillere</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={currentSort}
          onChange={handleSortChange}
          className={tw.select}
          style={{ backgroundImage: selectBgImage }}
          aria-label="Sorter etter"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className={tw.viewToggle} role="group" aria-label="Visningstype">
          <button
            className={`${tw.viewButton} ${viewMode === VIEW_MODES.GRID ? tw.viewButtonActive : ''}`}
            onClick={() => onViewModeChange?.(VIEW_MODES.GRID)}
            aria-label="Rutenett-visning"
            aria-pressed={viewMode === VIEW_MODES.GRID}
          >
            <GridIcon />
          </button>
          <button
            className={`${tw.viewButton} ${viewMode === VIEW_MODES.LIST ? tw.viewButtonActive : ''}`}
            onClick={() => onViewModeChange?.(VIEW_MODES.LIST)}
            aria-label="Liste-visning"
            aria-pressed={viewMode === VIEW_MODES.LIST}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Active filters row */}
      {(hasActiveFilters || resultCount !== undefined) && (
        <div className={tw.activeFilters}>
          {/* Search chip */}
          {filters.search && (
            <div className={tw.filterChip}>
              <span>Søk: "{filters.search}"</span>
              <button
                className={tw.filterChipRemove}
                onClick={() => handleRemoveFilter('search')}
                aria-label="Fjern søkefilter"
              >
                <ClearIcon size={12} />
              </button>
            </div>
          )}

          {/* Category chip */}
          {filters.category && (
            <div className={tw.filterChip}>
              <span>{getCategoryLabel(filters.category)}</span>
              <button
                className={tw.filterChipRemove}
                onClick={() => handleRemoveFilter('category')}
                aria-label="Fjern kategorifilter"
              >
                <ClearIcon size={12} />
              </button>
            </div>
          )}

          {/* Status chip */}
          {filters.status && (
            <div className={tw.filterChip}>
              <span>{getStatusLabel(filters.status)}</span>
              <button
                className={tw.filterChipRemove}
                onClick={() => handleRemoveFilter('status')}
                aria-label="Fjern statusfilter"
              >
                <ClearIcon size={12} />
              </button>
            </div>
          )}

          {/* Player chip */}
          {filters.playerId && (
            <div className={tw.filterChip}>
              <span>{getPlayerLabel(filters.playerId)}</span>
              <button
                className={tw.filterChipRemove}
                onClick={() => handleRemoveFilter('playerId')}
                aria-label="Fjern spillerfilter"
              >
                <ClearIcon size={12} />
              </button>
            </div>
          )}

          {/* Clear all button */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearAll}
            >
              Nullstill filtre
            </Button>
          )}

          {/* Result count */}
          {resultCount !== undefined && (
            <span className={tw.resultCount}>
              {resultCount} {resultCount === 1 ? 'video' : 'videoer'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoFilters;
