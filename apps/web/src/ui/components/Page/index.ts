/**
 * Page Component System
 *
 * MANDATORY for all application pages.
 *
 * Usage:
 * ```tsx
 * import { Page } from '@/ui/components/Page';
 *
 * function MyPage() {
 *   return (
 *     <Page state="idle">
 *       <Page.Header title="Page Title" actions={<Button>Action</Button>} />
 *       <Page.Toolbar>
 *         <SearchInput />
 *         <FilterTabs />
 *       </Page.Toolbar>
 *       <Page.Content>
 *         <Page.Section title="Section 1">
 *           Content here
 *         </Page.Section>
 *         <Page.Section title="Section 2" card={false}>
 *           More content
 *         </Page.Section>
 *       </Page.Content>
 *       <Page.Footer>
 *         <Pagination />
 *       </Page.Footer>
 *     </Page>
 *   );
 * }
 * ```
 */

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
