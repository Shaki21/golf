/**
 * TIER Golf - Authentication Page Layout
 *
 * Centered layout for login, register, and password reset pages.
 * Features TIER Golf branding and styling using semantic tokens.
 */

import React from 'react';
import { PageTitle } from '../typography';

export default function AuthPageLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen flex-col bg-ak-surface-base dark:bg-ak-surface-dark-base">
      {/* Header */}
      <header className="flex justify-center py-8">
        <div className="flex items-center gap-3">
          <img
            src="/assets/tier-golf/tier-golf-icon.svg"
            alt="TIER Golf"
            className="h-12 w-12"
          />
          <div>
            <p className="text-lg font-semibold text-ak-text-primary dark:text-ak-text-inverse">
              TIER Golf
            </p>
            <p className="text-sm text-ak-text-muted">
              Individuell Utviklingsplan
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl bg-ak-surface-card p-8 shadow-ak-md dark:bg-ak-surface-dark-card">
            {/* Title */}
            {title && (
              <div className="mb-6 text-center">
                <PageTitle className="text-2xl font-bold text-ak-text-primary dark:text-ak-text-inverse">
                  {title}
                </PageTitle>
                {subtitle && (
                  <p className="mt-2 text-sm text-ak-text-muted">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Form content */}
            {children}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-ak-text-muted">
            © {new Date().getFullYear()} TIER Golf. Alle rettigheter reservert.
          </p>
        </div>
      </main>
    </div>
  );
}
