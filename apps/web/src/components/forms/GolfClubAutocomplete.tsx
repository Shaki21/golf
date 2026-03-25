/**
 * GolfClubAutocomplete - Autocomplete input for Norwegian golf clubs
 *
 * Features:
 * - Search and filter golf clubs
 * - Keyboard navigation
 * - Click outside to close
 * - Supports custom values
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { getClubSuggestions, norwegianGolfClubs } from '../../data/norwegianGolfClubs';
import { cn } from 'lib/utils';

interface GolfClubAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function GolfClubAutocomplete({
  value,
  onChange,
  placeholder = 'Søk etter golfklubb...',
  className,
  error,
  required = false,
}: GolfClubAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update search query when value changes from outside
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (query.length >= 2) {
      const filtered = getClubSuggestions(query, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions(norwegianGolfClubs.slice(0, 8));
    }
  };

  const handleSelectClub = (club: string) => {
    setSearchQuery(club);
    onChange(club);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (searchQuery.length < 2) {
      setSuggestions(norwegianGolfClubs.slice(0, 8));
    } else {
      const filtered = getClubSuggestions(searchQuery, 8);
      setSuggestions(filtered);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      // Only update if the value is in the list or if custom values are allowed
      if (searchQuery !== value) {
        onChange(searchQuery);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        if (suggestions.length === 0) {
          setSuggestions(norwegianGolfClubs.slice(0, 8));
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectClub(suggestions[highlightedIndex]);
        } else if (searchQuery) {
          onChange(searchQuery);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={cn(
            'w-full px-4 py-2.5 pl-10',
            'border-2 rounded-lg',
            'text-sm font-medium',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
            'disabled:bg-gray-50 disabled:text-gray-500'
          )}
        />
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((club, index) => (
            <button
              key={club}
              type="button"
              onClick={() => handleSelectClub(club)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'w-full px-4 py-2.5 text-left text-sm',
                'flex items-center justify-between',
                'transition-colors duration-150',
                'border-b border-gray-100 last:border-b-0',
                highlightedIndex === index
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-900',
                value === club && 'font-semibold'
              )}
            >
              <span>{club}</span>
              {value === club && (
                <Check size={16} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && searchQuery.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            Ingen klubber funnet for "{searchQuery}"
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Du kan fortsatt bruke denne verdien
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage in a form:
 *
 * <GolfClubAutocomplete
 *   value={formData.club}
 *   onChange={(club) => setFormData({ ...formData, club })}
 *   placeholder="Velg din hjemmeklubb"
 *   required
 * />
 */
