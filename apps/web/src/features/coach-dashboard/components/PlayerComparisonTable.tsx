/**
 * PlayerComparisonTable Component
 * Sortable table comparing player performance metrics
 */

import React, { useState } from 'react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { Button } from '../../../components/shadcn/button';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { PlayerComparison } from '../types/analytics.types';
import { useNavigate } from 'react-router-dom';

export interface PlayerComparisonTableProps {
  players: PlayerComparison[];
  isLoading?: boolean;
}

type SortField = keyof PlayerComparison;
type SortDirection = 'asc' | 'desc';

/**
 * Sortable table for player performance comparison
 *
 * @example
 * ```tsx
 * <PlayerComparisonTable
 *   players={playerComparisons}
 *   isLoading={false}
 * />
 * ```
 */
export function PlayerComparisonTable({ players, isLoading = false }: PlayerComparisonTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('performanceScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-tier-text-secondary" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-tier-gold" />
    ) : (
      <ArrowDown size={14} className="text-tier-gold" />
    );
  };

  const getCategoryBadgeVariant = (category: 'A' | 'B' | 'C' | null) => {
    if (!category) return 'default';
    return category === 'A' ? 'default' : category === 'B' ? 'secondary' : 'outline';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-96 animate-pulse bg-tier-surface-secondary rounded" />
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Player Comparison</h3>
        <div className="py-12 text-center text-tier-text-secondary">
          <p>No player data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Player Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tier-border">
              <th className="text-left py-3 px-2 font-medium text-tier-navy">
                <button
                  onClick={() => handleSort('playerName')}
                  className="flex items-center gap-2 hover:text-tier-gold transition-colors"
                >
                  Player
                  <SortIcon field="playerName" />
                </button>
              </th>
              <th className="text-center py-3 px-2 font-medium text-tier-navy">Category</th>
              <th className="text-right py-3 px-2 font-medium text-tier-navy">
                <button
                  onClick={() => handleSort('sessionsThisMonth')}
                  className="flex items-center gap-2 ml-auto hover:text-tier-gold transition-colors"
                >
                  Sessions
                  <SortIcon field="sessionsThisMonth" />
                </button>
              </th>
              <th className="text-right py-3 px-2 font-medium text-tier-navy">
                <button
                  onClick={() => handleSort('averageSessionDuration')}
                  className="flex items-center gap-2 ml-auto hover:text-tier-gold transition-colors"
                >
                  Avg Duration
                  <SortIcon field="averageSessionDuration" />
                </button>
              </th>
              <th className="text-right py-3 px-2 font-medium text-tier-navy">
                <button
                  onClick={() => handleSort('goalsCompleted')}
                  className="flex items-center gap-2 ml-auto hover:text-tier-gold transition-colors"
                >
                  Goals
                  <SortIcon field="goalsCompleted" />
                </button>
              </th>
              <th className="text-right py-3 px-2 font-medium text-tier-navy">
                <button
                  onClick={() => handleSort('performanceScore')}
                  className="flex items-center gap-2 ml-auto hover:text-tier-gold transition-colors"
                >
                  Score
                  <SortIcon field="performanceScore" />
                </button>
              </th>
              <th className="text-right py-3 px-2 font-medium text-tier-navy">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr
                key={player.playerId}
                className="border-b border-tier-border hover:bg-tier-surface-secondary transition-colors"
              >
                <td className="py-3 px-2 text-tier-navy font-medium">{player.playerName}</td>
                <td className="py-3 px-2 text-center">
                  {player.category ? (
                    <Badge variant={getCategoryBadgeVariant(player.category)}>
                      {player.category}
                    </Badge>
                  ) : (
                    <span className="text-tier-text-secondary text-sm">-</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-tier-navy">
                  {player.sessionsThisMonth}
                </td>
                <td className="py-3 px-2 text-right text-tier-navy">
                  {player.averageSessionDuration} min
                </td>
                <td className="py-3 px-2 text-right text-tier-navy">
                  {player.goalsCompleted} / {player.goalsTotal}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`font-semibold ${
                      player.performanceScore >= 80
                        ? 'text-tier-success'
                        : player.performanceScore >= 60
                        ? 'text-tier-gold'
                        : 'text-tier-warning'
                    }`}
                  >
                    {player.performanceScore}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/coach/athletes/${player.playerId}`)}
                    className="text-tier-navy hover:text-tier-gold"
                  >
                    <ExternalLink size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default PlayerComparisonTable;
