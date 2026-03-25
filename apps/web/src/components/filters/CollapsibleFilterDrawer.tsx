/**
 * CollapsibleFilterDrawer - Reusable collapsible filter panel
 * TIER Golf Design System v1.0
 *
 * Provides a consistent filter UI pattern with tier colors and animations.
 */

import React from 'react';
import { Filter, X } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../shadcn/collapsible';
import { Badge } from '../shadcn/badge';
import { Button } from '../shadcn/button';
import Card from '../../ui/primitives/Card';

interface CollapsibleFilterDrawerProps {
  /** Number of active filters (0 = none) */
  activeFilterCount?: number;
  /** Whether the drawer is open */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Filter controls to display inside drawer */
  children: React.ReactNode;
  /** Optional label for trigger button */
  label?: string;
  /** Optional callback to clear all filters */
  onClearAll?: () => void;
}

/**
 * Collapsible filter drawer with tier design tokens
 *
 * @example
 * <CollapsibleFilterDrawer
 *   activeFilterCount={2}
 *   onClearAll={clearFilters}
 * >
 *   <div className="space-y-4">
 *     <FilterControl label="Status" />
 *     <FilterControl label="Category" />
 *   </div>
 * </CollapsibleFilterDrawer>
 */
export function CollapsibleFilterDrawer({
  activeFilterCount = 0,
  isOpen = false,
  onOpenChange,
  children,
  label = 'Filters',
  onClearAll,
}: CollapsibleFilterDrawerProps) {
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-3 mb-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-tier-navy/20 text-tier-navy hover:bg-tier-navy/5 hover:border-tier-navy/40 transition-all"
          >
            <Filter size={16} className="text-tier-gold" />
            {label}
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 bg-tier-gold text-tier-navy font-semibold"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>

        {hasActiveFilters && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-tier-text-secondary hover:text-tier-navy hover:bg-tier-navy/5"
          >
            <X size={16} className="mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <Card
          variant="default"
          className="border-tier-navy/20 bg-tier-surface-subtle mb-4"
          padding="md"
        >
          {children}
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Filter control wrapper for consistent spacing
 */
export function FilterControl({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-tier-navy mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
