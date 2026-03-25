/**
 * Page - Generic page layout wrapper
 * TIER Golf Design System v1.0
 *
 * Wraps PageHeader + PageContainer with sensible defaults and tier token support.
 * Use this for standard pages. For hub pages, use HubPage component.
 */

import React from 'react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';

interface PageProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional help text */
  helpText?: string;
  /** Optional actions to display in header */
  actions?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Header className override */
  headerClassName?: string;
  /** Container padding */
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Container background */
  background?: 'base' | 'subtle' | 'white';
  /** Container className override */
  containerClassName?: string;
  /** Full width container (no max-width) */
  fullWidth?: boolean;
}

/**
 * Generic Page wrapper for non-hub pages
 *
 * @example
 * <Page
 *   title="Coach Athletes"
 *   subtitle="Manage your athletes"
 *   paddingY="lg"
 *   background="base"
 * >
 *   <YourContent />
 * </Page>
 */
export default function Page({
  title,
  subtitle,
  helpText,
  actions,
  children,
  headerClassName,
  paddingY = 'lg',
  background = 'base',
  containerClassName,
  fullWidth = false,
}: PageProps) {
  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title={title}
        subtitle={subtitle}
        helpText={helpText}
        actions={actions}
        className={headerClassName}
      />

      <PageContainer
        paddingY={paddingY}
        background={background}
        className={containerClassName}
        fullWidth={fullWidth}
      >
        {children}
      </PageContainer>
    </div>
  );
}

/**
 * Page with custom header (for special layouts)
 */
export function PageWithCustomHeader({
  header,
  children,
  paddingY = 'lg',
  background = 'base',
  containerClassName,
  fullWidth = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'base' | 'subtle' | 'white';
  containerClassName?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className="min-h-screen bg-tier-surface-base">
      {header}

      <PageContainer
        paddingY={paddingY}
        background={background}
        className={containerClassName}
        fullWidth={fullWidth}
      >
        {children}
      </PageContainer>
    </div>
  );
}
