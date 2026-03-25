/**
 * PageHeader Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * REGEL: Denne komponenten renderer sidens <h1> via PageTitle.
 * Bruk ikke <h1> andre steder på siden.
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { PageTitle } from '../typography';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/tooltip';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  helpText?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  helpText,
  actions,
  className = ''
}) => {
  return (
    <header
      className={className}
      style={{
        backgroundColor: 'var(--tier-surface-card)',
        borderBottom: '1px solid var(--tier-border-default)',
        borderRadius: '14px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        marginBottom: '8px',
      }}
    >
      <div style={{
        width: '100%',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <PageTitle
            subtitle={subtitle}
            style={{
              // Override default PageTitle styles for header context
            }}
          >
            {title}
          </PageTitle>
          {helpText && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--tier-text-tertiary)',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--tier-navy)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--tier-text-tertiary)';
                    }}
                    aria-label="Hjelp"
                  >
                    <HelpCircle size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  style={{ maxWidth: '320px' }}
                >
                  <p style={{ margin: 0, fontSize: '14px' }}>{helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
