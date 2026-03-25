/**
 * TIER Golf Full Logo Component
 * Text-based logo with decorative tier bars
 * Design System v3.0 - Premium Light
 */

import React from 'react';

interface TIERGolfFullLogoProps {
  /** Height of the logo in pixels */
  height?: number;
  /** Color scheme */
  variant?: 'dark' | 'light' | 'navy';
  /** Additional CSS class name */
  className?: string;
}

export const TIERGolfFullLogo: React.FC<TIERGolfFullLogoProps> = ({
  height = 44,
  variant = 'dark',
  className,
}) => {
  // Use CSS variables from design system
  const colors = {
    dark: { text: 'rgb(var(--tier-navy))', accent: 'rgb(var(--tier-gold))' },
    light: { text: 'rgb(var(--tier-white))', accent: 'rgb(var(--tier-gold-light))' },
    navy: { text: 'rgb(var(--tier-navy))', accent: 'rgb(var(--tier-gold))' },
  };

  const { text: textColor, accent: accentColor } = colors[variant];

  // Original viewBox is 280x56, aspect ratio = 5
  const width = height * 5;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
      aria-label="TIER Golf logo"
      role="img"
    >
      {/* TIER Text */}
      <text
        x="0"
        y="42"
        fontFamily="DM Sans, system-ui, -apple-system, sans-serif"
        fontSize="44"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-1"
      >
        TIER
      </text>

      {/* Decorative tier bars representing progression */}
      <rect x="118" y="10" width="5" height="36" rx="2.5" fill={accentColor} />
      <rect x="127" y="16" width="5" height="30" rx="2.5" fill={accentColor} opacity="0.7" />
      <rect x="136" y="22" width="5" height="24" rx="2.5" fill={accentColor} opacity="0.4" />

      {/* GOLF Text */}
      <text
        x="150"
        y="42"
        fontFamily="DM Sans, system-ui, -apple-system, sans-serif"
        fontSize="44"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-1"
      >
        GOLF
      </text>
    </svg>
  );
};

export default TIERGolfFullLogo;
