/**
 * Primitives - Atomic UI Elements
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * The most basic building blocks of the UI system.
 * These components are used to compose more complex components.
 */

// Core primitives (Premium Light v1.0)
export { default as Button } from './Button';
export { default as Card, SessionCard, StatsCard } from './Card';
export { default as Badge, LevelBadge, CategoryBadge } from './Badge';
export { default as Input, TextInput, Textarea, Select } from './Input';
export { default as Avatar, AvatarGroup } from './Avatar';
export { ProgressBar, CircularProgress, GoalProgress } from './Progress';

// Supporting primitives
export { default as Text } from './Text.primitive';
export { default as Spinner } from './Spinner.primitive';
export { default as Divider } from './Divider.primitive';
export { default as Switch } from './Switch.primitive';
export { default as Checkbox } from './Checkbox.primitive';
export { default as Alert } from './Alert.primitive';

// Typography (re-exported from components/typography)
export { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from './typography';

// Legacy exports (deprecated - use new components above)
// export { default as BadgeLegacy } from './Badge.legacy';
// export { default as AvatarLegacy } from './Avatar.legacy';
// export { ProgressBar as ProgressBarLegacy } from './ProgressBar.legacy';
