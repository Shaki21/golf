/**
 * TIER Golf - Golf Specific Icons
 */

import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const GolfFlagIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 21V3h1v2l10-2v8L5 13v8H4z" />
  </svg>
);

export const GolfBallIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="8.5" r="1" fill={color} stroke="none" />
    <circle cx="15" cy="8.5" r="1" fill={color} stroke="none" />
    <circle cx="12" cy="13" r="1" fill={color} stroke="none" />
    <circle cx="9" cy="16" r="1" fill={color} stroke="none" />
    <circle cx="15" cy="16" r="1" fill={color} stroke="none" />
  </svg>
);

export const TargetIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const SwingIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);

export const GreenIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="16" rx="9" ry="5" />
    <circle cx="12" cy="14" r="1.5" fill={color} stroke="none" />
    <line x1="12" y1="3" x2="12" y2="11" />
    <path d="M12 3l3-1v3l-3 1" />
  </svg>
);

export const ClubIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 4l2 3 12 12" />
    <path d="M19 19l2 2" />
    <ellipse cx="5" cy="6" rx="3" ry="4" transform="rotate(-30 5 6)" />
  </svg>
);

export const ScorecardIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

export const DistanceIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="8,8 4,12 8,16" />
    <polyline points="16,8 20,12 16,16" />
  </svg>
);

export const HandicapIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v6l4 2" />
  </svg>
);
