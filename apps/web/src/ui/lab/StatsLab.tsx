import React from 'react';
import StatsGridTemplate, { StatsItem } from '../templates/StatsGridTemplate';
import { PageTitle, SectionTitle } from '../../components/typography';

/**
 * StatsLab - Demo page for StatsGridTemplate
 * Shows examples with and without change indicators
 */
const StatsLab: React.FC = () => {
  // Example 1: Stats without change indicators (simple cards)
  const simpleStats: StatsItem[] = [
    {
      id: '1',
      label: 'Sessions',
      value: '12',
    },
    {
      id: '2',
      label: 'Hours',
      value: '18.5h',
      sublabel: 'This week',
    },
    {
      id: '3',
      label: 'Badges',
      value: '4',
    },
    {
      id: '4',
      label: 'Points',
      value: '850',
      sublabel: 'Total XP',
    },
  ];

  // Example 2: Stats with change indicators
  const statsWithChange: StatsItem[] = [
    {
      id: '1',
      label: 'Sessions',
      value: '12',
      change: {
        value: '5%',
        direction: 'up',
      },
    },
    {
      id: '2',
      label: 'Hours',
      value: '18.5h',
      sublabel: 'This week',
      change: {
        value: '2%',
        direction: 'up',
      },
    },
    {
      id: '3',
      label: 'Completed',
      value: '85%',
      change: {
        value: '3%',
        direction: 'down',
      },
    },
    {
      id: '4',
      label: 'Average',
      value: '92',
      change: {
        value: '0%',
        direction: 'neutral',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-subtle">
      <div className="max-w-[1536px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8 pb-4 border-b-2 border-tier-border-subtle">
          <PageTitle className="text-2xl font-bold text-tier-navy mb-2">
            StatsGridTemplate Demo
          </PageTitle>
          <p className="text-sm text-tier-text-secondary leading-relaxed">
            Unified template supporting both simple cards and cards with change indicators
          </p>
        </div>

        {/* Section 1: Simple Stats */}
        <section className="mb-10">
          <SectionTitle className="text-xl font-semibold text-tier-navy mb-2">
            Example 1: Simple Stats (without change indicators)
          </SectionTitle>
          <p className="text-sm text-tier-text-secondary mb-4 leading-relaxed">
            Basic stat cards without arrows or percentage change
          </p>
          <StatsGridTemplate items={simpleStats} />
        </section>

        {/* Section 2: Stats with Change */}
        <section className="mb-10">
          <SectionTitle className="text-xl font-semibold text-tier-navy mb-2">
            Example 2: Stats with change indicators
          </SectionTitle>
          <p className="text-sm text-tier-text-secondary mb-4 leading-relaxed">
            Stat cards with arrows and percentage change (up/down/neutral)
          </p>
          <StatsGridTemplate items={statsWithChange} />
        </section>

        {/* Section 3: Custom Columns */}
        <section className="mb-10">
          <SectionTitle className="text-xl font-semibold text-tier-navy mb-2">
            Example 3: With 2 columns
          </SectionTitle>
          <p className="text-sm text-tier-text-secondary mb-4 leading-relaxed">
            Grid with fixed number of columns (2)
          </p>
          <StatsGridTemplate items={statsWithChange} columns={2} />
        </section>

        {/* Section 4: Custom Columns */}
        <section className="mb-10">
          <SectionTitle className="text-xl font-semibold text-tier-navy mb-2">
            Example 4: With 4 columns
          </SectionTitle>
          <p className="text-sm text-tier-text-secondary mb-4 leading-relaxed">
            Grid with fixed number of columns (4)
          </p>
          <StatsGridTemplate items={simpleStats} columns={4} />
        </section>
      </div>
    </div>
  );
};

export default StatsLab;
