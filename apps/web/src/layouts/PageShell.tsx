/**
 * ============================================================
 * PageShell - Standardisert sidelayout
 * TIER Golf Design System v3.0 - Premium Light
 * ============================================================
 *
 * Felles layout-komponent som alle sider i spillerportalen bruker.
 * Sikrer konsistent spacing, header og tilstandshåndtering.
 *
 * SPACING-REGLER (hard-kodet):
 * - Seksjoner: 48px (--space-section)
 * - Overskrift → innhold: 24px (--space-heading)
 * - Kort → kort: 16px (--space-card)
 * - Input → input: 16px (--space-input)
 *
 * TILSTANDER:
 * - Tom tilstand (empty)
 * - Lasting (skeleton)
 * - Feiltilstand (error)
 * - Fullført med neste steg CTA
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic padding and maxWidth which require runtime values)
 * ============================================================
 */

import React from 'react';
import ProfileDropdown from '../components/layout/ProfileDropdown';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, SubSectionTitle } from '../components/typography';

// ────────────────────────────────────────────────────────────
// Spacing constants (CSS custom properties referanse)
// ────────────────────────────────────────────────────────────
export const PAGE_SPACING = {
  section: 48,    // Mellom seksjoner
  heading: 24,    // Overskrift til innhold
  card: 16,       // Mellom kort
  input: 16,      // Mellom input-felt
  page: {
    desktop: { top: 32, right: 40, bottom: 48, left: 40 },
    mobile: { top: 20, right: 16, bottom: 32, left: 16 },
  },
} as const;

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
export type PageState = 'loading' | 'empty' | 'error' | 'success' | 'idle';

export interface PageShellProps {
  /** Sidetittel (vises i header) */
  title: string;
  /** Valgfri undertittel */
  subtitle?: string;
  /** Valgfri kontekst (f.eks. uke/periode) */
  context?: string;
  /** Hovedinnhold */
  children: React.ReactNode;
  /** Sidetilstand */
  state?: PageState;
  /** Feilmelding (når state='error') */
  errorMessage?: string;
  /** Prøv igjen-handler (når state='error') */
  onRetry?: () => void;
  /** Tom-tilstand tekst */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCTA?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Neste steg CTA (vises nederst når relevant) */
  nextStep?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Ekstra actions i header */
  headerActions?: React.ReactNode;
  /** Max-bredde på innhold (default: 1200px) */
  maxWidth?: number | string;
  /** Skjul profil-dropdown i header */
  hideProfile?: boolean;
}

// ────────────────────────────────────────────────────────────
// Skeleton Loader (for loading state)
// ────────────────────────────────────────────────────────────
interface SkeletonBlockProps {
  width?: string | number;
  height?: number;
}

const SkeletonBlock = ({ width = '100%', height = 20 }: SkeletonBlockProps) => (
  <div
    className="bg-ak-surface-subtle rounded-lg animate-pulse"
    style={{ width, height }}
  />
);

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4">
    <SkeletonBlock height={32} width="40%" />
    <SkeletonBlock height={16} width="60%" />
    <div className="mt-6">
      <SkeletonBlock height={180} />
    </div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      <SkeletonBlock height={120} />
      <SkeletonBlock height={120} />
      <SkeletonBlock height={120} />
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Empty State
// ────────────────────────────────────────────────────────────
interface EmptyStateProps {
  title: string;
  description?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const EmptyState = ({ title, description, cta }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 rounded-[20px] bg-ak-surface-subtle flex items-center justify-center mb-6">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ak-text-tertiary">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <SubSectionTitle style={{ marginBottom: 0 }}>
      {title}
    </SubSectionTitle>
    {description && (
      <p className="text-sm text-ak-text-secondary mt-2 max-w-[400px]">
        {description}
      </p>
    )}
    {cta && (
      <button
        onClick={cta.onClick}
        className="mt-6 px-6 py-3 rounded-xl border-none bg-ak-primary text-white text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
      >
        {cta.label}
      </button>
    )}
  </div>
);

// ────────────────────────────────────────────────────────────
// Error State
// ────────────────────────────────────────────────────────────
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ message = 'Noe gikk galt', onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 rounded-[20px] bg-ak-status-error/10 flex items-center justify-center mb-6">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ak-status-error">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <SubSectionTitle style={{ marginBottom: 0 }}>
      Feil oppstod
    </SubSectionTitle>
    <p className="text-sm text-ak-text-secondary mt-2 max-w-[400px]">
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 px-6 py-3 rounded-xl border border-ak-border-default bg-transparent text-ak-text-primary text-sm font-semibold cursor-pointer transition-colors hover:bg-ak-surface-subtle"
      >
        Prøv igjen
      </button>
    )}
  </div>
);

// ────────────────────────────────────────────────────────────
// Next Step CTA
// ────────────────────────────────────────────────────────────
interface NextStepCTAProps {
  label: string;
  href?: string;
  onClick?: () => void;
}

const NextStepCTA = ({ label, href, onClick }: NextStepCTAProps) => {
  const content = (
    <div className="flex items-center justify-between py-5 px-6 rounded-2xl bg-ak-primary text-white cursor-pointer transition-opacity hover:opacity-90">
      <span className="text-base font-semibold">{label}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );

  if (href) {
    return <a href={href} className="no-underline">{content}</a>;
  }

  return <button onClick={onClick} className="w-full border-none bg-transparent p-0 cursor-pointer">{content}</button>;
};

// ────────────────────────────────────────────────────────────
// PageShell Component
// ────────────────────────────────────────────────────────────
export default function PageShell({
  title,
  subtitle,
  context,
  children,
  state = 'idle',
  errorMessage,
  onRetry,
  emptyTitle = 'Ingen data',
  emptyDescription,
  emptyCTA,
  nextStep,
  headerActions,
  maxWidth = 1200,
  hideProfile = false,
}: PageShellProps) {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const padding = isMobile ? PAGE_SPACING.page.mobile : PAGE_SPACING.page.desktop;

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return <LoadingSkeleton />;
      case 'empty':
        return <EmptyState title={emptyTitle} description={emptyDescription} cta={emptyCTA} />;
      case 'error':
        return <ErrorState message={errorMessage} onRetry={onRetry} />;
      default:
        return children;
    }
  };

  return (
    <div
      className="min-h-full"
      style={{
        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
      }}
    >
      <div className="mx-auto" style={{ maxWidth }}>
        {/* Header */}
        <header className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <PageTitle className={`font-bold text-ak-text-primary leading-tight ${isMobile ? 'text-2xl' : 'text-[28px]'}`} style={{ marginBottom: 0 }}>
              {title}
            </PageTitle>
            {subtitle && (
              <p className="text-sm text-ak-text-secondary mt-1 mb-0">
                {subtitle}
              </p>
            )}
            {context && (
              <span className="inline-block mt-2 px-3 py-1 rounded-md bg-ak-surface-subtle text-xs font-medium text-ak-text-secondary">
                {context}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
            {!hideProfile && !isMobile && (
              <ProfileDropdown
                user={user || undefined}
                onLogout={logout}
                variant="light"
              />
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {renderContent()}
        </main>

        {/* Next Step CTA */}
        {nextStep && state === 'success' && (
          <div className="mt-12">
            <NextStepCTA {...nextStep} />
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Named exports for convenience
// ────────────────────────────────────────────────────────────
export { EmptyState, ErrorState, LoadingSkeleton, NextStepCTA };
