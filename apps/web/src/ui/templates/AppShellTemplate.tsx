import React, { lazy, Suspense } from 'react';
import { HelpCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import ThemeSwitcher from '../composites/ThemeSwitcher';
import { PageTitle } from '../../components/typography';

// DEV-only analytics debug overlay
const IS_DEV = process.env.NODE_ENV === 'development';
const AnalyticsDebug = IS_DEV
  ? lazy(() => import('../../analytics/AnalyticsDebug'))
  : null;

/**
 * AppShellTemplate
 * Main application layout container following TIER Golf design system
 * Provides mobile-first responsive layout with header, navigation, and content areas
 */

interface AppShellTemplateProps {
  /** Page title displayed in header */
  title?: string;
  /** Optional subtitle displayed below title */
  subtitle?: string;
  /** Optional help text displayed in tooltip */
  helpText?: string;
  /** Action buttons or controls displayed on the right side of header */
  actions?: React.ReactNode;
  /** Main content area */
  children: React.ReactNode;
  /** Bottom navigation (fixed at bottom on mobile) */
  bottomNav?: React.ReactNode;
  /** Show theme switcher in header (default: true) */
  showThemeSwitcher?: boolean;
  /** Additional className for customization */
  className?: string;
}

const AppShellTemplate: React.FC<AppShellTemplateProps> = ({
  title,
  subtitle,
  helpText,
  actions,
  children,
  bottomNav,
  showThemeSwitcher = true,
  className = '',
}) => {
  const hasHeader = title || subtitle || actions || showThemeSwitcher;

  return (
    <div className={`flex flex-col min-h-screen bg-tier-surface-subtle ${className}`}>
      {/* Header */}
      {hasHeader && (
        <header className="sticky top-0 z-40 bg-white border-b border-tier-border-subtle backdrop-blur-md">
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex-1 min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  <PageTitle className="text-2xl font-bold text-tier-navy m-0 leading-tight">
                    {title}
                  </PageTitle>
                  {helpText && (
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-5 h-5 p-0 border-none bg-transparent cursor-help text-tier-text-tertiary hover:text-tier-text-secondary transition-colors duration-200"
                          >
                            <HelpCircle size={16} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="max-w-[320px] px-4 py-3 bg-white border border-tier-border-default rounded-lg shadow-lg text-[13px] leading-relaxed text-tier-navy z-[9999]"
                            sideOffset={5}
                          >
                            {helpText}
                            <Tooltip.Arrow className="fill-tier-border-default" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  )}
                </div>
              )}
              {subtitle && (
                <p className="text-sm text-tier-text-secondary m-0 mt-1 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
            {(actions || showThemeSwitcher) && (
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {actions}
                {showThemeSwitcher && <ThemeSwitcher />}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main
        className="flex-1 w-full p-4"
        style={bottomNav ? { paddingBottom: 'calc(56px + var(--safe-area-inset-bottom) + 1rem)' } : undefined}
      >
        {children}
      </main>

      {/* Bottom Navigation (fixed at bottom on mobile) */}
      {bottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-tier-border-subtle z-[100]"
          style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
        >
          {bottomNav}
        </nav>
      )}

      {/* DEV-only analytics debug overlay */}
      {IS_DEV && AnalyticsDebug && (
        <Suspense fallback={null}>
          <AnalyticsDebug />
        </Suspense>
      )}
    </div>
  );
};

export default AppShellTemplate;
