/**
 * UI Components
 *
 * Higher-level components built from primitives and composites.
 */

// Page System (MANDATORY for all pages)
export { Page } from './Page';
export type {
  PageProps,
  PageHeaderProps,
  PageToolbarProps,
  PageContentProps,
  PageSectionProps,
  PageAsideProps,
  PageFooterProps,
  PageState,
} from './Page';

// Auth Page System (for standalone auth flows)
export { AuthPage, useAuthPage } from './AuthPage';
export type {
  AuthPageProps,
  AuthPageLogoProps,
  AuthPageCardProps,
  AuthPageFooterProps,
  AuthPageState,
} from './AuthPage';

// Typography
export * from './typography';

// Error States
export { default as EnhancedErrorState } from './EnhancedErrorState';
