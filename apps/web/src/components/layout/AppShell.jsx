import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BackToTop from '../ui/BackToTop';
import { PageTitle } from '../typography';

/**
 * AppShell - Main application layout
 *
 * Uses AppShellTemplate foundation for consistent styling across all pages.
 * Combines sidebar navigation with standardized content area.
 */

export default function AppShell({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) {
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasHeader = title || subtitle || actions;

  return (
    <div style={styles.shell} className={className}>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        style={skipLinkFocused ? styles.skipLinkFocus : styles.skipLink}
        onFocus={() => setSkipLinkFocused(true)}
        onBlur={() => setSkipLinkFocused(false)}
      >
        Hopp til hovedinnhold
      </a>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area - AppShellTemplate Foundation */}
      <div style={{
        ...styles.contentWrapper,
        marginTop: isMobile ? '60px' : 0,
      }}>
        {/* Page Header (optional) */}
        {hasHeader && (
          <header style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.headerTitles}>
                {title && <PageTitle style={styles.title}>{title}</PageTitle>}
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
              </div>
              {actions && <div style={styles.headerActions}>{actions}</div>}
            </div>
          </header>
        )}

        {/* Main Content */}
        <main
          id="main-content"
          style={{
            ...styles.main,
            height: isMobile ? 'calc(100vh - 60px)' : '100vh',
          }}
          tabIndex="-1"
        >
          <div style={styles.mainInner}>
            {children}
          </div>
        </main>
      </div>

      <BackToTop />
    </div>
  );
}

/**
 * Styles following AppShellTemplate foundation
 * Using CSS variables for consistency with design system
 */
const styles = {
  shell: {
    height: '100vh',
    display: 'flex',
    backgroundColor: 'var(--background-default)',
  },
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: 0,
    padding: '8px 16px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '0 0 8px 0',
    zIndex: 9999,
    transition: 'top 0.2s',
  },
  skipLinkFocus: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '8px 16px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '0 0 8px 0',
    zIndex: 9999,
    transition: 'top 0.2s',
  },
  contentWrapper: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--background-default)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    backgroundColor: 'var(--background-white)',
    borderBottom: '1px solid var(--border-subtle)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--spacing-4)',
    width: '100%',
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 'var(--font-size-title1)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 'var(--font-size-body)',
    color: 'var(--text-secondary)',
    margin: 0,
    marginTop: 'var(--spacing-1)',
    lineHeight: 1.4,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
    marginLeft: 'var(--spacing-4)',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
  mainInner: {
    padding: 'var(--spacing-4)',
    width: '100%',
  },
};
