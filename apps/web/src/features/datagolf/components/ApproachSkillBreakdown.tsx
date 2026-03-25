/**
 * Approach Skill Breakdown
 * Distance bucket analysis with tour comparison
 */

import React from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useApproachSkill } from '../../../hooks/useDataGolf';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { SubSectionTitle, CardTitle } from '../../../components/typography';

interface Props {
  playerId: string;
  className?: string;
}

interface ApproachSkill {
  insights?: string[];
}

const DISTANCE_BUCKETS = [
  { range: '50-75y', label: '50-75 yards' },
  { range: '75-100y', label: '75-100 yards' },
  { range: '100-125y', label: '100-125 yards' },
  { range: '125-150y', label: '125-150 yards' },
  { range: '150-175y', label: '150-175 yards' },
  { range: '175-200y', label: '175-200 yards' },
  { range: '200+y', label: '200+ yards' },
];

const ApproachSkillBreakdown: React.FC<Props> = ({ playerId, className = '' }) => {
  const { approachSkill, distanceBuckets, loading, error } = useApproachSkill(playerId) as {
    approachSkill: ApproachSkill | null;
    distanceBuckets: any[];
    loading: boolean;
    error: any;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-tier-border-default">
        <LoadingSpinner />
        <p className="mt-4 text-tier-text-secondary">Laster approach-analyse...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
        <div className="text-tier-error text-4xl mb-4">[Warning]</div>
        <SubSectionTitle style={{ marginBottom: 8 }}>Kunne ikke laste approach skill</SubSectionTitle>
        <p className="text-tier-text-secondary">{error}</p>
      </div>
    );
  }

  if (!distanceBuckets || distanceBuckets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
        <Target size={48} className="text-tier-text-secondary mx-auto mb-4" />
        <SubSectionTitle style={{ marginBottom: 8 }}>Ingen approach-data</SubSectionTitle>
        <p className="text-tier-text-secondary">
          Gjennomfør approach-tester for å se detaljert analyse
        </p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = distanceBuckets.map((bucket: any) => ({
    distance: bucket.range,
    'Din nærhet': parseFloat((bucket.playerProximity || 0).toFixed(1)),
    'Tour snitt': parseFloat((bucket.tourAverage || 0).toFixed(1)),
  }));

  return (
    <div className={`bg-white rounded-xl border border-tier-border-default ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-tier-border-default">
        <Target size={24} className="text-tier-navy" />
        <div>
          <SubSectionTitle style={{ marginBottom: 0 }}>Approach Skill Breakdown</SubSectionTitle>
          <p className="text-sm text-tier-text-secondary">Nærhet til flagg etter distanse</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-border-default)" />
            <XAxis
              dataKey="distance"
              stroke="var(--tier-text-secondary)"
              style={{ fontSize: 12 }}
            />
            <YAxis
              stroke="var(--tier-text-secondary)"
              style={{ fontSize: 12 }}
              label={{ value: 'Nærhet (meter)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tier-surface-base)',
                border: '1px solid var(--tier-border-default)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="Din nærhet"
              fill="var(--tier-navy)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="Tour snitt"
              fill="var(--tier-text-secondary)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distance bucket details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-6 border-t border-tier-border-default bg-tier-surface-base">
        {distanceBuckets.map((bucket: any, index: number) => {
          const diff = (bucket.tourAverage || 0) - (bucket.playerProximity || 0);
          const isBetter = diff > 0; // Lower proximity is better

          return (
            <div
              key={index}
              className="p-3 bg-white rounded-lg border border-tier-border-default"
            >
              <div className="text-xs font-medium text-tier-text-secondary mb-2">
                {bucket.range}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-tier-navy">
                    {(bucket.playerProximity || 0).toFixed(1)}m
                  </div>
                  <div className="text-xs text-tier-text-secondary">
                    vs {(bucket.tourAverage || 0).toFixed(1)}m
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${isBetter ? 'text-tier-success' : 'text-tier-error'}`}>
                  {isBetter ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="text-xs font-semibold">
                    {Math.abs(diff).toFixed(1)}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      {approachSkill?.insights && (
        <div className="p-6 border-t border-tier-border-default">
          <CardTitle style={{ marginBottom: 12 }}>Innsikt</CardTitle>
          <div className="space-y-2">
            {approachSkill.insights.map((insight: string, index: number) => (
              <div key={index} className="p-3 bg-tier-info-light rounded-lg text-sm text-tier-navy">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproachSkillBreakdown;
