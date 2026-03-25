/**
 * TIER Golf - Custom Icon Library
 * Based on Figma Kit Blue Palette 01
 *
 * Specifications:
 * - 24x24px viewBox
 * - 1.5px stroke width
 * - Round caps/joins
 * - Primary color: #10456A (currentColor for flexibility)
 */

import React from 'react';

// Base icon wrapper
const IconWrapper = ({ children, size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

// ============================================
// GOLF ICONS
// ============================================

export const GolfBall = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Realistic golf ball with dimple pattern */}
    <circle cx="12" cy="12" r="9" />
    {/* Row 1 - top */}
    <circle cx="12" cy="5" r="0.8" fill={color || 'currentColor'} stroke="none" />
    {/* Row 2 */}
    <circle cx="8" cy="7" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="12" cy="7.5" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="16" cy="7" r="0.8" fill={color || 'currentColor'} stroke="none" />
    {/* Row 3 */}
    <circle cx="5.5" cy="10" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="9" cy="10" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="12" cy="10.5" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="15" cy="10" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="18.5" cy="10" r="0.8" fill={color || 'currentColor'} stroke="none" />
    {/* Row 4 - middle */}
    <circle cx="6" cy="13" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="9.5" cy="13" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="14.5" cy="13" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="18" cy="13" r="0.8" fill={color || 'currentColor'} stroke="none" />
    {/* Row 5 */}
    <circle cx="7" cy="16" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="12" cy="16" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="17" cy="16" r="0.8" fill={color || 'currentColor'} stroke="none" />
    {/* Row 6 - bottom */}
    <circle cx="10" cy="18.5" r="0.8" fill={color || 'currentColor'} stroke="none" />
    <circle cx="14" cy="18.5" r="0.8" fill={color || 'currentColor'} stroke="none" />
  </IconWrapper>
);

export const GolfClub = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="12" y1="3" x2="12" y2="17" />
    <path d="M7 17 L12 17 L17 21 L7 21 Z" />
  </IconWrapper>
);

export const GolfFlag = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Flag pole */}
    <line x1="6" y1="3" x2="6" y2="21" />
    {/* Flag */}
    <path d="M6 3 L18 6.5 L6 10 Z" fill={color || 'currentColor'} />
    {/* Hole/cup */}
    <ellipse cx="12" cy="20" rx="6" ry="2" />
    {/* Arrow pointing to hole */}
    <line x1="14" y1="14" x2="12" y2="17" />
    <polyline points="10.5 15.5 12 17 13.5 15.5" />
  </IconWrapper>
);

export const GolfTee = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="12" y1="8" x2="12" y2="20" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <circle cx="12" cy="5" r="3" />
  </IconWrapper>
);

export const GolfTarget = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill={color || 'currentColor'} stroke="none" />
  </IconWrapper>
);

export const GolfDistance = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="7 9 4 12 7 15" />
    <polyline points="17 9 20 12 17 15" />
  </IconWrapper>
);

export const GolfSwing = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Person swinging golf club */}
    {/* Head */}
    <circle cx="10" cy="4" r="2.5" />
    {/* Body */}
    <line x1="10" y1="6.5" x2="10" y2="13" />
    {/* Left leg */}
    <line x1="10" y1="13" x2="7" y2="20" />
    {/* Right leg */}
    <line x1="10" y1="13" x2="13" y2="20" />
    {/* Arms holding club */}
    <path d="M10 8 Q 14 6 18 3" />
    {/* Golf club */}
    <line x1="17" y1="3.5" x2="21" y2="2" />
    <line x1="20.5" y1="1.5" x2="22" y2="3" strokeWidth="2" />
  </IconWrapper>
);

export const GolfSpeed = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </IconWrapper>
);

export const GolfPutt = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="18" r="3" />
    <line x1="12" y1="3" x2="12" y2="15" />
    <line x1="8" y1="7" x2="16" y2="7" />
  </IconWrapper>
);

export const GolfPutter = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="12" y1="2" x2="12" y2="18" />
    <rect x="8" y="18" width="8" height="4" rx="1" />
    <circle cx="12" cy="6" r="2" fill="none" />
  </IconWrapper>
);

export const GolfBunker = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <ellipse cx="12" cy="16" rx="9" ry="5" />
    <path d="M5 14c0-3 3-6 7-6s7 3 7 6" />
    <circle cx="12" cy="12" r="2" />
  </IconWrapper>
);

export const GolfScorecard = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="9" x2="9" y2="21" />
    <line x1="15" y1="9" x2="15" y2="21" />
  </IconWrapper>
);

