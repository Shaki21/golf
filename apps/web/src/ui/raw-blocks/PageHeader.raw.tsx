/**
 * ============================================================
 * PageHeader - TIER Golf Design System v1.0
 * ============================================================
 *
 * Full-width page header with max-width content container.
 * Follows TIER spacing scale (4px base unit).
 *
 * ARCHITECTURE:
 * - Full-width background (bg-tier-white)
 * - Max-width content (1200px)
 * - Responsive padding (16/24/32px)
 * - Sticky positioning optional
 * - Zero inline styles (except dynamic values)
 *
 * ============================================================
 */

import React from 'react';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { PageTitle } from '../../components/typography';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/shadcn/tooltip';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/shadcn/tabs';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

export interface PageHeaderProps {
  /** Page title (renders as h1) */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Help text shown in tooltip when hovering over help icon */
  helpText?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons (right side) */
  actions?: React.ReactNode;
  /** Back button handler */
  onBack?: () => void;
  /** Show bottom border */
  divider?: boolean;
  /** Sticky header - defaults to true when tabs are present */
  sticky?: boolean;
  /** Custom className for header */
  className?: string;
  /** Tab configuration */
  tabs?: {
    items: TabItem[];
    defaultTab?: string;
    onTabChange?: (tabId: string) => void;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  helpText,
  breadcrumbs,
  actions,
  onBack,
  divider = true,
  sticky,
  className = '',
  tabs,
}) => {
  // Default sticky to true when tabs are present
  const isSticky = sticky !== undefined ? sticky : tabs !== undefined;

  return (
    <header
      className={`
        w-full bg-tier-white rounded-[14px]
        ${divider ? 'border-b border-tier-border-default' : ''}
        ${isSticky ? 'sticky top-0 z-50 backdrop-blur-sm bg-tier-white/95' : ''}
        ${className}
      `.trim()}
    >
      {/* Full-width container with responsive padding */}
      <div className="w-full px-4 md:px-6 lg:px-8">
        {/* Max-width content area */}
        <div className="max-w-[1200px] mx-auto py-4 md:py-5">

          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              className="flex items-center gap-2 mb-3 flex-wrap text-tier-footnote"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className="text-tier-text-tertiary mx-1">/</span>
                  )}
                  {crumb.href || crumb.onClick ? (
                    <a
                      href={crumb.href}
                      onClick={(e) => {
                        if (crumb.onClick) {
                          e.preventDefault();
                          crumb.onClick();
                        }
                      }}
                      className={`
                        text-tier-text-secondary hover:text-tier-navy
                        transition-colors duration-150
                        ${index === breadcrumbs.length - 1 ? 'text-tier-text-primary font-medium' : ''}
                      `.trim()}
                      aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-tier-text-secondary">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title Section */}
          <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
            {/* Left: Back button + Title */}
            <div className="flex items-start gap-3 flex-1 min-w-0">

              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="
                    p-2 rounded-lg bg-transparent
                    text-tier-text-secondary hover:text-tier-navy
                    hover:bg-tier-surface-subtle
                    transition-all duration-150
                    flex items-center justify-center
                    mt-1
                  "
                  aria-label="Go back"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Title and Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <PageTitle className="text-tier-title1 md:text-[28px] font-bold text-tier-navy leading-tight m-0">
                    {title}
                  </PageTitle>
                  {helpText && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 text-tier-text-tertiary hover:text-tier-navy transition-colors duration-150"
                            aria-label="Hjelp"
                          >
                            <HelpCircle size={20} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-xs text-sm"
                        >
                          <p>{helpText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {subtitle && (
                  <p className="text-tier-subheadline text-tier-text-secondary mt-1 leading-normal">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            {actions && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      {tabs && tabs.items.length > 0 && (
        <Tabs
          defaultValue={tabs.defaultTab || tabs.items[0].id}
          onValueChange={tabs.onTabChange}
          className="w-full"
        >
          {/* Tabs List */}
          <div className="w-full px-4 md:px-6 lg:px-8 border-t border-tier-border-default">
            <div className="max-w-[1200px] mx-auto">
              <TabsList className="h-12 bg-transparent p-0 gap-4 rounded-none border-b-0 w-full justify-start">
                {tabs.items.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="
                      h-12 px-4 bg-transparent rounded-none
                      text-tier-text-secondary font-medium text-sm
                      border-b-2 border-transparent
                      data-[state=active]:bg-transparent
                      data-[state=active]:text-tier-navy
                      data-[state=active]:border-tier-primary
                      data-[state=active]:shadow-none
                      hover:text-tier-navy hover:bg-tier-surface-subtle/50
                      transition-all duration-150
                    "
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Tabs Content */}
          {tabs.items.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-0 ring-offset-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </header>
  );
};

export default PageHeader;
