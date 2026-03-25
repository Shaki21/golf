/**
 * Pro Player Search
 * Search and select professional players for head-to-head comparison
 */

import React, { useState } from 'react';
import { Search, User, X } from 'lucide-react';
import { useProPlayerSearch } from '../../../hooks/useDataGolf';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Props {
  onPlayerSelect: (player: any) => void;
  selectedPlayer?: any;
  className?: string;
}

const ProPlayerSearch: React.FC<Props> = ({ onPlayerSelect, selectedPlayer, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { players, loading } = useProPlayerSearch(query);

  const handleSelect = (player: any) => {
    onPlayerSelect(player);
    setQuery('');
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onPlayerSelect(null);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      {!selectedPlayer ? (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Søk etter proff-spiller..."
            className="w-full pl-10 pr-4 py-3 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy text-tier-navy"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      ) : (
        /* Selected player */
        <div className="flex items-center justify-between p-3 bg-tier-info-light border-2 border-tier-info rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-tier-info text-white p-2 rounded-lg">
              <User size={20} />
            </div>
            <div>
              <div className="font-semibold text-tier-navy">{selectedPlayer.name}</div>
              <div className="text-sm text-tier-text-secondary">
                {selectedPlayer.country} • World Rank: {selectedPlayer.worldRank || 'N/A'}
              </div>
            </div>
          </div>
          <button
            onClick={handleClearSelection}
            className="p-2 hover:bg-tier-error-light rounded-lg transition-colors"
          >
            <X size={18} className="text-tier-error" />
          </button>
        </div>
      )}

      {/* Search results dropdown */}
      {isOpen && query.length >= 2 && !selectedPlayer && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-tier-border-default rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : players.length === 0 ? (
            <div className="text-center p-8 text-tier-text-secondary">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>Ingen spillere funnet</p>
            </div>
          ) : (
            <div className="divide-y divide-tier-border-default">
              {players.map((player: any) => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-tier-surface-base transition-colors text-left"
                >
                  <div className="bg-tier-surface-secondary p-2 rounded-lg">
                    <User size={18} className="text-tier-navy" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-tier-navy">{player.name}</div>
                    <div className="text-sm text-tier-text-secondary">
                      {player.country}
                      {player.worldRank && ` • #${player.worldRank}`}
                      {player.tour && ` • ${player.tour}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ProPlayerSearch;
