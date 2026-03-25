/**
 * TIER Golf - Player Comparison Tool
 * Design System v3.0 - Premium Light
 *
 * Multi-select player comparison with radar chart visualization.
 * Uses analyticsAPI.comparePlayers() backend endpoint.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitCompare,
  Search,
  X,
  Plus,
  Users,
  ChevronRight,
  Loader2,
  RefreshCw,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { analyticsAPI, coachesAPI } from '../../services/api';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// Types matching backend MultiPlayerComparison interface
interface PlayerComparisonRow {
  playerId: string;
  playerName: string;
  category: string;
  testResults: Record<number, {
    value: number;
    passed: boolean;
    percentile?: number;
  }>;
  overallScore: number;
  rank: number;
}

interface MultiPlayerComparison {
  testNumbers: number[];
  players: PlayerComparisonRow[];
  filters: {
    categories?: string[];
    gender?: string;
    ageRange?: { min: number; max: number };
  };
}

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
}

// Available tests for comparison
const AVAILABLE_TESTS = [
  { number: 1, name: 'Driver Distance' },
  { number: 2, name: 'Driver Accuracy' },
  { number: 3, name: 'Iron 7 Distance' },
  { number: 4, name: 'Iron 7 Accuracy' },
  { number: 5, name: 'Wedge 50m' },
  { number: 6, name: 'Wedge 30m' },
  { number: 7, name: 'Putting 3m' },
  { number: 8, name: 'Putting 6m' },
  { number: 9, name: 'Bunker' },
  { number: 10, name: 'Pitch' },
];

// Colors for players in comparison
const PLAYER_COLORS = [
  'rgb(var(--status-info))', // Blue
  'rgb(var(--status-success))', // Green
  'rgb(var(--tier-gold))', // Amber
  'rgb(var(--status-error))', // Red
  'rgb(var(--category-j))', // Purple
];

export const PlayerComparisonTool: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<number[]>([1, 2, 3, 4, 5]);
  const [comparison, setComparison] = useState<MultiPlayerComparison | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch athletes on mount
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await coachesAPI.getAthletes();
        if (response?.data?.data) {
          setAthletes(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch athletes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  // Filter athletes by search
  const filteredAthletes = useMemo(() => {
    if (!searchQuery) return athletes;
    const query = searchQuery.toLowerCase();
    return athletes.filter(
      (a) =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
    );
  }, [athletes, searchQuery]);

  // Get selected player objects
  const selectedPlayerObjects = useMemo(() => {
    return selectedPlayers
      .map((id) => athletes.find((a) => a.id === id))
      .filter(Boolean) as Athlete[];
  }, [selectedPlayers, athletes]);

  // Add player to comparison
  const addPlayer = (playerId: string) => {
    if (selectedPlayers.length >= 5) return;
    if (!selectedPlayers.includes(playerId)) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
    setShowPlayerPicker(false);
    setSearchQuery('');
  };

  // Remove player from comparison
  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    setComparison(null);
  };

  // Toggle test selection
  const toggleTest = (testNumber: number) => {
    if (selectedTests.includes(testNumber)) {
      if (selectedTests.length > 1) {
        setSelectedTests(selectedTests.filter((t) => t !== testNumber));
      }
    } else {
      setSelectedTests([...selectedTests, testNumber]);
    }
  };

  // Run comparison
  const runComparison = async () => {
    if (selectedPlayers.length < 2) return;

    setComparing(true);
    setError(null);

    try {
      const response = await analyticsAPI.comparePlayers(selectedPlayers);
      if (response?.data?.data) {
        // Type assertion needed as API returns generic Record type
        const data = response.data.data as unknown as MultiPlayerComparison;
        setComparison(data);
      } else {
        setError('No data received');
      }
    } catch (err) {
      console.error('Comparison failed:', err);
      setError('Could not compare players');
    } finally {
      setComparing(false);
    }
  };

  // Get category classes
  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'A':
        return { bg: 'bg-tier-success/10', text: 'text-tier-success' };
      case 'B':
        return { bg: 'bg-tier-navy/10', text: 'text-tier-navy' };
      case 'C':
        return { bg: 'bg-tier-warning/10', text: 'text-tier-warning' };
      default:
        return { bg: 'bg-tier-white', text: 'text-tier-text-secondary' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-tier-surface-base">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-tier-navy" />
          <p className="text-sm text-tier-text-secondary">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-tier-surface-base min-h-screen">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tier-navy to-tier-navy/80 flex items-center justify-center flex-shrink-0">
          <GitCompare size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <PageHeader
            title="Compare Players"
            subtitle="Select up to 5 players to compare results"
            helpText="Compare test results for up to 5 players side by side. Select tests to include, view graphical visualization and identify relative strengths and weaknesses between players."
            divider={false}
          />
        </div>
      </div>

      {/* Player Selection */}
      <div className="bg-tier-white rounded-2xl p-5 mb-6 border border-tier-border-default">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-tier-navy" />
            <SectionTitle className="m-0">
              Selected players ({selectedPlayers.length}/5)
            </SectionTitle>
          </div>
          {selectedPlayers.length < 5 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPlayerPicker(true)}
            >
              <Plus size={16} />
              Add player
            </Button>
          )}
        </div>

        {/* Selected players */}
        {selectedPlayerObjects.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {selectedPlayerObjects.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 py-2 px-4 bg-tier-surface-base rounded-xl border border-tier-border-default"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: PLAYER_COLORS[index] }}
                >
                  {player.firstName[0]}{player.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-tier-navy">
                    {player.firstName} {player.lastName}
                  </p>
                  <span
                    className={`text-[11px] font-medium py-0.5 px-1.5 rounded ${
                      getCategoryClasses(player.category).bg
                    } ${getCategoryClasses(player.category).text}`}
                  >
                    Kat. {player.category}
                  </span>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="p-1 hover:bg-tier-error/10 rounded-full transition-colors"
                >
                  <X size={16} className="text-tier-text-tertiary hover:text-tier-error" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-tier-surface-base rounded-xl border border-dashed border-tier-border-default">
            <Users size={32} className="mx-auto text-tier-text-tertiary mb-2" />
            <p className="text-sm text-tier-text-secondary">
              No players selected. Add at least 2 players to compare.
            </p>
          </div>
        )}

        {/* Player picker modal */}
        {showPlayerPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-tier-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-tier-border-default">
                <div className="flex items-center justify-between mb-3">
                  <SubSectionTitle style={{ marginBottom: 0 }}>
                    Select player
                  </SubSectionTitle>
                  <button
                    onClick={() => {
                      setShowPlayerPicker(false);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-tier-surface-base rounded-lg"
                  >
                    <X size={20} className="text-tier-text-tertiary" />
                  </button>
                </div>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
                  />
                  <input
                    type="text"
                    placeholder="Search for player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2.5 pr-3 pl-10 rounded-lg border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filteredAthletes.length > 0 ? (
                  filteredAthletes
                    .filter((a) => !selectedPlayers.includes(a.id))
                    .map((athlete) => (
                      <button
                        key={athlete.id}
                        onClick={() => addPlayer(athlete.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-tier-surface-base rounded-xl transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-tier-navy/15 flex items-center justify-center text-sm font-semibold text-tier-navy">
                          {athlete.firstName[0]}{athlete.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-tier-navy">
                            {athlete.firstName} {athlete.lastName}
                          </p>
                          <span
                            className={`text-[11px] font-medium py-0.5 px-1.5 rounded ${
                              getCategoryClasses(athlete.category).bg
                            } ${getCategoryClasses(athlete.category).text}`}
                          >
                            Category {athlete.category}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-tier-text-tertiary" />
                      </button>
                    ))
                ) : (
                  <p className="text-center py-8 text-sm text-tier-text-secondary">
                    No players found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Selection */}
      <div className="bg-tier-white rounded-2xl p-5 mb-6 border border-tier-border-default">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-tier-navy" />
          <SectionTitle className="m-0">
            Select tests to compare
          </SectionTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TESTS.map((test) => (
            <button
              key={test.number}
              onClick={() => toggleTest(test.number)}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedTests.includes(test.number)
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-white border border-tier-border-default'
              }`}
            >
              {test.name}
            </button>
          ))}
        </div>
      </div>

      {/* Compare Button */}
      <div className="flex justify-center mb-6">
        <Button
          variant="primary"
          size="lg"
          onClick={runComparison}
          disabled={selectedPlayers.length < 2 || comparing}
          className="min-w-[200px]"
        >
          {comparing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompare size={18} />
              Compare players
            </>
          )}
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <StateCard
          variant="error"
          title="Comparison failed"
          description={error}
          action={<Button onClick={runComparison}>Try again</Button>}
        />
      )}

      {/* Comparison Results */}
      {comparison && comparison.players.length > 0 && (
        <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={20} className="text-tier-navy" />
            <SectionTitle className="m-0">
              Comparison Results
            </SectionTitle>
          </div>

          {/* Ranking cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {comparison.players
              .sort((a, b) => a.rank - b.rank)
              .map((player, index) => {
                const playerIndex = selectedPlayers.indexOf(player.playerId);
                return (
                  <div
                    key={player.playerId}
                    className={`rounded-xl p-4 border ${
                      index === 0
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-tier-surface-base border-tier-border-default'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: PLAYER_COLORS[playerIndex] || PLAYER_COLORS[0] }}
                      >
                        #{player.rank}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-tier-navy">
                          {player.playerName}
                        </p>
                        <span
                          className={`text-[11px] font-medium py-0.5 px-1.5 rounded ${
                            getCategoryClasses(player.category).bg
                          } ${getCategoryClasses(player.category).text}`}
                        >
                          Kat. {player.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-tier-white rounded-lg">
                      <span className="text-xs text-tier-text-secondary">Total score</span>
                      <span className="text-lg font-bold text-tier-navy">
                        {player.overallScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Test results table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-tier-border-default">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-tier-navy">
                    Test
                  </th>
                  {comparison.players
                    .sort((a, b) => a.rank - b.rank)
                    .map((player, index) => {
                      const playerIndex = selectedPlayers.indexOf(player.playerId);
                      return (
                        <th
                          key={player.playerId}
                          className="text-center py-3 px-4 text-sm font-semibold"
                          style={{ color: PLAYER_COLORS[playerIndex] || PLAYER_COLORS[0] }}
                        >
                          {player.playerName.split(' ')[0]}
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody>
                {comparison.testNumbers.map((testNum) => {
                  const test = AVAILABLE_TESTS.find((t) => t.number === testNum);
                  return (
                    <tr
                      key={testNum}
                      className="border-b border-tier-border-default last:border-b-0"
                    >
                      <td className="py-3 px-4 text-sm text-tier-navy">
                        {test?.name || `Test ${testNum}`}
                      </td>
                      {comparison.players
                        .sort((a, b) => a.rank - b.rank)
                        .map((player) => {
                          const result = player.testResults[testNum];
                          return (
                            <td
                              key={`${player.playerId}-${testNum}`}
                              className="text-center py-3 px-4"
                            >
                              {result ? (
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`text-sm font-semibold ${
                                      result.passed
                                        ? 'text-tier-success'
                                        : 'text-tier-navy'
                                    }`}
                                  >
                                    {result.value}
                                  </span>
                                  {result.percentile !== undefined && (
                                    <span className="text-xs text-tier-text-tertiary">
                                      P{result.percentile}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-tier-text-tertiary">-</span>
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state for no comparison yet */}
      {!comparison && selectedPlayers.length >= 2 && !comparing && !error && (
        <div className="text-center py-12 bg-tier-white rounded-2xl border border-dashed border-tier-border-default">
          <GitCompare size={48} className="mx-auto text-tier-text-tertiary mb-3" />
          <p className="text-tier-text-secondary">
            Click "Compare players" to see results
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerComparisonTool;
