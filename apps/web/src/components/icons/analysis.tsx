/**
 * TIER Golf - Analysis Tool Icons
 */

import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const AngleIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 21L12 12L21 21" />
    <path d="M7.5 16.5a6 6 0 0 1 9 0" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const LineIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" y1="20" x2="20" y2="4" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="4" r="2" />
  </svg>
);

export const CircleDrawIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="12" x2="18" y2="12" strokeDasharray="2 2" />
  </svg>
);

export const ArrowIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="19" x2="19" y2="5" />
    <polyline points="12,5 19,5 19,12" />
  </svg>
);

export const TextIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4,7 4,4 20,4 20,7" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </svg>
);

export const UndoIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="1,4 1,10 7,10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const RedoIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23,4 23,10 17,10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export const ZoomInIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const ZoomOutIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const FullscreenIcon = ({ size = defaultIconProps.size, color = 'currentColor', strokeWidth = defaultIconProps.strokeWidth, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="8,3 3,3 3,8" />
    <polyline points="21,8 21,3 16,3" />
    <polyline points="3,16 3,21 8,21" />
    <polyline points="16,21 21,21 21,16" />
  </svg>
);
