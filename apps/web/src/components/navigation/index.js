/**
 * Navigation Components
 *
 * Left Rail + Flyout Navigation System
 * Designed for premium professional golf development platform.
 *
 * Exports:
 * - AppShellV2: Complete application shell with navigation
 * - NavigationProvider: Context provider for navigation state
 * - useNavigation: Hook to access navigation state
 * - SideNavigationDesktop: Desktop rail + flyout navigation
 * - SideNavigationMobile: Mobile header + drawer navigation
 * - NavRail: Rail primitive
 * - NavFlyout: Flyout primitive
 * - navigationSections: Navigation data structure
 */

export { default as AppShellV2 } from './AppShellV2';
export { NavigationProvider, useNavigation } from './NavigationContext';
export { default as SideNavigationDesktop } from './SideNavigationDesktop';
export { default as SideNavigationMobile } from './SideNavigationMobile';
export { default as NavRail } from './NavRail';
export { default as NavFlyout } from './NavFlyout';
export { navigationSections, getSectionById, getSectionByPath } from './navigationData';

// Area Tabs for hub pages
export { AreaTabs, areaTabs } from './AreaTabs';
