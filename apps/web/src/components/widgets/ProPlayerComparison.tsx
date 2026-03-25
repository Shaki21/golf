/**
 * ProPlayerComparison Component
 * Compare your SG stats with professional golfers from DataGolf
 *
 * Features:
 * - Search for any pro player (e.g., Kristoffer Reitan, Viktor Hovland)
 * - Visual side-by-side comparison
 * - Gap analysis for each category
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Star,
  Flag,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import { SubSectionTitle } from '../../components/typography';
import {
  useProPlayerSearch,
  useProPlayer,
  ProPlayer,
  ProPlayerStats,
} from '../../hooks/useProPlayerSearch';
import { useStrokesGained } from '../../hooks/useStrokesGained';

// =============================================================================
// Types & Config
// =============================================================================

interface ProPlayerComparisonProps {
  /** Optional suggested players to show initially */
  suggestedPlayers?: ProPlayer[];
}

const SG_COLOR_CONFIG: Record<string, string> = {
  excellent: 'text-green-600',
  good: 'text-tier-gold',
  warning: 'text-amber-600',
  poor: 'text-red-600',
  neutral: 'text-tier-text-tertiary',
};

// =============================================================================
// Helpers
// =============================================================================

const formatSG = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
};

const getSGColorClass = (value: number | null): string => {
  if (value === null) return SG_COLOR_CONFIG.neutral;
  if (value >= 0.5) return SG_COLOR_CONFIG.excellent;
  if (value >= 0) return SG_COLOR_CONFIG.good;
  if (value >= -0.5) return SG_COLOR_CONFIG.warning;
  return SG_COLOR_CONFIG.poor;
};

const getGapIndicator = (
  userValue: number,
  proValue: number | null
): { icon: typeof TrendingUp; colorClass: string; label: string } | null => {
  if (proValue === null) return null;
  const gap = userValue - proValue;

  if (gap >= 0.1) {
    return { icon: TrendingUp, colorClass: 'text-green-600', label: 'Foran' };
  } else if (gap <= -0.1) {
    return { icon: TrendingDown, colorClass: 'text-red-600', label: 'Bak' };
  }
  return { icon: Minus, colorClass: 'text-tier-text-tertiary', label: 'Likt' };
};

// =============================================================================
// Component
// =============================================================================

