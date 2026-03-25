/**
 * SG Journey View
 * Visual representation of player's position on path to PGA Elite
 */

import React from 'react';
import { Mountain, TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../../components/typography';

interface SGJourneyViewProps {
  data: any;
}

const SGJourneyView: React.FC<SGJourneyViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
        <TrendingUp size={64} className="mb-4 mx-auto text-tier-text-secondary" />
        <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Ingen SG Journey data</SubSectionTitle>
        <p className="text-tier-text-secondary">
          Trenger flere testresultater for å beregne din SG Journey.
        </p>
      </div>
    );
  }

  const { position, milestones, history, categoryBreakdown } = data;

  return (
    <div className="space-y-6">
      {/* Current Position Card */}
      <div className="bg-gradient-to-br from-tier-info-light to-white rounded-xl border border-tier-info p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mountain size={32} className="text-tier-info" />
          <div>
            <SectionTitle style={{ marginBottom: 0 }}>{position.currentLevel.nameno}</SectionTitle>
            <p className="text-tier-text-secondary">{position.currentLevel.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-sm text-tier-text-secondary mb-1">Nåværende SG</div>
            <div className="text-3xl font-bold text-tier-navy">
              {position.currentSG >= 0 ? '+' : ''}
              {position.currentSG.toFixed(2)}
            </div>
            <div className="text-xs text-tier-text-secondary mt-1">
              Estimert score: ~{position.estimatedScore}
            </div>
          </div>

          <div>
            <div className="text-sm text-tier-text-secondary mb-1">Til neste nivå</div>
            <div className="text-2xl font-bold text-tier-navy">
              {position.sgToNextLevel > 0 ? '+' : ''}
              {position.sgToNextLevel.toFixed(2)} SG
            </div>
            {position.estimatedDaysToNext && (
              <div className="text-xs text-tier-text-secondary mt-1">
                <Calendar size={12} className="inline mr-1" />
                ~{position.estimatedDaysToNext} dager
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar to Next Level */}
        {position.nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-tier-text-secondary">{position.currentLevel.nameno}</span>
              <span className="font-semibold text-tier-navy">{position.progressToNext}%</span>
              <span className="text-tier-text-secondary">{position.nextLevel.nameno}</span>
            </div>
            <div className="w-full h-4 bg-tier-surface-base rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-tier-info to-tier-success rounded-full transition-all duration-500"
                style={{ width: `${position.progressToNext}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle className="flex items-center gap-2">
            {position.trend30Days >= 0 ? (
              <TrendingUp className="text-tier-success" size={20} />
            ) : (
              <TrendingDown className="text-tier-error" size={20} />
            )}
            Trends
          </SubSectionTitle>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-tier-text-secondary">30 dager</span>
              <span
                className={`text-lg font-bold ${
                  position.trend30Days >= 0 ? 'text-tier-success' : 'text-tier-error'
                }`}
              >
                {position.trend30Days >= 0 ? '+' : ''}
                {position.trend30Days.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-tier-text-secondary">90 dager</span>
              <span
                className={`text-lg font-bold ${
                  position.trend90Days >= 0 ? 'text-tier-success' : 'text-tier-error'
                }`}
              >
                {position.trend90Days >= 0 ? '+' : ''}
                {position.trend90Days.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle>SG Fordeling</SubSectionTitle>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-tier-text-secondary">Approach</span>
                <span className="font-semibold text-tier-navy">
                  {categoryBreakdown.approach >= 0 ? '+' : ''}
                  {categoryBreakdown.approach.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-tier-surface-base rounded-full overflow-hidden">
                <div
                  className="h-full bg-category-approach rounded-full"
                  style={{
                    width: `${Math.min(100, Math.abs(categoryBreakdown.approach) * 20)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-tier-text-secondary">Around Green</span>
                <span className="font-semibold text-tier-navy">
                  {categoryBreakdown.aroundGreen >= 0 ? '+' : ''}
                  {categoryBreakdown.aroundGreen.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-tier-surface-base rounded-full overflow-hidden">
                <div
                  className="h-full bg-category-short-game rounded-full"
                  style={{
                    width: `${Math.min(100, Math.abs(categoryBreakdown.aroundGreen) * 20)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-tier-text-secondary">Putting</span>
                <span className="font-semibold text-tier-navy">
                  {categoryBreakdown.putting >= 0 ? '+' : ''}
                  {categoryBreakdown.putting.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-tier-surface-base rounded-full overflow-hidden">
                <div
                  className="h-full bg-category-putting rounded-full"
                  style={{
                    width: `${Math.min(100, Math.abs(categoryBreakdown.putting) * 20)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle className="flex items-center gap-2">
            <Award size={20} className="text-tier-warning" />
            Milepæler
          </SubSectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((milestone: any) => (
              <div
                key={milestone.id}
                className={`rounded-lg border p-4 ${
                  milestone.reached
                    ? 'border-tier-success bg-tier-success-light'
                    : 'border-tier-border-default bg-tier-surface-base'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-tier-navy">{milestone.name}</span>
                  {milestone.reached && <Award size={16} className="text-tier-success" />}
                </div>
                <div className="text-sm text-tier-text-secondary">
                  SG: {milestone.sg >= 0 ? '+' : ''}
                  {milestone.sg.toFixed(2)}
                </div>
                {milestone.reached && milestone.reachedAt && (
                  <div className="text-xs text-tier-success mt-1">
                    {new Date(milestone.reachedAt).toLocaleDateString('no-NO')}
                  </div>
                )}
                {milestone.xpAwarded > 0 && (
                  <div className="text-xs text-tier-info mt-1">+{milestone.xpAwarded} XP</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Chart Placeholder */}
      {history && history.length > 0 && (
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle>Historikk</SubSectionTitle>
          <div className="text-sm text-tier-text-secondary text-center py-8">
            SG historikk graf kommer her (krever chart library)
            <div className="mt-2 text-xs">
              {history.length} datapunkter tilgjengelig
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SGJourneyView;
