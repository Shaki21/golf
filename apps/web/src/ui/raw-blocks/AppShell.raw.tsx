import React from 'react';

/**
 * AppShell Raw Block
 * Main application layout container following TIER Golf design system
 * Provides mobile-first responsive layout with header, navigation, and content areas
 */

interface AppShellProps {
  /** Header content (logo, title, actions) */
  header?: React.ReactNode;
  /** Mobile navigation bar (bottom nav on mobile) */
  navigation?: React.ReactNode;
  /** Main content area */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Show mobile navigation */
  showMobileNav?: boolean;
  /** Additional className for customization */
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({
  header,
  navigation,
  children,
  footer,
  showMobileNav = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col min-h-screen bg-tier-surface-subtle ${className}`}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-white border-b border-tier-border-subtle backdrop-blur-md">
          {header}
        </header>
      )}

      {/* Main Content Area */}
      <main
        className="flex-1 w-full max-w-[1536px] mx-auto p-4"
        style={showMobileNav ? { paddingBottom: 'calc(56px + var(--safe-area-inset-bottom) + 16px)' } : undefined}
      >
        {children}
      </main>

      {/* Mobile Navigation (bottom on mobile, side on desktop) */}
      {navigation && showMobileNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-tier-border-subtle z-[100]"
          style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
        >
          {navigation}
        </nav>
      )}

      {/* Footer */}
      {footer && (
        <footer className="bg-tier-surface-subtle py-6 px-4 mt-auto border-t border-tier-border-subtle">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default AppShell;
