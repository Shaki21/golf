/**
 * Templates - Page-Level Layouts
 *
 * Complete page templates that combine primitives, raw-blocks, and composites
 * into production-ready layouts following common UI patterns.
 */

export { default as DashboardTemplate } from './DashboardTemplate.template';
export { default as ListTemplate } from './ListTemplate.template';
export { default as ProfileTemplate } from './ProfileTemplate.template';
export { default as SettingsTemplate } from './SettingsTemplate.template';
export { default as FormTemplate } from './FormTemplate.template';
export { default as DetailTemplate } from './DetailTemplate.template';

// New reusable templates
export { default as AppShellTemplate } from './AppShellTemplate';
export { default as StatsGridTemplate } from './StatsGridTemplate';
export type { StatsItem } from './StatsGridTemplate';
export { ListTemplate as ListTemplateV2 } from './ListTemplate';
export type { ListItem, ListSection } from './ListTemplate';
export { CardGridTemplate } from './CardGridTemplate';
export type { CardItem } from './CardGridTemplate';
