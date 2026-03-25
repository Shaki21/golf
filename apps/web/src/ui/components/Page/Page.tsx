import React, { createContext, useContext } from 'react';
import { PageTitle, SectionTitle } from '../../../components/typography';

/**
 * Page Component System
 *
 * Mandatory page composition for all application pages.
 * This is the ONLY way to build page layouts.
 *
 * Structure:
 * - Page (root container, owns max-width + horizontal padding)
 * - Page.Header (title, breadcrumbs, primary actions - contains only H1)
 * - Page.Toolbar (filters, search, tabs - optional)
 * - Page.Content (main content wrapper)
 * - Page.Section (content sections with optional title - contains H2)
 * - Page.Aside (side panel - optional, explicit use only)
 * - Page.Footer (pagination, secondary actions - optional)
 *
 * Page States:
 * - loading: Shows skeleton/spinner
 * - error: Shows error state with retry
 * - empty: Shows empty state with CTA
 * - unauthorized: Shows access denied message
 */

// ============================================================================
// TYPES
// ============================================================================

type PageState = 'idle' | 'loading' | 'error' | 'empty' | 'unauthorized';

interface PageContextValue {
  state: PageState;
}

interface PageProps {
  children: React.ReactNode;
  /** Current page state */
  state?: PageState;
  /** Maximum content width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional className (only Tailwind utilities allowed) */
  className?: string;
}

interface PageHeaderProps {
  /** Page title (renders as H1) */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Optional help text / description */
  helpText?: string;
  /** Breadcrumb items */
  breadcrumbs?: Array<{ label: string; href?: string; onClick?: () => void }>;
  /** Primary actions (right side) */
  actions?: React.ReactNode;
  /** Back navigation handler */
  onBack?: () => void;
}

interface PageToolbarProps {
  children: React.ReactNode;
  /** Sticky toolbar */
  sticky?: boolean;
}

interface PageContentProps {
  children: React.ReactNode;
  /** Layout mode */
  layout?: 'default' | 'grid' | 'split';
}

interface PageSectionProps {
  children: React.ReactNode;
  /** Section title (renders as H2) */
  title?: string;
  /** Section description */
  description?: string;
  /** Section actions (header right side) */
  actions?: React.ReactNode;
  /** Card wrapper */
  card?: boolean;
  /** Collapsible section */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

interface PageAsideProps {
  children: React.ReactNode;
  /** Aside width */
  width?: 'sm' | 'md' | 'lg';
  /** Sticky aside */
  sticky?: boolean;
}

interface PageFooterProps {
  children: React.ReactNode;
  /** Sticky footer */
  sticky?: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const PageContext = createContext<PageContextValue>({ state: 'idle' });

const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('Page components must be used within a Page');
  }
  return context;
};

// ============================================================================
// PAGE ROOT
// ============================================================================

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

