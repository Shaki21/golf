/**
 * Strokes Gained History
 * Interactive historical trends with zoom and export
 */

import React, { useState } from 'react';
import { Download, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStrokesGainedTrends } from '../../hooks/useStrokesGained';
import Button from '../../ui/primitives/Button';
import { PageHeader } from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SubSectionTitle } from '../../components/typography';

interface Props {
  playerId: string;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
];

const StrokesGainedHistory: React.FC<Props> = ({ playerId, className = '' }) => {
  const [months, setMonths] = useState(6);
  const { trends, loading, error, refetch } = useStrokesGainedTrends(playerId, months);

  const handleExport = () => {
    if (!trends || trends.length === 0) return;

    // Convert to CSV
    const headers = ['Date', 'Total SG', 'Approach', 'Around Green', 'Putting'];
    const csvData = [
      headers.join(','),
      ...trends.map((t: any) =>
        [
          t.date,
          t.total || 0,
          t.approach || 0,
          t.aroundGreen || 0,
          t.putting || 0,
        ].join(',')
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strokes-gained-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <LoadingSpinner />
        <p className="mt-4 text-tier-text-secondary">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
        <div className="text-tier-error text-4xl mb-4">⚠️</div>
        <SubSectionTitle style={{ marginBottom: 0 }}>Could not load history</SubSectionTitle>
        <p className="text-tier-text-secondary mb-4">{error}</p>
        <Button variant="primary" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
        <Calendar size={48} className="text-tier-text-secondary mx-auto mb-4" />
        <SubSectionTitle style={{ marginBottom: 0 }}>No history yet</SubSectionTitle>
        <p className="text-tier-text-secondary">
          When you have completed more tests over time, the trend will be displayed here.
        </p>
      </div>
    );
  }

  // Format data for chart
  const chartData = trends.map((t: any) => ({
    date: new Date(t.date).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' }),
    'Total SG': parseFloat((t.total || 0).toFixed(2)),
    'Approach': parseFloat((t.approach || 0).toFixed(2)),
    'Around Green': parseFloat((t.aroundGreen || 0).toFixed(2)),
    'Putting': parseFloat((t.putting || 0).toFixed(2)),
  }));

  return (
    <div className={`bg-white rounded-xl border border-tier-border-default ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-tier-border-default">
        <div className="flex items-center gap-3">
          <TrendingUp size={24} className="text-tier-navy" />
          <PageHeader title="Historical development" subtitle="" helpText="" actions={null} className="m-0" />
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="px-4 py-2 border border-tier-border-default rounded-lg text-sm font-medium text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Export button */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={16} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-border-default)" />
            <XAxis
              dataKey="date"
              stroke="var(--tier-text-secondary)"
              style={{ fontSize: 12 }}
            />
            <YAxis
              stroke="var(--tier-text-secondary)"
              style={{ fontSize: 12 }}
              label={{ value: 'Strokes Gained', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tier-surface-base)',
                border: '1px solid var(--tier-border-default)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total SG"
              stroke="var(--tier-navy)"
              strokeWidth={3}
              dot={{ fill: 'var(--tier-navy)', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Approach"
              stroke="var(--category-putting)"
              strokeWidth={2}
              dot={{ fill: 'var(--category-putting)', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Around Green"
              stroke="var(--category-short-game)"
              strokeWidth={2}
              dot={{ fill: 'var(--category-short-game)', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Putting"
              stroke="var(--category-physical)"
              strokeWidth={2}
              dot={{ fill: 'var(--category-physical)', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 p-6 border-t border-tier-border-default bg-tier-surface-base">
        <div className="text-center">
          <div className="text-sm font-medium text-tier-text-secondary mb-1">Best value</div>
          <div className="text-2xl font-bold text-tier-success">
            +{Math.max(...chartData.map((d) => d['Total SG'])).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-tier-text-secondary mb-1">Average</div>
          <div className="text-2xl font-bold text-tier-navy">
            {(chartData.reduce((sum, d) => sum + d['Total SG'], 0) / chartData.length).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-tier-text-secondary mb-1">Data points</div>
          <div className="text-2xl font-bold text-tier-navy">{chartData.length}</div>
        </div>
      </div>
    </div>
  );
};

export default StrokesGainedHistory;
