'use client'

/**
 * ApplicationLayoutV2 - Left Rail + Flyout Navigation
 *
 * Premium navigation with minimal visual footprint.
 * Desktop: 64px rail + on-demand 240px flyout
 * Mobile: 60px header + drawer
 *
 * Uses semantic color tokens from design-system.
 */

import React from 'react'
import { NavigationProvider } from '../navigation/NavigationContext'
import SideNavigationDesktop from '../navigation/SideNavigationDesktop'
import SideNavigationMobile from '../navigation/SideNavigationMobile'
import BackToTop from '../ui/BackToTop'
import { PageTitle } from '../typography'
import './ApplicationLayoutV2.css'

export default function ApplicationLayoutV2({ children, title, subtitle, actions }) {
  return (
    <NavigationProvider>
      <div className="app-layout-v2">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="app-layout-v2__skip-link">
          Hopp til hovedinnhold
        </a>

        {/* Desktop Navigation (>= 1024px) */}
        <SideNavigationDesktop />

        {/* Mobile Navigation (< 1024px) */}
        <SideNavigationMobile />

        {/* Main Content Area */}
        <div className="app-layout-v2__wrapper">
          {/* Optional Page Header */}
          {(title || subtitle || actions) && (
            <header className="app-layout-v2__header">
              <div className="app-layout-v2__header-content">
                <div className="app-layout-v2__header-titles">
                  {title && <PageTitle className="app-layout-v2__title">{title}</PageTitle>}
                  {subtitle && <p className="app-layout-v2__subtitle">{subtitle}</p>}
                </div>
                {actions && (
                  <div className="app-layout-v2__header-actions">{actions}</div>
                )}
              </div>
            </header>
          )}

          {/* Main Content */}
          <main id="main-content" className="app-layout-v2__main" tabIndex="-1">
            <div className="app-layout-v2__content">
              {children}
            </div>
          </main>
        </div>

        <BackToTop />
      </div>
    </NavigationProvider>
  )
}
