/**
 * TIER Golf - Dynamic Icon Component
 *
 * Use this when you need to render icons by name (e.g., from config/data).
 *
 * Usage:
 *   <Icon name="golf-flag" size={24} />
 *   <Icon name="target" color="#1a5f2a" />
 */

import React from 'react';
import { IconProps, IconName } from './index';

// Navigation
import { HomeIcon, StatsIcon, VideoIcon, LessonsIcon, ProfileIcon, SettingsIcon, NotificationsIcon, ChatIcon, CalendarIcon, SearchIcon } from './navigation';

// Actions
import { PlayIcon, PauseIcon, RewindIcon, ForwardIcon, RefreshIcon, EditIcon, DeleteIcon, AddIcon, CloseIcon, CheckIcon } from './actions';

// Golf
import { GolfFlagIcon, GolfBallIcon, TargetIcon, SwingIcon, GreenIcon, ClubIcon, ScorecardIcon, DistanceIcon, HandicapIcon } from './golf';

// Analysis
import { AngleIcon, LineIcon, CircleDrawIcon, ArrowIcon, TextIcon, UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, FullscreenIcon } from './analysis';

// Status
import { TrendUpIcon, TrendDownIcon, StarFilledIcon, StarEmptyIcon, SuccessIcon, ErrorIcon, WarningIcon, InfoIcon, OnlineIcon, OfflineIcon } from './status';

// Utility
import { MenuIcon, MoreIcon, ChevronRightIcon, ChevronDownIcon, BackIcon, ShareIcon, DownloadIcon, UploadIcon, FilterIcon, LockIcon } from './utility';

const iconMap: Record<IconName, React.ComponentType<IconProps>> = {
  // Navigation
  'home': HomeIcon,
  'stats': StatsIcon,
  'video': VideoIcon,
  'lessons': LessonsIcon,
  'profile': ProfileIcon,
  'settings': SettingsIcon,
  'notifications': NotificationsIcon,
  'chat': ChatIcon,
  'calendar': CalendarIcon,
  'search': SearchIcon,

  // Actions
  'play': PlayIcon,
  'pause': PauseIcon,
  'rewind': RewindIcon,
  'forward': ForwardIcon,
  'refresh': RefreshIcon,
  'edit': EditIcon,
  'delete': DeleteIcon,
  'add': AddIcon,
  'close': CloseIcon,
  'check': CheckIcon,

  // Golf
  'golf-flag': GolfFlagIcon,
  'golf-ball': GolfBallIcon,
  'target': TargetIcon,
  'swing': SwingIcon,
  'green': GreenIcon,
  'club': ClubIcon,
  'scorecard': ScorecardIcon,
  'distance': DistanceIcon,
  'handicap': HandicapIcon,

  // Analysis
  'angle': AngleIcon,
  'line': LineIcon,
  'circle-draw': CircleDrawIcon,
  'arrow': ArrowIcon,
  'text': TextIcon,
  'undo': UndoIcon,
  'redo': RedoIcon,
  'zoom-in': ZoomInIcon,
  'zoom-out': ZoomOutIcon,
  'fullscreen': FullscreenIcon,

  // Status
  'trend-up': TrendUpIcon,
  'trend-down': TrendDownIcon,
  'star-filled': StarFilledIcon,
  'star-empty': StarEmptyIcon,
  'success': SuccessIcon,
  'error': ErrorIcon,
  'warning': WarningIcon,
  'info': InfoIcon,
  'online': OnlineIcon,
  'offline': OfflineIcon,

  // Utility
  'menu': MenuIcon,
  'more': MoreIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-down': ChevronDownIcon,
  'back': BackIcon,
  'share': ShareIcon,
  'download': DownloadIcon,
  'upload': UploadIcon,
  'filter': FilterIcon,
  'lock': LockIcon,
};

interface DynamicIconProps extends IconProps {
  name: IconName;
}

export const Icon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent {...props} />;
};

export default Icon;
