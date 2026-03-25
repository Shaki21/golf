/**
 * ============================================================
 * CoachHubPage - TIER Golf Design System v1.0
 * ============================================================
 *
 * Reusable hub page layout for coach module showing sections
 * with navigation links. Used as landing page for each main area.
 *
 * MIGRATED TO TIER DESIGN SYSTEM:
 * - Uses PageHeader.raw for consistent header
 * - Uses PageContainer for content
 * - Zero hardcoded colors - all TIER tokens
 * - Zero inline styles - all Tailwind classes
 * - Full-width header with 1200px content
 *
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import type { CoachNavArea, CoachNavSection } from '../../config/coach-navigation-v3';
import { coachAreaTabsConfig } from '../../config/coach-navigation-v3';
import { navigationColors } from '../../config/navigation-tokens';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { AreaTabs } from '../navigation/AreaTabs';
import { SubSectionTitle } from '../typography/Headings';

const { ChevronRight } = LucideIcons;

const getIcon = (iconName: string): React.ComponentType<{ size?: number; className?: string }> => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
  return icons[iconName] || LucideIcons.Circle;
};

interface CoachHubPageProps {
  area: CoachNavArea;
  title?: string;
  subtitle?: string;
  helpText?: string;
  quickStats?: Array<{
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
  }>;
  featuredAction?: {
    label: string;
    href: string;
    icon?: string;
    variant?: 'primary' | 'secondary';
  };
  /** Show area tabs for quick navigation to sub-pages */
  showTabs?: boolean;
  /** Custom children to render instead of default sections grid */
  children?: React.ReactNode;
}

export default function CoachHubPage({
  area,
  title,
  subtitle,
  helpText,
  quickStats,
  featuredAction,
  showTabs = true,
  children,
}: CoachHubPageProps) {
  // Map area.id to navigationColors key (coach areas use different keys)
  const colorKey = mapAreaIdToColorKey(area.id);
  const colors = navigationColors[colorKey] || navigationColors.dashboard;
  const AreaIcon = getIcon(area.icon);

  // Get tabs for this area (if any)
  const tabs = coachAreaTabsConfig[area.id as keyof typeof coachAreaTabsConfig] || [];

  // Map area color to AreaTabs color prop
  const tabColor = area.color as 'green' | 'blue' | 'amber' | 'purple' | 'default';

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* TIER-compliant PageHeader */}
      <PageHeader
        title={title || area.label}
        subtitle={subtitle}
        helpText={helpText}
      />

      {/* Hero Section with Quick Stats */}
      <PageContainer paddingY="lg" background="base">
        {/* Area Tabs for quick navigation */}
        {showTabs && tabs.length > 0 && (
          <AreaTabs tabs={tabs} color={tabColor} className="mb-6" />
        )}

        {/* Hero Card */}
        <div
          className="bg-gradient-to-br from-tier-white to-tier-surface-subtle rounded-2xl p-6 md:p-8 mb-8 border border-tier-border-default shadow-sm"
        >
          {/* Icon + Title Row */}
          <div className="flex items-center gap-4 mb-6">
            <span
              className="w-14 h-14 rounded-xl flex items-center justify-center text-tier-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}CC 100%)`
              }}
            >
              <AreaIcon size={28} />
            </span>
            <div className="flex-1">
              <div className="text-2xl md:text-3xl font-bold text-tier-navy leading-tight" aria-hidden="true">
                {title || area.label}
              </div>
              {subtitle && (
                <p className="text-tier-body text-tier-text-secondary mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          {quickStats && quickStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {quickStats.map((stat, index) => {
                const StatIcon = stat.icon ? getIcon(stat.icon) : null;
                const statColor = stat.color || colors.primary;
                return (
                  <div
                    key={index}
                    className="bg-tier-white rounded-xl p-5 border border-tier-border-subtle shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {StatIcon && (
                        <span
                          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${statColor}12`,
                            color: statColor
                          }}
                        >
                          <StatIcon size={22} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-2xl font-bold leading-tight tracking-tight"
                          style={{ color: statColor }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-tier-footnote text-tier-text-secondary mt-0.5 truncate">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Featured Action */}
          {featuredAction && (
            <Link
              to={featuredAction.href}
              className={`
                inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl
                text-tier-body font-semibold transition-all
                ${featuredAction.variant === 'secondary'
                  ? 'bg-tier-white border-2 hover:bg-tier-surface-subtle'
                  : 'bg-tier-navy text-tier-white hover:bg-tier-navy-dark shadow-md'
                }
              `.trim()}
              style={featuredAction.variant === 'secondary' ? {
                borderColor: colors.primary,
                color: colors.primary
              } : undefined}
            >
              {featuredAction.icon && React.createElement(getIcon(featuredAction.icon), { size: 18 })}
              {featuredAction.label}
            </Link>
          )}
        </div>

        {/* Custom children or Sections Grid */}
        {children ? (
          children
        ) : (
          area.sections && area.sections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {area.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  colors={colors}
                />
              ))}
            </div>
          )
        )}
      </PageContainer>
    </div>
  );
}

// Map coach area IDs to navigation color keys
function mapAreaIdToColorKey(areaId: string): keyof typeof navigationColors {
  const mapping: Record<string, keyof typeof navigationColors> = {
    'hjem': 'dashboard',
    'spillere': 'trening',      // Green - like training
    'analyse': 'utvikling',     // Blue - like development
    'plan': 'plan',             // Amber
    'mer': 'mer',               // Purple
  };
  return mapping[areaId] || 'dashboard';
}

type ColorScheme = (typeof navigationColors)[keyof typeof navigationColors];

interface SectionCardProps {
  section: CoachNavSection;
  colors: ColorScheme;
}

function SectionCard({ section, colors }: SectionCardProps) {
  return (
    <div className="bg-tier-white rounded-2xl border border-tier-border-default overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Section Header */}
      <div
        className="px-5 py-4 border-b border-tier-border-subtle"
        style={{ backgroundColor: colors.surface }}
      >
        <SubSectionTitle
          className="text-tier-footnote font-semibold uppercase tracking-wide m-0"
          style={{ color: colors.text, marginBottom: 0 }}
        >
          {section.label}
        </SubSectionTitle>
      </div>

      {/* Section Items */}
      <div className="p-2">
        {section.items.map((item) => {
          const ItemIcon = item.icon ? getIcon(item.icon) : null;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
            >
              {ItemIcon && (
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                  }}
                >
                  <ItemIcon size={18} />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-tier-body font-medium text-tier-navy group-hover:text-tier-navy-dark transition-colors">
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-tier-footnote text-tier-text-secondary mt-0.5 line-clamp-1">
                    {item.description}
                  </div>
                )}
              </div>
              <ChevronRight size={16} className="text-tier-text-tertiary shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