// ============================================
// TRAINING TYPE ICONS
// ============================================

export const TeknikIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Golf stance/technique - person in address position */}
    {/* Head */}
    <circle cx="12" cy="4" r="2.5" />
    {/* Body bent forward */}
    <path d="M12 6.5 Q 10 10 8 14" />
    {/* Legs */}
    <line x1="8" y1="14" x2="6" y2="21" />
    <line x1="8" y1="14" x2="12" y2="21" />
    {/* Arms holding club down */}
    <path d="M10 9 L 16 15" />
    {/* Club head on ground */}
    <ellipse cx="17" cy="16" rx="2" ry="1" />
    {/* Ball */}
    <circle cx="19" cy="18" r="1.5" fill={color || 'currentColor'} stroke="none" />
  </IconWrapper>
);

export const GolfslagIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill={color || 'currentColor'} stroke="none" />
  </IconWrapper>
);

export const SpillIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="8" y1="3" x2="8" y2="21" />
    <path d="M8 3 L18 7 L8 11 Z" />
    <ellipse cx="12" cy="21" rx="8" ry="2" />
  </IconWrapper>
);

export const KonkurranseIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M6 9H4a2 2 0 0 0 0 4h2M18 9h2a2 2 0 0 1 0 4h-2" />
    <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
    <path d="M12 16v4M8 20h8" />
  </IconWrapper>
);

export const FysiskIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Barbell/dumbbell icon */}
    {/* Left weight plate */}
    <rect x="2" y="8" width="3" height="8" rx="0.5" />
    {/* Left inner plate */}
    <rect x="5" y="9.5" width="2" height="5" rx="0.3" />
    {/* Bar */}
    <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2" />
    {/* Right inner plate */}
    <rect x="17" y="9.5" width="2" height="5" rx="0.3" />
    {/* Right weight plate */}
    <rect x="19" y="8" width="3" height="8" rx="0.5" />
  </IconWrapper>
);

export const MentalIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Brain icon */}
    {/* Left hemisphere */}
    <path d="M9 4C6 4 4 6.5 4 9c0 1.5.5 2.5 1.5 3.5C4.5 13.5 4 15 4 16c0 2.5 2 4.5 4.5 4.5.5 0 1-.1 1.5-.2" />
    {/* Right hemisphere */}
    <path d="M15 4c3 0 5 2.5 5 5 0 1.5-.5 2.5-1.5 3.5 1 1 1.5 2.5 1.5 3.5 0 2.5-2 4.5-4.5 4.5-.5 0-1-.1-1.5-.2" />
    {/* Center division */}
    <path d="M12 4v16" />
    {/* Brain folds left */}
    <path d="M9 8c-1 0-2 .5-2 1.5s1 1.5 2 1.5" />
    <path d="M9 14c-1.5 0-2.5.5-2.5 1.5s1 1.5 2.5 1.5" />
    {/* Brain folds right */}
    <path d="M15 8c1 0 2 .5 2 1.5s-1 1.5-2 1.5" />
    <path d="M15 14c1.5 0 2.5.5 2.5 1.5s-1 1.5-2.5 1.5" />
  </IconWrapper>
);

// ============================================
// STATUS ICONS
// ============================================

export const CheckIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const ClockIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

export const XIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const TrophyIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M6 9H4a2 2 0 0 0 0 4h2M18 9h2a2 2 0 0 1 0 4h-2" />
    <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
    <path d="M12 16v4M8 20h8" />
  </IconWrapper>
);

export const StarIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </IconWrapper>
);

export const LockIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </IconWrapper>
);

export const InfoIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
);

export const HelpIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

// ============================================
// ACTION ICONS
// ============================================

export const PlayIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </IconWrapper>
);

export const PauseIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </IconWrapper>
);

export const ResetIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </IconWrapper>
);

export const PlusIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

export const EditIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </IconWrapper>
);

export const ShareIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </IconWrapper>
);

export const DeleteIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </IconWrapper>
);

export const DownloadIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </IconWrapper>
);

export const UploadIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </IconWrapper>
);

// ============================================
// NAVIGATION ICONS
// ============================================

export const HomeIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

export const CalendarIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const UserIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconWrapper>
);

export const SettingsIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

export const BellIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </IconWrapper>
);

export const MenuIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </IconWrapper>
);

export const ProfileIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconWrapper>
);

export const TeamIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconWrapper>
);

// ============================================
// MISC ICONS
// ============================================

