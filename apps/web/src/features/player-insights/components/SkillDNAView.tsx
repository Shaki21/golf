/**
 * Skill DNA View
 * Unique skill profile fingerprint with pro matches
 */

import React from 'react';
import { Dna, TrendingUp, TrendingDown, Minus, Users, Target } from 'lucide-react';
import { SubSectionTitle, CardTitle } from '../../../components/typography';

interface SkillDNAViewProps {
  data: any;
}

const SkillDNAView: React.FC<SkillDNAViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
        <Dna size={64} className="mb-4 mx-auto text-tier-text-secondary" />
        <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Ingen Skill DNA data</SubSectionTitle>
        <p className="text-tier-text-secondary">
          Trenger flere testresultater for å generere ditt ferdighetsprofil.
        </p>
      </div>
    );
  }

  const { dimensions, overallScore, balanceScore, strengths, weaknesses, proMatches, profileDate } = data;

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp size={14} className="text-tier-success" />;
    if (trend === 'declining') return <TrendingDown size={14} className="text-tier-error" />;
    return <Minus size={14} className="text-tier-text-secondary" />;
  };

  const dimensionsList = [
    { key: 'distance', label: 'Distanse', icon: 'D' },
    { key: 'speed', label: 'Hastighet', icon: 'S' },
    { key: 'accuracy', label: 'Presisjon', icon: 'P' },
    { key: 'shortGame', label: 'Kort spill', icon: 'K' },
    { key: 'putting', label: 'Putting', icon: 'Pu' },
    { key: 'physical', label: 'Fysikk', icon: 'F' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-tier-info-light to-white rounded-xl border border-tier-info p-6">
          <div className="flex items-center gap-3 mb-2">
            <Dna size={24} className="text-tier-info" />
            <div className="text-sm text-tier-text-secondary">Total score</div>
          </div>
          <div className="text-3xl font-bold text-tier-navy">{overallScore}/100</div>
        </div>

        <div className="bg-gradient-to-br from-tier-success-light to-white rounded-xl border border-tier-success p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target size={24} className="text-tier-success" />
            <div className="text-sm text-tier-text-secondary">Balanse</div>
          </div>
          <div className="text-3xl font-bold text-tier-navy">{balanceScore}/100</div>
          <div className="text-xs text-tier-text-secondary mt-1">
            {balanceScore > 80
              ? 'Svært balansert profil'
              : balanceScore > 60
              ? 'God balanse'
              : 'Ubalansert - fokuser på svakheter'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-2">Profil dato</div>
          <div className="text-lg font-semibold text-tier-navy">
            {new Date(profileDate).toLocaleDateString('no-NO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Skill Dimensions */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <Dna size={20} className="text-tier-info" />
          Ferdighetsdimensjoner
        </SubSectionTitle>

        <div className="space-y-4">
          {dimensionsList.map(({ key, label, icon }) => {
            const dimension = dimensions[key];
            if (!dimension) return null;

            return (
              <div key={key} className="border-b border-tier-border-default pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="font-semibold text-tier-navy">{dimension.nameNo || label}</div>
                      <div className="text-xs text-tier-text-secondary">
                        {dimension.rawValue} {dimension.unit}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getTrendIcon(dimension.trend)}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-tier-navy">{dimension.score}/100</div>
                      <div className="text-xs text-tier-text-secondary">
                        {dimension.percentile}% percentil
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-tier-surface-base rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-tier-info to-tier-success rounded-full transition-all"
                    style={{ width: `${dimension.score}%` }}
                  />
                </div>

                {/* Category Benchmark */}
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-tier-text-secondary">
                    Test nr: {dimension.testNumbers?.join(', ') || 'N/A'}
                  </span>
                  <span className="text-tier-navy">
                    {dimension.categoryBenchmark}% av kategorikrav
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-tier-success-light rounded-xl border border-tier-success p-6">
          <SubSectionTitle>Styrker</SubSectionTitle>
          {strengths && strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((strength: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-tier-navy">
                  <span className="text-tier-success">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-tier-text-secondary">Ingen styrker identifisert ennå</p>
          )}
        </div>

        <div className="bg-tier-warning-light rounded-xl border border-tier-warning p-6">
          <SubSectionTitle>Svakheter</SubSectionTitle>
          {weaknesses && weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {weaknesses.map((weakness: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-tier-navy">
                  <span className="text-tier-warning">→</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-tier-text-secondary">Ingen svakheter identifisert</p>
          )}
        </div>
      </div>

      {/* Pro Matches */}
      {proMatches && proMatches.length > 0 && (
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle className="flex items-center gap-2">
            <Users size={20} className="text-tier-info" />
            Du matcher disse proffspillerne
          </SubSectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proMatches.map((match: any, idx: number) => (
              <div
                key={idx}
                className="bg-tier-surface-base rounded-lg border border-tier-border-default p-4 hover:border-tier-info hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <CardTitle style={{ marginBottom: 0 }}>{match.proName}</CardTitle>
                    <div className="text-xs text-tier-text-secondary mt-1">{match.insight}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-tier-info">{match.similarity}%</div>
                    <div className="text-xs text-tier-text-secondary">likhet</div>
                  </div>
                </div>

                {match.commonStrengths && match.commonStrengths.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-tier-success mb-1">
                      Felles styrker:
                    </div>
                    <div className="text-xs text-tier-text-secondary">
                      {match.commonStrengths.join(', ')}
                    </div>
                  </div>
                )}

                {match.developmentAreas && match.developmentAreas.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-tier-warning mb-1">
                      Utviklingsområder:
                    </div>
                    <div className="text-xs text-tier-text-secondary">
                      {match.developmentAreas.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNA Visualization Placeholder */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle>DNA Visualisering</SubSectionTitle>
        <div className="text-sm text-tier-text-secondary text-center py-12">
          Radar chart / spider diagram kommer her (krever chart library)
          <div className="mt-2 text-xs">6-dimensjonal visualisering av ditt ferdighetsprofil</div>
        </div>
      </div>
    </div>
  );
};

export default SkillDNAView;