function PageRoot({ children, state = 'idle', maxWidth = 'xl', className = '' }: PageProps) {
  return (
    <PageContext.Provider value={{ state }}>
      <main
        className={`
          w-full mx-auto px-4 sm:px-6 lg:px-8 py-6
          ${maxWidthClasses[maxWidth]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        {children}
      </main>
    </PageContext.Provider>
  );
}

// ============================================================================
// PAGE.HEADER
// ============================================================================

function PageHeader({
  title,
  subtitle,
  helpText,
  breadcrumbs,
  actions,
  onBack,
}: PageHeaderProps) {
  return (
    <header className="mb-6 pb-4 border-b border-ak-border-default">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 mb-3 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-ak-text-tertiary">/</span>
              )}
              {crumb.href || crumb.onClick ? (
                <a
                  href={crumb.href || '#'}
                  onClick={(e) => {
                    if (crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    }
                  }}
                  className={`
                    text-ak-text-secondary hover:text-ak-text-primary transition-colors
                    ${index === breadcrumbs.length - 1 ? 'text-ak-text-primary font-medium' : ''}
                  `.trim()}
                  aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-ak-text-secondary">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Section */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg text-ak-text-secondary hover:text-ak-text-primary hover:bg-ak-surface-subtle transition-colors"
              aria-label="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5L7 10L12 15" />
              </svg>
            </button>
          )}

          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <PageTitle className="text-2xl sm:text-3xl font-bold text-ak-text-primary leading-tight" style={{ marginBottom: 0 }}>
              {title}
            </PageTitle>
            {subtitle && (
              <p className="mt-1 text-sm text-ak-text-secondary">
                {subtitle}
              </p>
            )}
            {helpText && (
              <p className="mt-1 text-sm text-ak-text-tertiary">
                {helpText}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================================
// PAGE.TOOLBAR
// ============================================================================

function PageToolbar({ children, sticky = false }: PageToolbarProps) {
  return (
    <div
      className={`
        flex items-center gap-3 flex-wrap
        bg-ak-surface-card p-4 rounded-lg shadow-ak-card mb-4
        ${sticky ? ' backdrop-blur-sm' : ''}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PAGE.CONTENT
// ============================================================================

const layoutClasses = {
  default: 'flex flex-col gap-6',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  split: 'flex flex-col lg:flex-row gap-6',
};

function PageContent({ children, layout = 'default' }: PageContentProps) {
  const { state } = usePage();

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <PageLoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return <PageErrorState />;
  }

  // Empty state
  if (state === 'empty') {
    return <PageEmptyState />;
  }

  // Unauthorized state
  if (state === 'unauthorized') {
    return <PageUnauthorizedState />;
  }

  return (
    <div className={layoutClasses[layout]}>
      {children}
    </div>
  );
}

// ============================================================================
// PAGE.SECTION
// ============================================================================

function PageSection({
  children,
  title,
  description,
  actions,
  card = true,
  collapsible = false,
  defaultCollapsed = false,
}: PageSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const content = (
    <>
      {(title || actions) && (
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {title && (
              <SectionTitle className="text-lg font-semibold text-ak-text-primary" style={{ marginBottom: 0 }}>
                {title}
              </SectionTitle>
            )}
            {description && (
              <p className="mt-1 text-sm text-ak-text-secondary">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded text-ak-text-tertiary hover:text-ak-text-primary transition-colors"
                aria-expanded={!isCollapsed}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      {(!collapsible || !isCollapsed) && children}
    </>
  );

  if (card) {
    return (
      <section className="bg-ak-surface-card p-6 rounded-xl shadow-ak-card">
        {content}
      </section>
    );
  }

  return <section>{content}</section>;
}

// ============================================================================
// PAGE.ASIDE
// ============================================================================

const asideWidthClasses = {
  sm: 'w-64',
  md: 'w-80',
  lg: 'w-96',
};

function PageAside({ children, width = 'md', sticky = false }: PageAsideProps) {
  return (
    <aside
      className={`
        ${asideWidthClasses[width]} flex-shrink-0
        ${sticky ? 'lg:sticky lg:top-6 lg:self-start' : ''}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </aside>
  );
}

// ============================================================================
// PAGE.FOOTER
// ============================================================================

function PageFooter({ children, sticky = false }: PageFooterProps) {
  return (
    <footer
      className={`
        mt-6 pt-4 border-t border-ak-border-default
        flex justify-center
        ${sticky ? 'sticky bottom-0 bg-ak-surface-base py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : ''}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </footer>
  );
}

// ============================================================================
// PAGE STATES
// ============================================================================

function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Section skeleton */}
      <div className="bg-ak-surface-card p-6 rounded-xl">
        <div className="h-6 w-1/4 bg-ak-surface-subtle rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-ak-surface-subtle rounded" />
          <div className="h-4 w-5/6 bg-ak-surface-subtle rounded" />
          <div className="h-4 w-4/6 bg-ak-surface-subtle rounded" />
        </div>
      </div>
      {/* Another section skeleton */}
      <div className="bg-ak-surface-card p-6 rounded-xl">
        <div className="h-6 w-1/3 bg-ak-surface-subtle rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-ak-surface-subtle rounded" />
          <div className="h-24 bg-ak-surface-subtle rounded" />
          <div className="h-24 bg-ak-surface-subtle rounded" />
        </div>
      </div>
    </div>
  );
}

function PageErrorState() {
  return (
    <div className="bg-ak-surface-card p-8 rounded-xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ak-status-error-light flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--tier-status-error)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <SectionTitle className="text-xl font-semibold text-ak-text-primary mb-2" style={{ marginBottom: 0 }}>
        Something went wrong
      </SectionTitle>
      <p className="text-ak-text-secondary mb-6">
        We could not load this page. Please try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-ak-primary text-white rounded-lg hover:bg-ak-brand-hover transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

function PageEmptyState() {
  return (
    <div className="bg-ak-surface-card p-8 rounded-xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ak-surface-subtle flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--tier-text-tertiary)" strokeWidth="2">
          <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M12 10v6M9 13l3-3 3 3" />
        </svg>
      </div>
      <SectionTitle className="text-xl font-semibold text-ak-text-primary mb-2" style={{ marginBottom: 0 }}>
        No data
      </SectionTitle>
      <p className="text-ak-text-secondary">
        There is nothing to show here yet.
      </p>
    </div>
  );
}

function PageUnauthorizedState() {
  return (
    <div className="bg-ak-surface-card p-8 rounded-xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ak-status-warning-light flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--tier-status-warning)" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <SectionTitle className="text-xl font-semibold text-ak-text-primary mb-2" style={{ marginBottom: 0 }}>
        No access
      </SectionTitle>
      <p className="text-ak-text-secondary">
        You do not have access to this page.
      </p>
    </div>
  );
}

// ============================================================================
// COMPOUND COMPONENT EXPORT
// ============================================================================

export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Toolbar: PageToolbar,
  Content: PageContent,
  Section: PageSection,
  Aside: PageAside,
  Footer: PageFooter,
});

export type {
  PageProps,
  PageHeaderProps,
  PageToolbarProps,
  PageContentProps,
  PageSectionProps,
  PageAsideProps,
  PageFooterProps,
  PageState,
};