const ProPlayerComparison: React.FC<ProPlayerComparisonProps> = ({ suggestedPlayers }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results, loading: searchLoading, search } = useProPlayerSearch(300);
  const { player: selectedPlayer } = useProPlayer(selectedPlayerId);
  const { data: userSgData } = useStrokesGained();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    search(value);
    setShowDropdown(value.length >= 2);
  };

  const handleSelectPlayer = (player: ProPlayer) => {
    setSelectedPlayerId(player.dataGolfId);
    setSearchQuery(player.playerName);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedPlayerId(null);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Get user's SG values
  const getUserSG = (
    category: 'total' | 'approach' | 'putting' | 'aroundGreen' | 'tee'
  ): number => {
    if (!userSgData) return 0;
    if (category === 'total') return userSgData.total || 0;
    const catMap: Record<string, string> = {
      approach: 'approach',
      putting: 'putting',
      aroundGreen: 'around_green',
      tee: 'tee',
    };
    return userSgData.byCategory?.[catMap[category]]?.value || 0;
  };

  const comparisonCategories = [
    { key: 'total', label: 'Total SG', proKey: 'sgTotal' as keyof ProPlayerStats },
    { key: 'tee', label: 'Fra tee', proKey: 'sgTee' as keyof ProPlayerStats },
    { key: 'approach', label: 'Innspill', proKey: 'sgApproach' as keyof ProPlayerStats },
    { key: 'aroundGreen', label: 'Rundt green', proKey: 'sgAround' as keyof ProPlayerStats },
    { key: 'putting', label: 'Putting', proKey: 'sgPutting' as keyof ProPlayerStats },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search Section */}
      <div ref={searchRef} className="relative">
        <div className="relative flex items-center">
          <Search
            size={18}
            className="absolute left-3 text-tier-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Søk etter proff (f.eks. Kristoffer Reitan)"
            className="w-full py-3 pl-10 pr-10 text-sm border border-tier-border-subtle rounded-lg bg-white text-tier-navy outline-none transition-colors focus:border-tier-gold"
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
          />
          {(searchQuery || selectedPlayerId) && (
            <button
              onClick={handleClearSelection}
              className="absolute right-3 p-1 bg-transparent border-none cursor-pointer rounded flex items-center justify-center"
            >
              <X size={16} className="text-tier-text-tertiary" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-tier-border-subtle rounded-lg shadow-lg z-[100] max-h-[300px] overflow-y-auto">
            {searchLoading ? (
              <div className="flex items-center justify-between w-full p-3 px-4">
                <span className="text-tier-text-tertiary text-sm">Søker...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((player) => (
                <button
                  key={player.dataGolfId}
                  onClick={() => handleSelectPlayer(player)}
                  className="flex items-center justify-between w-full p-3 px-4 bg-transparent border-none border-b border-tier-border-subtle cursor-pointer text-left transition-colors hover:bg-tier-surface-subtle"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-tier-gold" />
                    <div>
                      <span className="block text-sm font-medium text-tier-navy">
                        {player.playerName} ({player.rank})
                      </span>
                      <span className="block text-[10px] text-tier-text-tertiary">
                        {player.tour?.toUpperCase() || 'Tour'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className={getSGColorClass(player.stats.sgTotal)}>
                      {formatSG(player.stats.sgTotal)}
                    </span>
                    <ChevronRight size={14} className="text-tier-text-tertiary" />
                  </div>
                </button>
              ))
            ) : searchQuery.length >= 2 ? (
              <div className="flex items-center justify-between w-full p-3 px-4">
                <span className="text-tier-text-tertiary text-sm">Ingen spillere funnet</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Suggested Players (when no selection) */}
      {!selectedPlayer && suggestedPlayers && suggestedPlayers.length > 0 && (
        <div className="mt-1">
          <SubSectionTitle className="m-0 mb-2 text-[10px]">
            Foreslåtte spillere
          </SubSectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {suggestedPlayers.slice(0, 3).map((player) => (
              <button
                key={player.dataGolfId}
                onClick={() => handleSelectPlayer(player)}
                className="flex flex-col items-center p-3 bg-white border border-tier-border-subtle rounded-lg cursor-pointer transition-all hover:border-tier-gold hover:shadow-sm"
              >
                <div className="flex items-center gap-1 mb-1">
                  {player.playerName.includes('Hovland') && (
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                  )}
                  <Flag size={12} className="text-tier-text-tertiary" />
                </div>
                <span className="text-[10px] font-medium text-tier-navy text-center truncate w-full">
                  {player.playerName}
                </span>
                <span className={`text-[11px] font-bold mt-1 ${getSGColorClass(player.stats.sgTotal)}`}>
                  {formatSG(player.stats.sgTotal)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {selectedPlayer && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4 p-3 bg-tier-surface-subtle rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <User size={20} className="text-tier-gold" />
              </div>
              <div>
                <span className="block text-[10px] text-tier-text-secondary">Du</span>
                <span className="block text-lg font-bold text-tier-navy">
                  {formatSG(userSgData?.total)}
                </span>
              </div>
            </div>

            <div className="px-2 py-1 text-[10px] font-bold text-tier-text-tertiary bg-white rounded">
              VS
            </div>

            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Star size={20} className="text-green-600" />
              </div>
              <div>
                <span className="block text-[10px] text-tier-text-secondary">
                  {selectedPlayer.playerName}
                </span>
                <span className="block text-lg font-bold text-tier-navy">
                  {formatSG(selectedPlayer.stats.sgTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {comparisonCategories.map((cat) => {
              const userValue = getUserSG(
                cat.key as 'total' | 'approach' | 'putting' | 'aroundGreen' | 'tee'
              );
              const proValue = selectedPlayer.stats[cat.proKey] as number | null;
              const gap = getGapIndicator(userValue, proValue);
              const GapIcon = gap?.icon || Minus;

              return (
                <div
                  key={cat.key}
                  className="flex items-center justify-between py-2 border-b border-tier-border-subtle"
                >
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <span className="text-[11px] text-tier-text-secondary">{cat.label}</span>
                    {gap && (
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          gap.colorClass === 'text-green-600'
                            ? 'bg-green-100'
                            : gap.colorClass === 'text-red-600'
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <GapIcon size={12} className={gap.colorClass} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-[50px] text-center">
                      <span className={`text-sm font-semibold tabular-nums ${getSGColorClass(userValue)}`}>
                        {formatSG(userValue)}
                      </span>
                    </div>

                    <div className="w-[50px] text-center">
                      <span
                        className={`text-[10px] font-medium tabular-nums ${
                          gap?.colorClass || 'text-tier-text-tertiary'
                        }`}
                      >
                        {proValue !== null ? formatSG(userValue - proValue) : '-'}
                      </span>
                    </div>

                    <div className="w-[50px] text-center">
                      <span className={`text-sm font-semibold tabular-nums ${getSGColorClass(proValue)}`}>
                        {formatSG(proValue)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4">
            {(() => {
              const totalGap = (userSgData?.total || 0) - (selectedPlayer.stats.sgTotal || 0);
              const isAhead = totalGap >= 0;

              return (
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isAhead ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {isAhead ? (
                    <TrendingUp size={20} className="text-green-600" />
                  ) : (
                    <TrendingDown size={20} className="text-red-600" />
                  )}
                  <div>
                    <span
                      className={`block text-lg font-bold ${
                        isAhead ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatSG(Math.abs(totalGap))} slag
                    </span>
                    <span className="block text-[10px] text-tier-text-secondary">
                      {isAhead ? 'foran' : 'bak'} {selectedPlayer.playerName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Empty state when no player selected */}
      {!selectedPlayer && !suggestedPlayers?.length && (
        <Card variant="flat" padding="md">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Search size={32} className="opacity-30 mb-2 text-tier-text-tertiary" />
            <p className="text-sm text-tier-text-secondary m-0 max-w-[280px]">
              Søk etter en proffspiller for å sammenligne dine SG-tall
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProPlayerComparison;
