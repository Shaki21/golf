/**
 * SearchBar - Tournament Search and Filter Toggle
 * Design System v3.1 - Tailwind CSS
 *
 * Search input with filter button for opening advanced filters.
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../../../ui/primitives/Button';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onFilterClick,
  hasActiveFilters,
}: SearchBarProps) {
  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3.5 py-2.5 border border-tier-border-default">
        <Search size={18} className="text-tier-text-tertiary" />
        <input
          type="text"
          placeholder="Search tournament, course or city..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="flex-1 border-none bg-transparent text-sm text-tier-navy outline-none placeholder:text-tier-text-tertiary"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="p-1 border-none bg-transparent text-tier-text-tertiary cursor-pointer rounded hover:bg-tier-surface-subtle"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <Button
        variant={hasActiveFilters ? 'primary' : 'ghost'}
        size="sm"
        leftIcon={<Filter size={16} />}
        onClick={onFilterClick}
      >
        Filter
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1" />
        )}
      </Button>
    </div>
  );
}
