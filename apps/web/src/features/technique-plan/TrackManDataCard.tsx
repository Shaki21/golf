/**
 * TrackMan Data Card
 * Displays variation and consistency metrics for player's TrackMan data
 */

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/shadcn';

interface TrackManReference {
  parameter: string;
  parameterLabel: string;
  targetValue: number;
  tolerance: number;
  unit: string;
}

interface TrackManShot {
  [key: string]: number;
}

interface TrackManDataCardProps {
  trackManData?: {
    shots: TrackManShot[];
    referenceValues: TrackManReference[];
    uploadedAt?: string;
  };
}

interface ParameterStats {
  parameter: string;
  label: string;
  target: number;
  tolerance: number;
  unit: string;
  maxDeviation: number;
  minDeviation: number;
  range: number;
  shotsInTolerance: number;
  totalShots: number;
  consistencyPercentage: number;
}

export default function TrackManDataCard({ trackManData }: TrackManDataCardProps) {
  if (!trackManData || !trackManData.shots || trackManData.shots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-tier-navy" />
            TrackMan Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-tier-text-tertiary mx-auto mb-3" />
            <p className="text-sm text-tier-text-secondary mb-2">No TrackMan data uploaded</p>
            <p className="text-xs text-tier-text-tertiary">
              Upload data from the TrackMan tab to see deviations and consistency
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { shots, referenceValues } = trackManData;

  // Calculate statistics for each parameter
  const parameterStats: ParameterStats[] = referenceValues.map(ref => {
    const paramKey = ref.parameter;
    const values = shots.map(shot => shot[paramKey]).filter(val => val !== undefined && val !== null);

    if (values.length === 0) {
      return {
        parameter: ref.parameter,
        label: ref.parameterLabel,
        target: ref.targetValue,
        tolerance: ref.tolerance,
        unit: ref.unit,
        maxDeviation: 0,
        minDeviation: 0,
        range: 0,
        shotsInTolerance: 0,
        totalShots: 0,
        consistencyPercentage: 0,
      };
    }

    // Calculate deviations from target
    const deviations = values.map(val => val - ref.targetValue);
    const maxDeviation = Math.max(...deviations);
    const minDeviation = Math.min(...deviations);
    const range = maxDeviation - minDeviation;

    // Count shots within tolerance
    const shotsInTolerance = deviations.filter(
      dev => Math.abs(dev) <= ref.tolerance
    ).length;

    const consistencyPercentage = (shotsInTolerance / values.length) * 100;

    return {
      parameter: ref.parameter,
      label: ref.parameterLabel,
      target: ref.targetValue,
      tolerance: ref.tolerance,
      unit: ref.unit,
      maxDeviation,
      minDeviation,
      range,
      shotsInTolerance,
      totalShots: values.length,
      consistencyPercentage,
    };
  });

  // Find parameter with largest variation
  const largestVariation = parameterStats.reduce((max, stat) =>
    stat.range > max.range ? stat : max
  , parameterStats[0]);

  // Calculate overall consistency
  const overallConsistency = parameterStats.reduce((sum, stat) =>
    sum + stat.consistencyPercentage, 0
  ) / parameterStats.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-5 h-5 text-tier-navy" />
          TrackMan Analysis
        </CardTitle>
        <p className="text-xs text-tier-text-secondary mt-1">
          Based on {shots.length} swings
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Consistency */}
        <div className="p-3 bg-tier-surface-card rounded-lg border border-tier-border-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-tier-text-secondary">Overall consistency</span>
            <span className="text-xl font-bold text-tier-navy">
              {overallConsistency.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-tier-surface-base rounded-full h-2">
            <div
              className="bg-status-success h-2 rounded-full transition-all"
              style={{ width: `${overallConsistency}%` }}
            />
          </div>
          <p className="text-xs text-tier-text-tertiary mt-1">
            Swings within tolerance
          </p>
        </div>

        {/* Largest Variation */}
        {largestVariation && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-900">Largest variation</span>
            </div>
            <p className="text-sm font-medium text-tier-navy mb-1">
              {largestVariation.label}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-3 h-3" />
                <span className="font-medium">
                  {largestVariation.minDeviation > 0 ? '+' : ''}{largestVariation.minDeviation.toFixed(1)}{largestVariation.unit}
                </span>
              </div>
              <span className="text-tier-text-tertiary">to</span>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="font-medium">
                  {largestVariation.maxDeviation > 0 ? '+' : ''}{largestVariation.maxDeviation.toFixed(1)}{largestVariation.unit}
                </span>
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Spread: {largestVariation.range.toFixed(1)}{largestVariation.unit}
            </p>
          </div>
        )}

        {/* Parameter Details */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
            Details per parameter
          </h4>
          {parameterStats.map(stat => (
            <div
              key={stat.parameter}
              className="p-2 bg-tier-surface-base rounded border border-tier-border-default"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-tier-navy">
                  {stat.label}
                </span>
                <span className="text-xs font-semibold text-status-success">
                  {stat.consistencyPercentage.toFixed(0)}%
                </span>
              </div>

              {/* Visual deviation indicator */}
              <div className="relative h-6 bg-tier-surface-card rounded mb-1">
                {/* Target line (center) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-tier-navy" />

                {/* Tolerance zone */}
                <div
                  className="absolute top-0 bottom-0 bg-green-100"
                  style={{
                    left: `calc(50% - ${(stat.tolerance / (Math.abs(stat.minDeviation) + Math.abs(stat.maxDeviation))) * 50}%)`,
                    right: `calc(50% - ${(stat.tolerance / (Math.abs(stat.minDeviation) + Math.abs(stat.maxDeviation))) * 50}%)`,
                  }}
                />

                {/* Min deviation marker */}
                {stat.minDeviation !== 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-red-500 rounded"
                    style={{
                      left: stat.minDeviation < 0
                        ? `${50 - (Math.abs(stat.minDeviation) / (Math.abs(stat.minDeviation) + Math.abs(stat.maxDeviation))) * 50}%`
                        : '50%',
                    }}
                  />
                )}

                {/* Max deviation marker */}
                {stat.maxDeviation !== 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-green-500 rounded"
                    style={{
                      right: stat.maxDeviation > 0
                        ? `${50 - (Math.abs(stat.maxDeviation) / (Math.abs(stat.minDeviation) + Math.abs(stat.maxDeviation))) * 50}%`
                        : '50%',
                    }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-red-600">
                  {stat.minDeviation > 0 ? '+' : ''}{stat.minDeviation.toFixed(1)}
                </span>
                <span className="text-tier-text-tertiary">
                  {stat.shotsInTolerance}/{stat.totalShots} within
                </span>
                <span className="text-green-600">
                  {stat.maxDeviation > 0 ? '+' : ''}{stat.maxDeviation.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="pt-3 border-t border-tier-border-default">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-tier-surface-base rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3 h-3 text-tier-navy" />
                <span className="text-xs text-tier-text-secondary">Total swings</span>
              </div>
              <p className="text-lg font-bold text-tier-navy">{shots.length}</p>
            </div>
            <div className="text-center p-2 bg-tier-surface-base rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="w-3 h-3 text-tier-navy" />
                <span className="text-xs text-tier-text-secondary">Parameters</span>
              </div>
              <p className="text-lg font-bold text-tier-navy">{parameterStats.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
