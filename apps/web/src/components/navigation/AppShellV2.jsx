/**
 * AppShellV2
 *
 * Main application layout with Left Rail + Flyout navigation.
 * Replaces the previous full-width sidebar implementation.
 *
 * Layout:
 * - Desktop (>= 1024px): Rail (64px) + content (flex)
 * - Mobile (< 1024px): Header (60px) + content + drawer
 *
 * Features:
 * - Semantic token-based styling
 * - Responsive design
 * - Accessibility (skip links, ARIA)
 * - Dark mode support via CSS variables
 */
import React, { useState, useEffect } from 'react';
import { NavigationProvider } from './NavigationContext';
import SideNavigationDesktop from './SideNavigationDesktop';
import SideNavigationMobile from './SideNavigationMobile';
import BackToTop from '../ui/BackToTop';
import { SectionTitle } from '../typography';
import './AppShellV2.css';

export default function AppShellV2({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) {
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);

  return (
    <NavigationProvider>
      <div className={`app-shell-v2 ${className}`}>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className={`app-shell-v2__skip-link ${skipLinkFocused ? 'app-shell-v2__skip-link--focused' : ''}`}
          onFocus={() => setSkipLinkFocused(true)}
          onBlur={() => setSkipLinkFocused(false)}
        >
          Hopp til hovedinnhold
        </a>

        {/* Desktop Navigation */}
        <SideNavigationDesktop />

        {/* Mobile Navigation */}
        <SideNavigationMobile />

        {/* Main Content Area */}
        <div className="app-shell-v2__wrapper">
          {/* Optional Page Header */}
          {(title || subtitle || actions) && (
            <header className="app-shell-v2__header">
              <div className="app-shell-v2__header-content">
                <div className="app-shell-v2__header-titles">
                  {title && <SectionTitle className="app-shell-v2__title">{title}</SectionTitle>}
                  {subtitle && <p className="app-shell-v2__subtitle">{subtitle}</p>}
                </div>
                {actions && (
                  <div className="app-shell-v2__header-actions">{actions}</div>
                )}
              </div>
            </header>
          )}

          {/* Main Content */}
          <main
            id="main-content"
            className="app-shell-v2__main"
            tabIndex="-1"
          >
            <div className="app-shell-v2__content">
              {children}
            </div>
          </main>
        </div>

        <BackToTop />
      </div>
    </NavigationProvider>
  );
}
