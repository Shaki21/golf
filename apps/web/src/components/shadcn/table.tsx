/**
 * Table Component - shadcn API compatible wrapper for Catalyst Table
 *
 * NOW POWERED BY CATALYST UI
 *
 * Note: Catalyst Table has different naming conventions:
 * - shadcn TableHeader (thead) = Catalyst TableHead
 * - shadcn TableHead (th) = Catalyst TableHeader
 */

import * as React from "react"
// @ts-ignore - Catalyst components are JS
import {
  Table as CatalystTable,
  TableHead as CatalystTableHead,
  TableBody as CatalystTableBody,
  TableRow as CatalystTableRow,
  TableHeader as CatalystTableHeader,
  TableCell as CatalystTableCell,
} from "../catalyst/table"
import { cn } from "lib/utils"

// Re-export Catalyst components directly for new code
export {
  CatalystTable,
  CatalystTableHead,
  CatalystTableBody,
  CatalystTableRow,
  CatalystTableHeader,
  CatalystTableCell,
}

/**
 * Table - Root table component using Catalyst
 */
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Allow table to bleed to edges */
  bleed?: boolean
  /** Dense/compact row spacing */
  dense?: boolean
  /** Show grid lines between cells */
  grid?: boolean
  /** Striped rows */
  striped?: boolean
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, bleed, dense, grid, striped, children, ...props }, ref) => (
    <CatalystTable
      bleed={bleed}
      dense={dense}
      grid={grid}
      striped={striped}
      className={className}
      {...props}
    >
      {children}
    </CatalystTable>
  )
)
Table.displayName = "Table"

/**
 * TableHeader - thead element (maps to Catalyst TableHead)
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <CatalystTableHead className={className} {...props}>
    {children}
  </CatalystTableHead>
))
TableHeader.displayName = "TableHeader"

/**
 * TableBody - tbody element
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <CatalystTableBody className={className} {...props}>
    {children}
  </CatalystTableBody>
))
TableBody.displayName = "TableBody"

/**
 * TableFooter - tfoot element (not in Catalyst, keep custom)
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-zinc-950/10 bg-zinc-50 font-medium dark:border-white/10 dark:bg-zinc-900 [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/**
 * TableRow - tr element
 */
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  href?: string
  target?: string
  title?: string
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, href, target, title, children, ...props }, ref) => (
    <CatalystTableRow
      href={href}
      target={target}
      title={title}
      className={className}
      {...props}
    >
      {children}
    </CatalystTableRow>
  )
)
TableRow.displayName = "TableRow"

/**
 * TableHead - th element (maps to Catalyst TableHeader)
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <CatalystTableHeader className={className} {...props}>
    {children}
  </CatalystTableHeader>
))
TableHead.displayName = "TableHead"

/**
 * TableCell - td element
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <CatalystTableCell className={className} {...props}>
    {children}
  </CatalystTableCell>
))
TableCell.displayName = "TableCell"

/**
 * TableCaption - caption element (not in Catalyst, keep custom)
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-zinc-500 dark:text-zinc-400", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
