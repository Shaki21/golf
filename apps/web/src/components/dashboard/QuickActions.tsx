/**
 * ============================================================
 * QuickActions - Hurtighandlinger for dashboard
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Gir brukere rask tilgang til de mest brukte handlingene
 * direkte fra dashboard uten å navigere gjennom menyer.
 *
 * Brukes på:
 * - Spiller dashboard (logg økt, registrer test, se plan)
 * - Coach dashboard (ny økt, se spillere, ukesrapport)
 *
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';
import { SectionTitle } from '../typography/Headings';

export interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
  description?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActions({
  actions,
  title = 'Quick Actions',
  columns = 3,
  className,
}: QuickActionsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <section className={cn('mb-6', className)}>
      {title && (
        <SectionTitle className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wider mb-3" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          {title}
        </SectionTitle>
      )}
      <div className={cn('grid gap-3', gridCols[columns])}>
        {actions.map((action) => (
          <QuickActionButton key={action.href} action={action} />
        ))}
      </div>
    </section>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
}

function QuickActionButton({ action }: QuickActionButtonProps) {
  const isPrimary = action.variant === 'primary';
  const Icon = action.icon;

  return (
    <Link
      to={action.href}
      className={cn(
        'group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isPrimary
          ? [
              'bg-tier-gold text-tier-white',
              'hover:bg-tier-gold-dark hover:shadow-md',
              'focus-visible:ring-tier-gold',
              'shadow-sm',
            ]
          : [
              'bg-tier-surface-secondary text-tier-text-primary',
              'hover:bg-tier-surface-tertiary hover:shadow-sm',
              'border border-tier-border-subtle',
              'focus-visible:ring-tier-navy',
            ]
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg transition-transform',
          'group-hover:scale-105',
          isPrimary ? 'bg-tier-white/20' : 'bg-tier-surface-tertiary'
        )}
      >
        <Icon
          size={18}
          className={cn(isPrimary ? 'text-tier-white' : 'text-tier-text-secondary')}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="break-words leading-tight">{action.label}</div>
        {action.description && (
          <div
            className={cn(
              'text-xs font-normal break-words leading-tight mt-0.5',
              isPrimary ? 'text-tier-white/70' : 'text-tier-text-tertiary'
            )}
          >
            {action.description}
          </div>
        )}
      </div>
    </Link>
  );
}

// Kompakt versjon for sidebar eller mindre områder
interface QuickActionsCompactProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsCompact({ actions, className }: QuickActionsCompactProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const isPrimary = action.variant === 'primary';

        return (
          <Link
            key={action.href}
            to={action.href}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
              'transition-all duration-200',
              isPrimary
                ? 'bg-tier-gold text-tier-white hover:bg-tier-gold-dark'
                : 'bg-tier-surface-secondary text-tier-text-primary hover:bg-tier-surface-tertiary'
            )}
          >
            <Icon size={16} />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}

export default QuickActions;
