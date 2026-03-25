/**
 * QuickFilterTabs - Tournament Tab Filters
 * Design System v3.1 - Tailwind CSS
 *
 * Quick filter tabs: All, My tournaments, Junior, Elite, Open
 */

import React from 'react';
import { QuickFilter, QUICK_FILTER_LABELS } from '../types';

interface QuickFilterTabsProps {
  activeTab: QuickFilter;
  onTabChange: (tab: QuickFilter) => void;
}

const TABS: QuickFilter[] = ['alle', 'mine', 'junior', 'elite', 'open'];

export default function QuickFilterTabs({ activeTab, onTabChange }: QuickFilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            activeTab === tab
              ? 'bg-tier-gold text-white border-none'
              : 'bg-white text-tier-text-secondary border border-tier-border-default hover:bg-tier-surface-subtle'
          }`}
        >
          {QUICK_FILTER_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
