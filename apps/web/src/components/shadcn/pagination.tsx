/**
 * Pagination Component - shadcn API compatible wrapper for Catalyst Pagination
 *
 * NOW POWERED BY CATALYST UI
 */

import * as React from "react";
// @ts-ignore - Catalyst components are JS
import {
  Pagination as CatalystPagination,
  PaginationPrevious as CatalystPaginationPrevious,
  PaginationNext as CatalystPaginationNext,
  PaginationList as CatalystPaginationList,
  PaginationPage as CatalystPaginationPage,
  PaginationGap as CatalystPaginationGap,
} from "../catalyst/pagination";
import { cn } from "lib/utils";

// Re-export Catalyst components directly for new code
export {
  CatalystPagination,
  CatalystPaginationPrevious,
  CatalystPaginationNext,
  CatalystPaginationList,
  CatalystPaginationPage,
  CatalystPaginationGap,
};

/**
 * Pagination - Root nav component
 */
interface PaginationProps {
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
}

const Pagination = ({ className, children, ...props }: PaginationProps) => (
  <CatalystPagination className={cn("mx-auto flex w-full justify-center", className)} {...props}>
    {children}
  </CatalystPagination>
);
Pagination.displayName = "Pagination";

/**
 * PaginationContent - List wrapper (maps to Catalyst PaginationList)
 */
interface PaginationContentProps {
  className?: string;
  children?: React.ReactNode;
}

const PaginationContent = ({ className, children }: PaginationContentProps) => (
  <CatalystPaginationList className={cn("flex flex-row items-center gap-1", className)}>
    {children}
  </CatalystPaginationList>
);
PaginationContent.displayName = "PaginationContent";

/**
 * PaginationItem - Wrapper for pagination items (pass-through for compatibility)
 */
const PaginationItem = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, ...props }, ref) => (
  <span ref={ref} className={className} {...props} />
));
PaginationItem.displayName = "PaginationItem";

/**
 * PaginationLink - Page link (maps to Catalyst PaginationPage)
 */
interface PaginationLinkProps {
  isActive?: boolean;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

const PaginationLink = ({
  className,
  isActive,
  href,
  children,
}: PaginationLinkProps) => (
  <CatalystPaginationPage
    href={href}
    current={isActive}
    className={className}
  >
    {children}
  </CatalystPaginationPage>
);
PaginationLink.displayName = "PaginationLink";

/**
 * PaginationPrevious - Previous page button
 */
interface PaginationPreviousProps {
  className?: string;
  href?: string | null;
  children?: React.ReactNode;
}

const PaginationPrevious = ({
  className,
  href,
  children = "Forrige",
}: PaginationPreviousProps) => {
  const Comp = CatalystPaginationPrevious as any;
  return (
    <Comp href={href} className={className}>
      {children}
    </Comp>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

/**
 * PaginationNext - Next page button
 */
interface PaginationNextProps {
  className?: string;
  href?: string | null;
  children?: React.ReactNode;
}

const PaginationNext = ({
  className,
  href,
  children = "Neste",
}: PaginationNextProps) => {
  const Comp = CatalystPaginationNext as any;
  return (
    <Comp href={href} className={className}>
      {children}
    </Comp>
  );
};
PaginationNext.displayName = "PaginationNext";

/**
 * PaginationEllipsis - Gap indicator (maps to Catalyst PaginationGap)
 */
interface PaginationEllipsisProps {
  className?: string;
}

const PaginationEllipsis = ({ className }: PaginationEllipsisProps) => (
  <CatalystPaginationGap className={className} />
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