export const RestIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    {/* Bed with Zzz - sleep/rest icon */}
    {/* Bed frame */}
    <path d="M2 18v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
    <path d="M2 18h16" />
    {/* Bed legs */}
    <line x1="4" y1="18" x2="4" y2="21" />
    <line x1="16" y1="18" x2="16" y2="21" />
    {/* Pillow */}
    <rect x="3" y="10" width="5" height="3" rx="1" />
    {/* Person sleeping (simplified) */}
    <circle cx="5.5" cy="8" r="2" />
    {/* Zzz */}
    <text x="18" y="8" fontSize="5" fill={color || 'currentColor'} stroke="none" fontWeight="bold">Z</text>
    <text x="20" y="5" fontSize="4" fill={color || 'currentColor'} stroke="none" fontWeight="bold">z</text>
    <text x="21.5" y="3" fontSize="3" fill={color || 'currentColor'} stroke="none" fontWeight="bold">z</text>
  </IconWrapper>
);

export const ChartIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconWrapper>
);

export const BookIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </IconWrapper>
);

export const NoteIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </IconWrapper>
);

export const NotesIcon = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </IconWrapper>
);

export const DocumentIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </IconWrapper>
);

export const FolderIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </IconWrapper>
);

export const ArchiveIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </IconWrapper>
);

export const FlameIcon = ({ size, className, color }) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </IconWrapper>
);

// ============================================
// MOOD ICONS (Emoji replacements)
// ============================================

export const MoodIcon1 = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <path d="M8 9V8" />
    <path d="M16 9V8" />
    <path d="M9 18c.5-1 1.5-2 3-2s2.5 1 3 2" />
  </IconWrapper>
);

export const MoodIcon2 = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="9" x2="8.01" y2="9" />
    <line x1="16" y1="9" x2="16.01" y2="9" />
    <path d="M10 16c.5-.5 1-1 2-1s1.5.5 2 1" />
  </IconWrapper>
);

export const MoodIcon3 = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="9" x2="8.01" y2="9" />
    <line x1="16" y1="9" x2="16.01" y2="9" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </IconWrapper>
);

export const MoodIcon4 = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="9" x2="8.01" y2="9" />
    <line x1="16" y1="9" x2="16.01" y2="9" />
    <path d="M9 14c.5.5 1.5 1 3 1s2.5-.5 3-1" />
  </IconWrapper>
);

export const MoodIcon5 = ({ size = 24, className = '', color = 'currentColor' }) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9h.01" />
    <path d="M16 9h.01" />
    <path d="M8 14c1 1.5 2.5 2 4 2s3-.5 4-2" />
  </IconWrapper>
);

// ============================================
// MAPPING FOR SESSION TYPES
// ============================================

export const SessionTypeIcons = {
  teknikk: TeknikIcon,
  golfslag: GolfslagIcon,
  spill: SpillIcon,
  konkurranse: KonkurranseIcon,
  fysisk: FysiskIcon,
  mental: MentalIcon,
  rest: RestIcon,
};

export const getSessionIcon = (type, props = {}) => {
  const IconComponent = SessionTypeIcons[type] || GolfBall;
  return <IconComponent {...props} />;
};

// Default export with all icons
const icons = {
  // Golf
  GolfBall,
  GolfClub,
  GolfFlag,
  GolfTee,
  GolfTarget,
  GolfDistance,
  GolfSwing,
  GolfSpeed,
  GolfPutt,
  GolfPutter,
  GolfBunker,
  GolfScorecard,
  // Training types
  TeknikIcon,
  GolfslagIcon,
  SpillIcon,
  KonkurranseIcon,
  FysiskIcon,
  MentalIcon,
  // Status
  CheckIcon,
  ClockIcon,
  XIcon,
  TrophyIcon,
  StarIcon,
  LockIcon,
  InfoIcon,
  HelpIcon,
  FlameIcon,
  // Actions
  PlayIcon,
  PauseIcon,
  ResetIcon,
  PlusIcon,
  EditIcon,
  ShareIcon,
  DeleteIcon,
  DownloadIcon,
  UploadIcon,
  // Navigation
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ProfileIcon,
  TeamIcon,
  SettingsIcon,
  BellIcon,
  MenuIcon,
  // Misc
  RestIcon,
  ChartIcon,
  BookIcon,
  NoteIcon,
  NotesIcon,
  DocumentIcon,
  FolderIcon,
  ArchiveIcon,
  // Mood
  MoodIcon1,
  MoodIcon2,
  MoodIcon3,
  MoodIcon4,
  MoodIcon5,
};

export default icons;
