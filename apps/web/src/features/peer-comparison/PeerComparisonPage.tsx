/**
 * Peer Group Comparison Dashboard
 * Compare player stats with similar players
 */

import React, { useState, useEffect } from 'react';
import { Users, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle } from '../../components/typography';
import usePeerComparison from '../../hooks/usePeerComparison';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../ui/primitives/Button';
import Input from '../../ui/primitives/Input';

const PeerComparisonPage: React.FC = () => {
  const { user } = useAuth();
  const player = user;
  const [filters, setFilters] = useState<{
    category: string;
    gender: string;
    ageMin: number | undefined;
    ageMax: number | undefined;
    handicapMin: number | undefined;
    handicapMax: number | undefined;
  }>({
    category: '',
    gender: '',
    ageMin: undefined,
    ageMax: undefined,
    handicapMin: undefined,
    handicapMax: undefined,
  });
  const [testNumber, setTestNumber] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: comparisonData, loading: compLoading, error: compError } = usePeerComparison(
    player?.id,
    testNumber,
    false // showMultiLevel
  );
  const comparison = comparisonData as any; // Type assertion for additional properties
  // TODO: Implement usePeerGroup hook
  const peers: any[] = [];
  const peersLoading = false;
  const peersError = null;

  // Auto-set filters based on player data
  useEffect(() => {
    if (player) {
      setFilters((prev) => ({
        ...prev,
        gender: (player as any)?.gender || prev.gender,
        category: (player as any)?.category || prev.category,
        ageMin: (player as any)?.age ? Math.max(0, (player as any).age - 2) : prev.ageMin,
        ageMax: (player as any)?.age ? (player as any).age + 2 : prev.ageMax,
        handicapMin: (player as any)?.handicap ? Math.max(-10, (player as any).handicap - 3) : prev.handicapMin,
        handicapMax: (player as any)?.handicap ? Math.min(54, (player as any).handicap + 3) : prev.handicapMax,
      }));
    }
  }, [player]);

  const handleResetFilters = () => {
    const p = player as any;
    setFilters({
      category: p?.category || '',
      gender: p?.gender || '',
      ageMin: p?.age ? Math.max(0, p.age - 2) : undefined,
      ageMax: p?.age ? p.age + 2 : undefined,
      handicapMin: p?.handicap ? Math.max(-10, p.handicap - 3) : undefined,
      handicapMax: p?.handicap ? Math.min(54, p.handicap + 3) : undefined,
    });
  };

  const ComparisonStat = ({ label, playerValue, peerAverage, unit = '' }: any) => {
    const diff = playerValue - peerAverage;
    const percentDiff = peerAverage !== 0 ? ((diff / peerAverage) * 100).toFixed(1) : null;

    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-4">
        <div className="text-sm text-tier-text-secondary mb-2">{label}</div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {playerValue?.toFixed(1) || '--'}
              {unit}
            </div>
            <div className="text-xs text-tier-text-secondary mt-1">
              Din verdi
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-tier-text-secondary">
              {peerAverage?.toFixed(1) || '--'}
              {unit}
            </div>
            <div className="text-xs text-tier-text-secondary">Gruppe snitt</div>
          </div>
        </div>
        {percentDiff && (
          <div
            className={`flex items-center gap-1 mt-2 pt-2 border-t border-tier-border-default text-sm ${
              diff > 0 ? 'text-tier-success' : diff < 0 ? 'text-tier-error' : 'text-tier-text-secondary'
            }`}
          >
            {diff > 0 ? (
              <TrendingUp size={16} />
            ) : diff < 0 ? (
              <TrendingDown size={16} />
            ) : null}
            <span>
              {diff > 0 ? '+' : ''}
              {percentDiff}% vs gruppe
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <p className="text-tier-text-secondary">Laster spillerdata...</p>
          </div>
        </div>
      </div>
    );
  }

  const loading = compLoading || peersLoading;
  const error = compError || peersError;

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users size={28} className="text-tier-info" />
            <PageHeader title="Peer Group Sammenligning" subtitle="" helpText="" actions={null} className="mb-0" />
          </div>
          <p className="text-tier-text-secondary">
            Sammenlign din prestasjon med lignende spillere
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-xl border border-tier-border-default p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <SubSectionTitle style={{ marginBottom: 0 }} className="flex items-center gap-2">
              <Filter size={20} />
              Filtrer peer gruppe
            </SubSectionTitle>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Skjul' : 'Vis'} filtre
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Kategori"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                placeholder="f.eks. ELITE"
              />
              <Input
                label="Kjønn"
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                placeholder="M eller F"
              />
              <Input
                label="Test nummer"
                type="number"
                value={testNumber}
                onChange={(e) => setTestNumber(parseInt(e.target.value) || 1)}
                min={1}
                max={20}
              />
              <Input
                label="Min alder"
                type="number"
                value={filters.ageMin || ''}
                onChange={(e) => setFilters({ ...filters, ageMin: e.target.value ? parseInt(e.target.value) : undefined })}
              />
              <Input
                label="Maks alder"
                type="number"
                value={filters.ageMax || ''}
                onChange={(e) => setFilters({ ...filters, ageMax: e.target.value ? parseInt(e.target.value) : undefined })}
              />
              <Input
                label="Min handicap"
                type="number"
                value={filters.handicapMin || ''}
                onChange={(e) => setFilters({ ...filters, handicapMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                step={0.1}
              />
              <Input
                label="Maks handicap"
                type="number"
                value={filters.handicapMax || ''}
                onChange={(e) => setFilters({ ...filters, handicapMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                step={0.1}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleResetFilters}>
              Tilbakestill filtre
            </Button>
          </div>

          <div className="mt-4 text-sm text-tier-text-secondary">
            {peers.length > 0 ? (
              <span>{peers.length} spillere i peer gruppe</span>
            ) : (
              <span>Ingen spillere funnet med disse kriteriene</span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
            <p className="text-tier-text-secondary">Laster sammenligning...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="text-tier-error text-4xl mb-2">⚠️</div>
            <p className="text-tier-error">{error}</p>
          </div>
        )}

        {/* Comparison Data */}
        {!loading && !error && comparison && (
          <div className="space-y-6">
            {/* Stats Comparison Grid */}
            <div>
              <SubSectionTitle>Test {testNumber} - Sammenligning</SubSectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparison.playerStats && comparison.peerStats && (
                  <>
                    {comparison.playerStats.driverSpeed && (
                      <ComparisonStat
                        label="Driver hastighet"
                        playerValue={comparison.playerStats.driverSpeed}
                        peerAverage={comparison.peerStats.avgDriverSpeed}
                        unit=" km/h"
                      />
                    )}
                    {comparison.playerStats.approachAccuracy && (
                      <ComparisonStat
                        label="Approach presisjon"
                        playerValue={comparison.playerStats.approachAccuracy}
                        peerAverage={comparison.peerStats.avgApproachAccuracy}
                        unit="%"
                      />
                    )}
                    {comparison.playerStats.puttingSuccess && (
                      <ComparisonStat
                        label="Putting suksess"
                        playerValue={comparison.playerStats.puttingSuccess}
                        peerAverage={comparison.peerStats.avgPuttingSuccess}
                        unit="%"
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Peer Group List */}
            <div>
              <SubSectionTitle>Peer gruppe ({peers.length})</SubSectionTitle>
              <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
                <table className="min-w-full divide-y divide-tier-border-default">
                  <thead className="bg-tier-surface-base">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tier-text-secondary uppercase">
                        Spiller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tier-text-secondary uppercase">
                        Alder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tier-text-secondary uppercase">
                        Handicap
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-tier-text-secondary uppercase">
                        Kategori
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-tier-border-default">
                    {peers.slice(0, 20).map((peer: any, idx: number) => (
                      <tr key={idx} className="hover:bg-tier-surface-base">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-tier-navy">
                          {peer.name || `Spiller ${idx + 1}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tier-text-secondary">
                          {peer.age || '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tier-text-secondary">
                          {peer.handicap?.toFixed(1) || '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-tier-text-secondary">
                          {peer.category || '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {peers.length > 20 && (
                  <div className="px-6 py-4 bg-tier-surface-base text-sm text-tier-text-secondary">
                    Viser 20 av {peers.length} spillere
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !comparison && (
          <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Ingen sammenligningsdata</SubSectionTitle>
            <p className="text-tier-text-secondary">
              Juster filtrene eller vent på flere testresultater
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerComparisonPage;
