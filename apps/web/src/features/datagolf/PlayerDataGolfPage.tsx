/**
 * Player DataGolf Page
 * Professional comparison and benchmarking
 */

import React, { useState } from 'react';
import { Trophy, Users, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompareToTour, useTourAverages } from '../../hooks/useDataGolf';
import TourComparisonCard from './components/TourComparisonCard';
import ProPlayerSearch from './components/ProPlayerSearch';
import ApproachSkillBreakdown from './components/ApproachSkillBreakdown';
import Button from '../../ui/primitives/Button';
import { PageHeader } from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SubSectionTitle, CardTitle } from '../../components/typography';

type Tour = 'pga' | 'european' | 'lpga';

interface ComparisonData {
  stats?: Array<any>;
  playerData?: any;
  tourData?: any;
  [key: string]: any;
}

interface TourAveragesData {
  stats?: Array<any>;
  [key: string]: any;
}

const TOUR_OPTIONS = [
  { value: 'pga' as Tour, label: 'PGA Tour', icon: '[US]' },
  { value: 'european' as Tour, label: 'DP World Tour', icon: '[EU]' },
  { value: 'lpga' as Tour, label: 'LPGA Tour', icon: '[Golf]' },
];

const CURRENT_SEASON = '2024';

const PlayerDataGolfPage: React.FC = () => {
  const { user } = useAuth();
  const playerId = user?.playerId || user?.id;

  const [selectedTour, setSelectedTour] = useState<Tour>('pga');
  const [selectedProPlayer, setSelectedProPlayer] = useState<any>(null);
  const [showProSearch, setShowProSearch] = useState(false);

  const { comparison, loading: comparisonLoading, error: comparisonError } = useCompareToTour(
    (playerId || '') as string,
    selectedTour,
    CURRENT_SEASON
  ) as { comparison: ComparisonData | null; loading: boolean; error: any };

  const { averages, loading: averagesLoading } = useTourAverages(selectedTour, CURRENT_SEASON) as {
    averages: TourAveragesData | null;
    loading: boolean;
  };

  const loading = comparisonLoading || averagesLoading;

  if (!playerId) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-tier-error">Ingen bruker funnet. Vennligst logg inn.</p>
          </div>
        </div>
      </div>
    );
  }

  // Stats to display
  const stats = comparison?.stats || [];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <PageHeader
            title="Sammenlign med proffspillere"
            subtitle="Se hvordan du måler deg mot tour-gjennomsnitt og spesifikke proffspillere"
            helpText=""
            actions={null}
          />
        </div>

        {/* Tour selector */}
        <div className="bg-white rounded-xl border border-tier-border-default p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-tier-navy" />
            <SubSectionTitle style={{ marginBottom: 0 }}>Velg tour</SubSectionTitle>
          </div>
          <div className="flex gap-3">
            {TOUR_OPTIONS.map((tour) => (
              <button
                key={tour.value}
                onClick={() => setSelectedTour(tour.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  selectedTour === tour.value
                    ? 'bg-tier-navy text-white border-tier-navy'
                    : 'bg-white text-tier-navy border-tier-border-default hover:border-tier-navy'
                }`}
              >
                <span className="text-xl">{tour.icon}</span>
                <span className="font-medium">{tour.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pro player search */}
        <div className="bg-white rounded-xl border border-tier-border-default p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-tier-navy" />
              <SubSectionTitle style={{ marginBottom: 0 }}>Sammenlign med spesifikk spiller</SubSectionTitle>
            </div>
            {!showProSearch && !selectedProPlayer && (
              <Button variant="secondary" size="sm" onClick={() => setShowProSearch(true)}>
                Søk spiller
              </Button>
            )}
          </div>

          {(showProSearch || selectedProPlayer) && (
            <ProPlayerSearch
              onPlayerSelect={(player) => {
                setSelectedProPlayer(player);
                setShowProSearch(false);
              }}
              selectedPlayer={selectedProPlayer}
            />
          )}

          {!showProSearch && !selectedProPlayer && (
            <p className="text-tier-text-secondary text-sm">
              Søk etter en proffspiller for å sammenligne deg direkte
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-tier-border-default">
            <LoadingSpinner />
            <p className="mt-4 text-tier-text-secondary">Laster sammenligning...</p>
          </div>
        )}

        {/* Error state */}
        {comparisonError && !loading && (
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="text-tier-error text-4xl mb-4">[Warning]</div>
            <SubSectionTitle style={{ marginBottom: 8 }}>Kunne ikke laste data</SubSectionTitle>
            <p className="text-tier-text-secondary">{comparisonError}</p>
          </div>
        )}

        {/* Tour comparison cards */}
        {!loading && comparison && (
          <>
            <div className="mb-6">
              <SubSectionTitle style={{ marginBottom: 16 }}>
                Din prestasjon vs {TOUR_OPTIONS.find((t) => t.value === selectedTour)?.label}
              </SubSectionTitle>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Example stats - these would come from the API */}
                <TourComparisonCard
                  stat={{
                    label: 'Gjennomsnittlig score',
                    playerValue: 74.2,
                    tourAverage: 71.5,
                    format: 'decimal',
                    inverse: true, // Lower is better
                  }}
                />
                <TourComparisonCard
                  stat={{
                    label: 'Greens i regulering',
                    playerValue: 58.3,
                    tourAverage: 65.2,
                    unit: '%',
                    format: 'decimal',
                  }}
                />
                <TourComparisonCard
                  stat={{
                    label: 'Putting gjennomsnitt',
                    playerValue: 1.78,
                    tourAverage: 1.74,
                    format: 'decimal',
                    inverse: true,
                  }}
                />
                <TourComparisonCard
                  stat={{
                    label: 'Driving distanse',
                    playerValue: 265,
                    tourAverage: 295,
                    unit: 'y',
                    format: 'number',
                  }}
                />
                <TourComparisonCard
                  stat={{
                    label: 'Scrambling',
                    playerValue: 52.1,
                    tourAverage: 58.9,
                    unit: '%',
                    format: 'decimal',
                  }}
                />
                <TourComparisonCard
                  stat={{
                    label: 'Sand saves',
                    playerValue: 48.5,
                    tourAverage: 55.3,
                    unit: '%',
                    format: 'decimal',
                  }}
                />
              </div>
            </div>

            {/* Approach skill breakdown */}
            <div className="mb-6">
              <SubSectionTitle style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={24} />
                Approach Skill Analyse
              </SubSectionTitle>
              <ApproachSkillBreakdown playerId={playerId} />
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl border border-tier-border-default p-6">
              <SubSectionTitle style={{ marginBottom: 16 }}>Styrker og svakheter</SubSectionTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-tier-success-light rounded-lg">
                  <CardTitle style={{ marginBottom: 8 }} className="text-tier-success">Dine styrker</CardTitle>
                  <ul className="text-sm text-tier-navy space-y-1">
                    <li>• Short game (over tour-snitt)</li>
                    <li>• Putting fra kort distanse</li>
                  </ul>
                </div>
                <div className="p-4 bg-tier-warning-light rounded-lg">
                  <CardTitle style={{ marginBottom: 8 }} className="text-tier-warning">Forbedringsområder</CardTitle>
                  <ul className="text-sm text-tier-navy space-y-1">
                    <li>• Driving distanse (under tour-snitt)</li>
                    <li>• Greens i regulering</li>
                    <li>• Lang approach-spill</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerDataGolfPage;
