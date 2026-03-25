/**
 * ============================================================
 * PageContainer - TIER Golf Design System v1.0
 * ============================================================
 *
 * Content container matching PageHeader max-width and padding.
 * Ensures consistent layout across all pages.
 *
 * ARCHITECTURE:
 * - Full-width wrapper
 * - Responsive padding matching PageHeader (16/24/32px)
 * - Max-width 1200px matching PageHeader
 * - Optional background color
 *
 * USAGE:
 * <PageHeader title="..." />
 * <PageContainer>
 *   <YourContent />
 * </PageContainer>
 *
 * ============================================================
 */

import React from 'react';

export interface PageContainerProps {
  /** Content to render inside container */
  children: React.ReactNode;
  /** Background color className */
  background?: 'base' | 'subtle' | 'white' | 'transparent';
  /** Custom className */
  className?: string;
  /** Vertical padding */
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Full width without max-width constraint */
  fullWidth?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  background = 'base',
  className = '',
  paddingY = 'md',
  fullWidth = false,
}) => {
  const bgClasses = {
    base: 'bg-tier-surface-base',
    subtle: 'bg-tier-surface-subtle',
    white: 'bg-tier-white',
    transparent: 'bg-transparent',
  };

  const paddingClasses = {
    none: '',
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8',
    xl: 'py-12',
  };

  return (
    <div className={`w-full ${bgClasses[background]} ${className}`.trim()}>
      {/* Full-width wrapper with responsive horizontal padding */}
      <div className="w-full px-4 md:px-6 lg:px-8">
        {/* Max-width content area matching PageHeader (or full width if specified) */}
        <div className={`${fullWidth ? 'w-full' : 'max-w-[1200px]'} mx-auto ${paddingClasses[paddingY]}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
