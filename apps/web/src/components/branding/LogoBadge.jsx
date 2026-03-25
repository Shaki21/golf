/**
 * LogoBadge Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 * Reusable container for displaying the TIER Golf logo in a badge/circle
 */

import React from 'react';
import { AKLogo } from './AKLogo';

/**
 * @param {number} logoSize - Size of the logo in pixels (default: 44px)
 * @param {number} badgeSize - Size of the badge container (default: 56px)
 * @param {string} backgroundColor - Background color of the badge (default: var(--accent))
 * @param {string} logoColor - Color of the logo (default: white)
 * @param {string} borderRadius - Border radius of the badge (default: 16px)
 * @param {string} className - Additional CSS classes
 * @param {string} as - HTML element type (default: 'div')
 */
export const LogoBadge = ({
  logoSize = 44,
  badgeSize = 56,
  backgroundColor = 'var(--accent)',
  logoColor = 'var(--tier-surface-card)',
  borderRadius = '16px',
  className = '',
  as = 'div'
}) => {
  const Component = as;

  return (
    <Component
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: `${badgeSize}px`,
        height: `${badgeSize}px`,
        backgroundColor,
        borderRadius
      }}
    >
      <AKLogo size={logoSize} color={logoColor} />
    </Component>
  );
};

export default LogoBadge;
