/**
 * TIER Golf - Custom Icon Library
 *
 * Usage:
 *   import { GolfFlagIcon, TargetIcon, HomeIcon } from '@/components/icons';
 *
 *   <GolfFlagIcon size={24} color="#1a5f2a" />
 *   <TargetIcon size={20} />
 *   <HomeIcon />
 */

// Types
export type { IconProps } from './types';
export { defaultIconProps } from './types';

// Navigation Icons
export {
  HomeIcon,
  StatsIcon,
  VideoIcon,
  LessonsIcon,
  ProfileIcon,
  SettingsIcon,
  NotificationsIcon,
  ChatIcon,
  CalendarIcon,
  SearchIcon,
} from './navigation';

// Action Icons
export {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ForwardIcon,
  RefreshIcon,
  EditIcon,
  DeleteIcon,
  AddIcon,
  CloseIcon,
  CheckIcon,
} from './actions';

// Golf Specific Icons
export {
  GolfFlagIcon,
  GolfBallIcon,
  TargetIcon,
  SwingIcon,
  GreenIcon,
  ClubIcon,
  ScorecardIcon,
  DistanceIcon,
  HandicapIcon,
} from './golf';

// Analysis Tool Icons
export {
  AngleIcon,
  LineIcon,
  CircleDrawIcon,
  ArrowIcon,
  TextIcon,
  UndoIcon,
  RedoIcon,
  ZoomInIcon,
  ZoomOutIcon,
  FullscreenIcon,
} from './analysis';

// Status & Metrics Icons
export {
  TrendUpIcon,
  TrendDownIcon,
  StarFilledIcon,
  StarEmptyIcon,
  SuccessIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  OnlineIcon,
  OfflineIcon,
} from './status';

// Utility/Misc Icons
export {
  MenuIcon,
  MoreIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BackIcon,
  ShareIcon,
  DownloadIcon,
  UploadIcon,
  FilterIcon,
  LockIcon,
} from './utility';

// Dynamic Icon Component (for rendering by name)
export { Icon, default as DynamicIcon } from './Icon';

// Legacy Icons (for backwards compatibility)
export {
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
  TeknikIcon,
  GolfslagIcon,
  SpillIcon,
  KonkurranseIcon,
  FysiskIcon,
  MentalIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  HelpIcon,
  ResetIcon,
  PlusIcon,
  UserIcon,
  BellIcon,
  ChartIcon,
  FlameIcon,
  BookIcon,
  DocumentIcon,
  FolderIcon,
  NotesIcon,
  ArchiveIcon,
  NoteIcon,
  RestIcon,
  TeamIcon,
  MoodIcon1,
  MoodIcon2,
  MoodIcon3,
  MoodIcon4,
  MoodIcon5,
  SessionTypeIcons,
  getSessionIcon,
} from './legacy-icons';

// Icon name type for dynamic usage
export type IconName =
  // Navigation
  | 'home' | 'stats' | 'video' | 'lessons' | 'profile' | 'settings'
  | 'notifications' | 'chat' | 'calendar' | 'search'
  // Actions
  | 'play' | 'pause' | 'rewind' | 'forward' | 'refresh' | 'edit'
  | 'delete' | 'add' | 'close' | 'check'
  // Golf
  | 'golf-flag' | 'golf-ball' | 'target' | 'swing' | 'green' | 'club'
  | 'scorecard' | 'distance' | 'handicap'
  // Analysis
  | 'angle' | 'line' | 'circle-draw' | 'arrow' | 'text' | 'undo'
  | 'redo' | 'zoom-in' | 'zoom-out' | 'fullscreen'
  // Status
  | 'trend-up' | 'trend-down' | 'star-filled' | 'star-empty' | 'success'
  | 'error' | 'warning' | 'info' | 'online' | 'offline'
  // Utility
  | 'menu' | 'more' | 'chevron-right' | 'chevron-down' | 'back' | 'share'
  | 'download' | 'upload' | 'filter' | 'lock';
