/**
 * TIER Golf Logo Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 * Single source of truth for the TIER Golf logo
 */

import React from 'react';

interface AKLogoProps {
  /** Height of the logo in pixels */
  size?: number;
  /** Fill color of the logo */
  color?: string;
  /** Additional CSS class name */
  className?: string;
}

export const AKLogo: React.FC<AKLogoProps> = ({
  size = 44,
  color = 'var(--tier-surface-card)',
  className,
}) => {
  const aspectRatio = 196.41 / 204.13;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 196.41 204.13"
      width={size * aspectRatio}
      height={size}
      fill={color}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="TIER Golf logo"
      role="img"
    >
      <path d="M170.3,185.77c-6.31-6.32-12.14-13.2-17.5-20.66l-34.14-46.91,2.13-1.92-20.32,17.03,32.11,45.71,9.32,13.77.72,2.16c-.19,1.72-1.53,2.72-4.02,3.01l-7.17.43v5.74h64.98v-5.74c-10.61-1.34-19.32-5.55-26.11-12.62ZM129.42,66.56v5.74l8.03.72,3.59.71c1.91.86,2.82,2.06,2.73,3.59.09,1.72-1.96,4.59-6.17,8.61l-8.18,8.46-31.7,28.98V0l-46.19,14.2v5.74l6.31-.14c8.51.38,13.1,3.87,13.77,10.47l.29,6.17v120.84l25.82-21.66,2.75-2.31,20.32-17.03,22.4-20.31,13.06-10.9c7.93-6.41,16.4-10.33,25.39-11.77l9.18-1v-5.74h-61.4ZM97.72,129.39v6.23l2.75-2.31-2.75-3.92ZM71.25,178.91l-37.82,25.03c1.44-.07,2.9-.21,4.36-.44,6.84-1.28,20.73-6.23,34.37-25.19l-.91.6ZM33.43,203.94c.15.01,1.74.05,4.36-.44-1.46.23-2.92.37-4.36.44ZM71.9,113.67l-15.52,5.97c-16.26,6.6-28.74,13.1-37.44,19.51-5.93,4.3-10.6,9.2-13.99,14.7C1.56,159.35-.09,165.54,0,172.42c.1,9.38,2.99,16.96,8.68,22.74,5.69,5.79,13.36,8.73,23.02,8.82.58,0,1.14-.02,1.72-.04h.01l37.82-25.03c-21.68,14.17-34.35,4.73-34.35,4.73-1.73-1.06-3.32-2.44-4.77-4.19-3.34-4.11-4.97-9.08-4.87-14.91-.39-13.68,9.94-24.92,30.98-33.71l13.66-5.65.26-.11v-11.5l-.26.1ZM46.07,70c-2.91.53-13.6,2.32-16.37,3.22-7.17,2.39-13.15,5.98-17.93,10.76-5.83,5.83-8.75,11.96-8.75,18.36-.19,3.92.84,7.44,3.09,10.54,2.24,3.11,5.61,4.57,10.11,4.38,8.89,0,13.36-6.09,13.56-15.94l-.36-5.92c-.44-5.91-2.7-15.76,16.65-25.4Z"/>
    </svg>
  );
};

export default AKLogo;
