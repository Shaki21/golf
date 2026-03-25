/**
 * TIER GOLF - PeerComparisonWidget
 *
 * Viser spillerens posisjon i forhold til peers basert på testresultater.
 * Bruker peer-comparison API for statistikk og ranking.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, TrendingUp, Award, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useApi } from '../../services/api';
import { SubSectionTitle } from '../typography/Headings';

// =============================================================================
// Types
// =============================================================================

interface PeerCriteria {
  category?: string;
  gender?: string;
  ageRange?: { min: number; max: number };
  handicapRange?: { min: number; max: number };
}

interface PeerComparisonResult {
  playerId: string;
  testNumber: number;
  testResultId: string;
  peerCount: number;
  peerMean: number;
  peerMedian: number;
  peerStdDev: number;
  peerMin: number;
  peerMax: number;
  playerValue: number;
  playerPercentile: number;
  playerRank: number;
  playerZScore: number;
  peerCriteria: PeerCriteria;
  comparisonText: string;
}

interface CategoryComparison {
  category: string;
  percentile: number;
  rank: number;
  totalInCategory: number;
  readinessScore: number;
}

interface MultiLevelComparison {
  playerId: string;
  playerCategory: string;
  testNumber: number;
  playerValue: number;
  byCategory: Record<string, CategoryComparison>;
  nextCategoryReadiness: number;
  previousCategoryPerformance: number;
  overallPercentile: number;
  categoryStrengthScore: number;
}

interface PeerComparisonWidgetProps {
  playerId: string;
  testNumber?: number;
  showMultiLevel?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Helper Components
// =============================================================================

const PercentileGauge: React.FC<{ percentile: number; size?: 'sm' | 'md' | 'lg' }> = ({
  percentile,
  size = 'md'
}) => {
  const getColor = (p: number): string => {
    if (p >= 90) return 'var(--success)';
    if (p >= 75) return 'var(--accent)';
    if (p >= 50) return 'var(--warning)';
    if (p >= 25) return 'var(--text-secondary)';
    return 'var(--error)';
  };

  const getLabel = (p: number): string => {
    if (p >= 90) return 'Topp 10%';
    if (p >= 75) return 'Over gjennomsnittet';
    if (p >= 50) return 'Gjennomsnittet';
    if (p >= 25) return 'Under gjennomsnittet';
    return 'Trenger forbedring';
  };

  const sizes = {
    sm: { height: 6, fontSize: 11 },
    md: { height: 8, fontSize: 13 },
    lg: { height: 12, fontSize: 15 },
  };

  const s = sizes[size];
  const color = getColor(percentile);

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      }}>
        <span style={{ fontSize: s.fontSize, color: 'var(--text-secondary)' }}>
          {getLabel(percentile)}
        </span>
        <span style={{ fontSize: s.fontSize, fontWeight: 600, color }}>
          {percentile.toFixed(0)}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: s.height,
        backgroundColor: 'var(--border-default)',
        borderRadius: s.height / 2,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentile}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: s.height / 2,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({
  label,
  value,
  icon
}) => (
  <div style={{
    padding: '12px',
    backgroundColor: 'var(--background-elevated)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    flex: 1,
    minWidth: 80,
  }}>
    {icon && (
      <div style={{ marginBottom: 4, color: 'var(--text-tertiary)' }}>{icon}</div>
    )}
    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
      {value}
    </div>
    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
      {label}
    </div>
  </div>
);

const CategoryBar: React.FC<{
  category: string;
  comparison: CategoryComparison;
  isCurrentCategory: boolean;
}> = ({ category, comparison, isCurrentCategory }) => {
  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      'A': 'Elite',
      'B': 'Nasjonal',
      'C': 'Regional',
      'D': 'Lokal',
      'E': 'Nybegynner',
    };
    return labels[cat] || cat;
  };

  return (
    <div style={{
      padding: '10px 12px',
      backgroundColor: isCurrentCategory ? 'var(--accent-soft)' : 'var(--background-elevated)',
      borderRadius: 'var(--radius-sm)',
      marginBottom: 8,
      border: isCurrentCategory ? '1px solid var(--accent)' : '1px solid transparent',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontWeight: 600,
            fontSize: 13,
            color: isCurrentCategory ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            Kategori {category}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {getCategoryLabel(category)}
          </span>
          {isCurrentCategory && (
            <span style={{
              fontSize: 10,
              padding: '2px 6px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
            }}>
              Din kategori
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            #{comparison.rank} av {comparison.totalInCategory}
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: comparison.readinessScore >= 70 ? 'var(--success)' :
                   comparison.readinessScore >= 40 ? 'var(--warning)' : 'var(--text-secondary)',
          }}>
            {comparison.percentile.toFixed(0)}%
          </span>
        </div>
      </div>
      <div style={{
        width: '100%',
        height: 4,
        backgroundColor: 'var(--border-default)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${comparison.percentile}%`,
          height: '100%',
          backgroundColor: isCurrentCategory ? 'var(--accent)' : 'var(--text-tertiary)',
          borderRadius: 2,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export default function PeerComparisonWidget({
  playerId,
  testNumber = 1,
  showMultiLevel = false,
  compact = false,
  className = '',
  style,
}: PeerComparisonWidgetProps) {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<PeerComparisonResult | null>(null);
  const [multiLevel, setMultiLevel] = useState<MultiLevelComparison | null>(null);
  const [expanded, setExpanded] = useState(!compact);

  const fetchData = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch basic peer comparison
      const comparisonRes = await api.get<{ success: boolean; data: PeerComparisonResult }>(
        `/peer-comparison?playerId=${playerId}&testNumber=${testNumber}`
      );

      if (comparisonRes.success && comparisonRes.data) {
        setComparison(comparisonRes.data);
      }

      // Fetch multi-level if requested
      if (showMultiLevel) {
        const multiRes = await api.get<{ success: boolean; data: MultiLevelComparison }>(
          `/peer-comparison/multi-level?playerId=${playerId}&testNumber=${testNumber}`
        );

        if (multiRes.success && multiRes.data) {
          setMultiLevel(multiRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch peer comparison:', err);
      setError('Kunne ikke hente sammenligning');
    } finally {
      setLoading(false);
    }
  }, [api, playerId, testNumber, showMultiLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort categories for display
  const sortedCategories = useMemo(() => {
    if (!multiLevel?.byCategory) return [];
    return Object.entries(multiLevel.byCategory)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [multiLevel]);

  // Loading state
  if (loading) {
    return (
      <div className={className} style={{
        padding: compact ? 16 : 20,
        backgroundColor: 'var(--background-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        ...style,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: 'var(--text-secondary)',
          padding: 24,
        }}>
          <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Laster sammenligning...</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className} style={{
        padding: compact ? 16 : 20,
        backgroundColor: 'var(--background-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        ...style,
      }}>
        <div style={{
          textAlign: 'center',
          padding: 24,
          color: 'var(--text-secondary)',
        }}>
          <Users size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ fontSize: 14, marginBottom: 12 }}>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!comparison) {
    return (
      <div className={className} style={{
        padding: compact ? 16 : 20,
        backgroundColor: 'var(--background-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        ...style,
      }}>
        <div style={{
          textAlign: 'center',
          padding: 24,
          color: 'var(--text-secondary)',
        }}>
          <Users size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ fontSize: 14 }}>Ingen sammenligningsdata tilgjengelig</p>
          <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
            Fullfør en test for å se hvordan du ligger an
          </p>
        </div>
      </div>
    );
  }

  // Compact header (expandable)
  if (compact && !expanded) {
    return (
      <div
        className={className}
        onClick={() => setExpanded(true)}
        style={{
          padding: 16,
          backgroundColor: 'var(--background-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                Peer Sammenligning
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                #{comparison.playerRank} av {comparison.peerCount} spillere
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: comparison.playerPercentile >= 50 ? 'var(--success)' : 'var(--warning)',
              }}>
                {comparison.playerPercentile.toFixed(0)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>percentil</div>
            </div>
            <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className={className} style={{
      padding: compact ? 16 : 20,
      backgroundColor: 'var(--background-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-default)',
      ...style,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <SubSectionTitle style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Peer Sammenligning
            </SubSectionTitle>
            <p style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              Test {testNumber} · {comparison.peerCount} spillere
            </p>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              padding: 6,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
            }}
          >
            <ChevronUp size={18} />
          </button>
        )}
      </div>

      {/* Main Percentile */}
      <div style={{ marginBottom: 20 }}>
        <PercentileGauge percentile={comparison.playerPercentile} size="lg" />
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: showMultiLevel && multiLevel ? 20 : 0,
      }}>
        <StatBox
          label="Din plassering"
          value={`#${comparison.playerRank}`}
          icon={<Award size={16} />}
        />
        <StatBox
          label="Din score"
          value={comparison.playerValue.toFixed(1)}
          icon={<TrendingUp size={16} />}
        />
        <StatBox
          label="Gjennomsnitt"
          value={comparison.peerMean.toFixed(1)}
        />
        <StatBox
          label="Median"
          value={comparison.peerMedian.toFixed(1)}
        />
      </div>

      {/* Multi-level comparison */}
      {showMultiLevel && multiLevel && (
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 12,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
          }}>
            Sammenligning på tvers av kategorier
          </div>

          {sortedCategories.map(([category, comp]) => (
            <CategoryBar
              key={category}
              category={category}
              comparison={comp}
              isCurrentCategory={category === multiLevel.playerCategory}
            />
          ))}

          {/* Next category readiness */}
          {multiLevel.nextCategoryReadiness > 0 && (
            <div style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: 'var(--accent-soft)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Klar for neste nivå
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {multiLevel.nextCategoryReadiness.toFixed(0)}% klar for oppgradering
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison text */}
      {comparison.comparisonText && (
        <p style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
          lineHeight: 1.5,
        }}>
          {comparison.comparisonText}
        </p>
      )}
    </div>
  );
}
