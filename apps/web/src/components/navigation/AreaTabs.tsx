/**
 * ============================================================
 * AreaTabs - Horisontale kontekst-tabs for navigasjonsområder
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Brukes på hub-sider for å gi rask tilgang til undersider
 * uten å måtte bruke sidebar-menyen.
 *
 * Fordeler:
 * - Reduserer klikk fra 2 til 1
 * - Tydelig visuell kontekst for hvor brukeren er
 * - Responsiv - scroller horisontalt på mobil
 *
 * ============================================================
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';

type AreaColor = 'green' | 'blue' | 'amber' | 'purple' | 'default';

interface TabItem {
  href: string;
  label: string;
  icon?: string;
}

interface AreaTabsProps {
  tabs: TabItem[];
  color?: AreaColor;
  className?: string;
}

// Fargeklasser for aktiv tab basert på område
const activeColorClasses: Record<AreaColor, string> = {
  green: 'border-status-success text-status-success',
  blue: 'border-status-info text-status-info',
  amber: 'border-status-warning text-status-warning',
  purple: 'border-category-j text-category-j',
  default: 'border-tier-navy text-tier-navy',
};

// Bakgrunnsfarge for aktiv tab (subtil)
const activeBgClasses: Record<AreaColor, string> = {
  green: 'bg-status-success/5',
  blue: 'bg-status-info/5',
  amber: 'bg-status-warning/5',
  purple: 'bg-category-j/5',
  default: 'bg-tier-navy/5',
};

// Helper for å hente ikon fra string
const getIcon = (iconName: string): React.ComponentType<{ size?: number }> | null => {
  if (!iconName) return null;
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
  return icons[iconName] || null;
};

export function AreaTabs({ tabs, color = 'default', className }: AreaTabsProps) {
  const location = useLocation();

  // Sjekk om en tab er aktiv (eksakt match eller starter med href)
  const isTabActive = (href: string): boolean => {
    // Eksakt match for hub-siden
    if (location.pathname === href) return true;

    // For undersider, sjekk om path starter med href (men ikke for root-paths)
    if (href !== '/' && location.pathname.startsWith(href + '/')) return true;

    return false;
  };

  return (
    <nav
      className={cn(
        'flex gap-1 border-b border-tier-border-subtle mb-6',
        'overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0',
        className
      )}
      role="tablist"
      aria-label="Undersider"
    >
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.href);
        const Icon = tab.icon ? getIcon(tab.icon) : null;

        return (
          <Link
            key={tab.href}
            to={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap',
              'border-b-2 -mb-[1px] transition-all duration-200',
              'hover:text-tier-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-tier-gold/50',
              'rounded-t-lg',
              isActive
                ? cn(activeColorClasses[color], activeBgClasses[color])
                : 'border-transparent text-tier-text-secondary hover:bg-tier-surface-secondary/50'
            )}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Pre-definerte tabs for hvert område (eksportert for gjenbruk)
export const areaTabs = {
  trening: [
    { href: '/trening', label: 'Oversikt', icon: 'LayoutDashboard' },
    { href: '/trening/logg', label: 'Logg økt', icon: 'Plus' },
    { href: '/trening/dagbok', label: 'Historikk', icon: 'History' },
    { href: '/trening/ovelser', label: 'Øvelser', icon: 'Dumbbell' },
    { href: '/trening/testing', label: 'Testing', icon: 'Target' },
  ],
  utvikling: [
    { href: '/utvikling', label: 'Oversikt', icon: 'LayoutDashboard' },
    { href: '/utvikling/statistikk', label: 'Statistikk', icon: 'BarChart3' },
    { href: '/utvikling/testresultater', label: 'Testresultater', icon: 'ClipboardList' },
    { href: '/utvikling/badges', label: 'Merker', icon: 'Award' },
  ],
  plan: [
    { href: '/plan', label: 'Oversikt', icon: 'LayoutDashboard' },
    { href: '/plan/kalender', label: 'Kalender', icon: 'Calendar' },
    { href: '/plan/maal', label: 'Mål', icon: 'Target' },
    { href: '/plan/turneringer', label: 'Turneringer', icon: 'Trophy' },
  ],
  mer: [
    { href: '/mer', label: 'Oversikt', icon: 'LayoutDashboard' },
    { href: '/mer/profil', label: 'Profil', icon: 'User' },
    { href: '/mer/meldinger', label: 'Meldinger', icon: 'MessageSquare' },
    { href: '/mer/innstillinger', label: 'Innstillinger', icon: 'Settings' },
  ],
};

export default AreaTabs;
