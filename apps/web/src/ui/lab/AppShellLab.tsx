import React, { useState } from 'react';
import AppShellTemplate from '../templates/AppShellTemplate';
import StatsGridTemplate, { StatsItem } from '../templates/StatsGridTemplate';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

/**
 * AppShellLab - Demo page for AppShellTemplate
 * Shows examples with and without actions
 */
const AppShellLab: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'with-actions' | 'without-actions'>('with-actions');

  // Sample stats for placeholder content
  const sampleStats: StatsItem[] = [
    { id: '1', label: 'Sessions', value: '12', sublabel: 'This month' },
    { id: '2', label: 'Hours', value: '18.5h', sublabel: 'Total training time' },
    { id: '3', label: 'Badges', value: '4', sublabel: 'Earned' },
    { id: '4', label: 'Points', value: '850', sublabel: 'Total XP' },
  ];

  // Sample bottom navigation
  const bottomNavContent = (
    <div className="flex justify-around py-2">
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Home</span>
        <span className="text-[9px] text-tier-text-secondary">Home</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Stats</span>
        <span className="text-[9px] text-tier-text-secondary">Statistics</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Trophy</span>
        <span className="text-[9px] text-tier-text-secondary">Badges</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Cog</span>
        <span className="text-[9px] text-tier-text-secondary">Settings</span>
      </button>
    </div>
  );

  // Sample action buttons
  const actionButtons = (
    <>
      <button className="py-2 px-3 bg-tier-gold text-white border-none rounded-lg text-[11px] font-semibold cursor-pointer">
        New session
      </button>
      <button className="w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-lg">
        Bell
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Demo Selector */}
      <div className="flex gap-2 mb-4 justify-center">
        <button
          className={`py-2 px-4 border rounded-lg cursor-pointer text-sm transition-all ${
            activeDemo === 'with-actions'
              ? 'bg-tier-gold text-white border-tier-gold'
              : 'bg-transparent text-white/70 border-white/20'
          }`}
          onClick={() => setActiveDemo('with-actions')}
        >
          With actions
        </button>
        <button
          className={`py-2 px-4 border rounded-lg cursor-pointer text-sm transition-all ${
            activeDemo === 'without-actions'
              ? 'bg-tier-gold text-white border-tier-gold'
              : 'bg-transparent text-white/70 border-white/20'
          }`}
          onClick={() => setActiveDemo('without-actions')}
        >
          Without actions
        </button>
      </div>

      {/* Demo Container */}
      <div className="max-w-[480px] mx-auto rounded-xl overflow-hidden shadow-2xl h-[700px] relative">
        {activeDemo === 'with-actions' ? (
          <AppShellTemplate
            title="Dashboard"
            subtitle="Welcome back, Anders"
            actions={actionButtons}
            bottomNav={bottomNavContent}
          >
            <div className="mb-6">
              <SectionTitle className="text-lg font-semibold text-tier-navy mb-3">
                Your statistics
              </SectionTitle>
              <StatsGridTemplate items={sampleStats} />
            </div>

            <div className="mb-6">
              <SectionTitle className="text-lg font-semibold text-tier-navy mb-3">
                Recent activity
              </SectionTitle>
              <div className="bg-tier-surface-subtle rounded-lg p-6 text-center text-tier-text-tertiary border border-dashed border-tier-border-subtle">
                Placeholder for activity list
              </div>
            </div>
          </AppShellTemplate>
        ) : (
          <AppShellTemplate
            title="Settings"
            bottomNav={bottomNavContent}
          >
            <div className="mb-6">
              <SectionTitle className="text-lg font-semibold text-tier-navy mb-3">
                Account settings
              </SectionTitle>
              <div className="bg-tier-surface-subtle rounded-lg p-6 text-center text-tier-text-tertiary border border-dashed border-tier-border-subtle">
                Placeholder for settings form
              </div>
            </div>

            <div className="mb-6">
              <SectionTitle className="text-lg font-semibold text-tier-navy mb-3">
                Notifications
              </SectionTitle>
              <div className="bg-tier-surface-subtle rounded-lg p-6 text-center text-tier-text-tertiary border border-dashed border-tier-border-subtle">
                Placeholder for notification settings
              </div>
            </div>
          </AppShellTemplate>
        )}
      </div>

      {/* Info Panel */}
      <div className="max-w-[480px] mx-auto mt-6 p-4 bg-white/5 rounded-lg text-white/80">
        <SubSectionTitle className="text-lg font-semibold mb-3 text-white">
          AppShellTemplate Props
        </SubSectionTitle>
        <ul className="list-none p-0 m-0 text-[11px] leading-loose">
          <li><code>title?: string</code> - Page title in header</li>
          <li><code>subtitle?: string</code> - Subtitle (optional)</li>
          <li><code>actions?: ReactNode</code> - Action buttons right side</li>
          <li><code>children: ReactNode</code> - Main content</li>
          <li><code>bottomNav?: ReactNode</code> - Bottom navigation (fixed)</li>
          <li><code>className?: string</code> - Extra CSS class</li>
        </ul>
      </div>
    </div>
  );
};

export default AppShellLab;
