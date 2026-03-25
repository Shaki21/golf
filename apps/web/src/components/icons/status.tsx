/**
 * TIER Golf - Status & Metrics Icons
 */

import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const TrendUpIcon = ({ size = defaultIconProps.size, color = '#4ade80', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
    <polyline points="17,6 23,6 23,12" />
  </svg>
);

export const TrendDownIcon = ({ size = defaultIconProps.size, color = '#ef4444', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" />
    <polyline points="17,18 23,18 23,12" />
  </svg>
);

export const StarFilledIcon = ({ size = defaultIconProps.size, color = '#d4af37', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

export const StarEmptyIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

export const SuccessIcon = ({ size = defaultIconProps.size, color = '#4ade80', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16,9 10.5,15 8,12.5" />
  </svg>
);

export const ErrorIcon = ({ size = defaultIconProps.size, color = '#ef4444', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const WarningIcon = ({ size = defaultIconProps.size, color = '#fbbf24', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="0.5" fill={color} />
  </svg>
);

export const InfoIcon = ({ size = defaultIconProps.size, color = '#3b82f6', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="0.5" fill={color} />
  </svg>
);

export const OnlineIcon = ({ size = defaultIconProps.size, color = '#4ade80', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="6" fill={color} />
  </svg>
);

export const OfflineIcon = ({ size = defaultIconProps.size, color = '#737373', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} {...props}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);
