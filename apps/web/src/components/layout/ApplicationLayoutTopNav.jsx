/**
 * ApplicationLayoutTopNav
 *
 * App layout with top navigation bar.
 * Alternative to the side rail layout (ApplicationLayoutV2).
 *
 * Uses semantic color tokens from design-system.
 */

import React from 'react';
import DashboardHeader from './DashboardHeader';
import BackToTop from '../ui/BackToTop';
import { PageTitle } from '../typography';
import BottomNav from '../../ui/composites/BottomNav';

export default function ApplicationLayoutTopNav({ children, title, subtitle, actions }) {
  return (
    <div className="min-h-full flex flex-col bg-[var(--background-default)]">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-[var(--accent)] focus:text-[var(--text-inverse)] focus:px-4 focus:py-2 focus:rounded-md focus:m-2"
      >
        Hopp til hovedinnhold
      </a>

      {/* Top Navigation - Premium header with flyout menus */}
      <DashboardHeader />

      {/* Page Header */}
      {(title || subtitle || actions) && (
        <header className="bg-[var(--background-white)] shadow-sm border-b border-[var(--border-subtle)]">
          <div className="px-4 py-6 sm:px-6 lg:px-12 xl:px-16">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                {title && (
                  <PageTitle className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    {title}
                  </PageTitle>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1" tabIndex="-1">
        {/* Extra bottom padding on mobile to account for BottomNav */}
        <div className="px-4 py-6 sm:px-6 lg:px-12 xl:px-16 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Footer - hidden on mobile where BottomNav is shown */}
      <footer className="hidden md:block bg-[var(--background-white)] border-t border-[var(--border-subtle)]">
        <div className="px-4 py-4 sm:px-6 lg:px-12 xl:px-16">
          <p className="text-center text-sm text-[var(--text-tertiary)]">
            TIER Golf IUP
          </p>
        </div>
      </footer>

      {/* Bottom Navigation - 4+1 burger menu (mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      <BackToTop />
    </div>
  );
}
