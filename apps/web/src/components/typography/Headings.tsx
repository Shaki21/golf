/**
 * ============================================================
 * HEADINGS - Single Source of Truth for Typography
 * ============================================================
 *
 * REGEL: Direkte bruk av <h1>-<h6> er FORBUDT utenfor denne filen.
 *
 * Bruk:
 * - PageTitle:       Én per side, renderer <h1>
 * - SectionTitle:    Hovedseksjoner, renderer <h2>
 * - SubSectionTitle: Underseksjoner/kort, renderer <h3>
 *
 * ============================================================
 */

import React from 'react';

// ============================================================
// TYPES
// ============================================================

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

interface PageTitleProps extends HeadingProps {
  subtitle?: string;
}

// ============================================================
// DESIGN TOKENS - TIER Golf Design System
// ============================================================

const headingStyles = {
  pageTitle: {
    fontSize: '30px', // 1.875rem - standard H1/page-title
    fontWeight: 700,
    color: 'rgb(var(--tier-navy))',
    margin: 0,
    marginBottom: '16px', // mb-4 equivalent
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  pageTitleSubtitle: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgb(var(--tier-text-secondary))',
    margin: '8px 0 0 0',
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: '20px', // 1.25rem - standard H2/section-title
    fontWeight: 600,
    color: 'rgb(var(--tier-navy))',
    margin: 0,
    marginBottom: '12px', // mb-3 equivalent
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  subSectionTitle: {
    fontSize: '16px', // 1rem - standard H3/card-title
    fontWeight: 600,
    color: 'rgb(var(--tier-navy))',
    margin: 0,
    marginBottom: '8px', // mb-2 equivalent
    lineHeight: 1.4,
  },
} as const;

// ============================================================
// PAGE TITLE (h1)
// ============================================================
// Brukes eksakt én gang per side.
// Representerer sidens primære formål.

export const PageTitle: React.FC<PageTitleProps> = ({
  children,
  subtitle,
  className,
  style,
  id,
}) => (
  <div className={className} style={style}>
    <h1 id={id} style={headingStyles.pageTitle}>
      {children}
    </h1>
    {subtitle && (
      <p style={headingStyles.pageTitleSubtitle}>{subtitle}</p>
    )}
  </div>
);

PageTitle.displayName = 'PageTitle';

// ============================================================
// SECTION TITLE (h2)
// ============================================================
// Brukes for hovedseksjoner på siden.

export const SectionTitle: React.FC<HeadingProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <h2
    id={id}
    className={className}
    style={{ ...headingStyles.sectionTitle, ...style }}
  >
    {children}
  </h2>
);

SectionTitle.displayName = 'SectionTitle';

// ============================================================
// SUB-SECTION TITLE (h3)
// ============================================================
// Brukes for underseksjoner, kort-titler og grupperinger.

export const SubSectionTitle: React.FC<HeadingProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <h3
    id={id}
    className={className}
    style={{ ...headingStyles.subSectionTitle, ...style }}
  >
    {children}
  </h3>
);

SubSectionTitle.displayName = 'SubSectionTitle';

// ============================================================
// CARD TITLE (h4) - For kort og widgets
// ============================================================
// Brukes for korttitler innenfor seksjoner.

export const CardTitle: React.FC<HeadingProps> = ({
  children,
  className,
  style,
  id,
}) => (
  <h4
    id={id}
    className={className}
    style={{
      fontSize: '14px',
      fontWeight: 600,
      color: 'rgb(var(--tier-navy))',
      margin: 0,
      lineHeight: 1.4,
      ...style,
    }}
  >
    {children}
  </h4>
);

CardTitle.displayName = 'CardTitle';

// ============================================================
// EXPORTS
// ============================================================

export default {
  PageTitle,
  SectionTitle,
  SubSectionTitle,
  CardTitle,
};
