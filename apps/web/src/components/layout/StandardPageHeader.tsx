/**
 * StandardPageHeader
 *
 * Konsistent page header for alle sider i TIER Golf.
 * Følger Design System v3.0 - Premium Light.
 *
 * Format: [Ikon] Tittel
 *         Undertekst/beskrivelse
 *
 * Eksempel:
 * <StandardPageHeader
 *   icon={BookOpen}
 *   title="Treningsdagbok"
 *   subtitle="Oversikt over dine fullførte økter"
 *   actions={<Button>Ny økt</Button>}
 * />
 */

import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/tooltip';
import { PageTitle } from '../typography/Headings';

interface StandardPageHeaderProps {
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional help text shown in tooltip */
  helpText?: string;
  /** Action buttons (right side) */
  actions?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  helpText,
  actions,
  className = '',
}) => {
  return (
    <header className={`mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Title + Subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-ak-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-ak-primary" />
              </div>
            )}
            <PageTitle className="text-2xl font-bold text-ak-text-primary m-0 leading-tight" style={{ marginBottom: 0 }}>
              {title}
            </PageTitle>
            {helpText && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex-shrink-0 text-ak-text-secondary hover:text-ak-primary transition-colors duration-150"
                      aria-label="Hjelp"
                    >
                      <HelpCircle size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-sm">
                    <p>{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-ak-text-secondary m-0 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default StandardPageHeader;
