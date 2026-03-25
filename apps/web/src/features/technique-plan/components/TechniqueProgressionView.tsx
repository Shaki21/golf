/**
 * Technique Progression View
 * Historical tracking of technique metrics and goals
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTechniqueStats } from '../../../hooks/useTechniquePlan';
import Card from '../../../ui/primitives/Card';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../components/typography';

const METRIC_LABELS: Record<string, string> = {
  clubPath: 'Club Path',
  attackAngle: 'Attack Angle',
  swingDirection: 'Swing Direction',
  faceToPath: 'Face to Path',
  dynamicLoft: 'Dynamic Loft',
  clubSpeed: 'Club Speed',
  ballSpeed: 'Ball Speed',
  smashFactor: 'Smash Factor',
  launchAngle: 'Launch Angle',
  spinRate: 'Spin Rate',
};

interface TechniqueProgressionViewProps {
  playerId?: string;
}

const TechniqueProgressionView: React.FC<TechniqueProgressionViewProps> = ({ playerId: propPlayerId }) => {
  const { user } = useAuth();
  const playerId = propPlayerId || user?.playerId || user?.id;

  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    toDate: new Date().toISOString(),
  });
  const [selectedClub, setSelectedClub] = useState<string | undefined>(undefined);

  const { stats: statsData, loading, error } = useTechniqueStats(playerId, {
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    club: selectedClub,
  });
  const stats = statsData as any; // Type assertion for complex stats structure

  const handleDateRangeChange = (days: number) => {
    setDateRange({
      fromDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      toDate: new Date().toISOString(),
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="p-12 text-center">
          <p className="text-tier-text-secondary">Loading progress data...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-tier-error">{error}</p>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-tier-text-tertiary mb-4" />
          <SubSectionTitle style={{ marginBottom: '0.5rem' }}>No data available</SubSectionTitle>
          <p className="text-sm text-tier-text-secondary">
            Import TrackMan data to see your technical progress
          </p>
        </div>
      </Card>
    );
  }

  const { overview, metricProgression, clubStats, recentImports } = stats;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-tier-text-secondary" />
              <span className="text-sm font-medium text-tier-navy">Period:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={dateRange.fromDate === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleDateRangeChange(30)}
              >
                30 days
              </Button>
              <Button
                variant={dateRange.fromDate === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleDateRangeChange(90)}
              >
                90 days
              </Button>
              <Button
                variant={dateRange.fromDate === new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleDateRangeChange(180)}
              >
                6 months
              </Button>
            </div>

            {clubStats && clubStats.length > 0 && (
              <>
                <div className="flex items-center gap-2 ml-auto">
                  <Filter size={16} className="text-tier-text-secondary" />
                  <span className="text-sm font-medium text-tier-navy">Club:</span>
                </div>
                <select
                  value={selectedClub || ''}
                  onChange={(e) => setSelectedClub(e.target.value || undefined)}
                  className="px-3 py-1.5 border border-tier-border-default rounded text-sm"
                >
                  <option value="">All</option>
                  {clubStats.map((club: any) => (
                    <option key={club.club} value={club.club}>
                      {club.club} ({club.shots} shots)
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-xs text-tier-text-secondary mb-1">Total shots</p>
              <p className="text-2xl font-bold text-tier-navy">{overview.totalShots}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-xs text-tier-text-secondary mb-1">Sessions</p>
              <p className="text-2xl font-bold text-tier-navy">{overview.sessions}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-xs text-tier-text-secondary mb-1">Clubs</p>
              <p className="text-2xl font-bold text-tier-navy">{overview.uniqueClubs}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-xs text-tier-text-secondary mb-1">Last import</p>
              <p className="text-sm font-semibold text-tier-navy">
                {overview.lastImportDate
                  ? new Date(overview.lastImportDate).toLocaleDateString('en-US')
                  : 'N/A'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Metric Progression */}
      {metricProgression && metricProgression.length > 0 && (
        <Card>
          <div className="p-4">
            <SubSectionTitle style={{ marginBottom: '1rem' }}>Metric progress</SubSectionTitle>
            <div className="space-y-4">
              {metricProgression.map((metric: any) => (
                <div key={metric.metricType} className="border-b border-tier-border-default pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-tier-navy">
                        {METRIC_LABELS[metric.metricType] || metric.metricType}
                      </p>
                      <p className="text-xs text-tier-text-secondary">{metric.measurements} measurements</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-tier-navy">
                        {metric.current?.toFixed(1) || 'N/A'}
                      </p>
                      {metric.trend !== undefined && metric.trend !== null && (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            metric.trend > 0 ? 'text-tier-success' : metric.trend < 0 ? 'text-tier-error' : 'text-tier-text-secondary'
                          }`}
                        >
                          {metric.trend > 0 ? (
                            <TrendingUp size={14} />
                          ) : metric.trend < 0 ? (
                            <TrendingDown size={14} />
                          ) : null}
                          <span>
                            {metric.trend > 0 ? '+' : ''}
                            {metric.trend.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-tier-text-secondary">
                      <span>Baseline: {metric.baseline?.toFixed(1) || 'N/A'}</span>
                      {metric.target && <span>Target: {metric.target.toFixed(1)}</span>}
                    </div>
                    {metric.target && metric.current && metric.baseline && (
                      <div className="w-full h-2 bg-tier-surface-base rounded-full overflow-hidden">
                        <div
                          className="h-full bg-tier-navy rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                ((metric.current - metric.baseline) /
                                  (metric.target - metric.baseline)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Club Stats */}
      {clubStats && clubStats.length > 0 && !selectedClub && (
        <Card>
          <div className="p-4">
            <SubSectionTitle style={{ marginBottom: '1rem' }}>Club statistics</SubSectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {clubStats.slice(0, 8).map((club: any) => (
                <div
                  key={club.club}
                  className="p-3 bg-tier-surface-base rounded-lg hover:bg-tier-navy-light transition-colors cursor-pointer"
                  onClick={() => setSelectedClub(club.club)}
                >
                  <p className="font-semibold text-tier-navy mb-1">{club.club}</p>
                  <p className="text-xs text-tier-text-secondary">{club.shots} shots</p>
                  {club.avgClubSpeed && (
                    <p className="text-xs text-tier-navy mt-1">
                      Speed: {club.avgClubSpeed.toFixed(1)} mph
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recent Imports */}
      {recentImports && recentImports.length > 0 && (
        <Card>
          <div className="p-4">
            <SubSectionTitle style={{ marginBottom: '1rem' }}>Recent imports</SubSectionTitle>
            <div className="space-y-2">
              {recentImports.slice(0, 5).map((importItem: any) => (
                <div
                  key={importItem.id}
                  className="flex items-center justify-between p-3 bg-tier-surface-base rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-tier-navy">{importItem.fileName}</p>
                    <p className="text-xs text-tier-text-secondary">
                      {new Date(importItem.createdAt).toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-tier-navy">
                      {importItem.shotsCount} shots
                    </p>
                    {importItem.goalsUpdated > 0 && (
                      <p className="text-xs text-tier-success">
                        {importItem.goalsUpdated} goals updated
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Placeholder for future chart */}
      <Card className="bg-tier-surface-base">
        <div className="p-12 text-center">
          <TrendingUp size={48} className="mx-auto text-tier-text-tertiary mb-4" />
          <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Timeline chart coming soon</SubSectionTitle>
          <p className="text-sm text-tier-text-secondary">
            Visualization of metrics over time with chart library
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TechniqueProgressionView;
