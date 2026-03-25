/**
 * Page Reference Implementation
 *
 * This is the CANONICAL example of how to build pages.
 * Copy this structure exactly when creating new pages.
 *
 * DO NOT:
 * - Add inline styles
 * - Use hex colors
 * - Create alternative layouts
 * - Deviate from this structure
 */

import React, { useState } from 'react';
import { Page } from '../components/Page';
import { Button, Input, Badge, Text } from '../primitives';

// ============================================================================
// REFERENCE PAGE COMPONENT
// ============================================================================

export function PageReference() {
  const [pageState, setPageState] = useState<'idle' | 'loading' | 'error' | 'empty' | 'unauthorized'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Simulated data
  const stats = [
    { label: 'Total Sessions', value: '127', trend: '+12%' },
    { label: 'Avg. Score', value: '72.4', trend: '-2.1' },
    { label: 'Practice Hours', value: '48h', trend: '+8h' },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'recent', label: 'Recent' },
    { id: 'favorites', label: 'Favorites' },
  ];

  return (
    <Page state={pageState} maxWidth="xl">
      {/* ================================================================
          PAGE.HEADER
          - Contains H1 (page title)
          - Primary page actions on the right
          - Optional breadcrumbs above title
          ================================================================ */}
      <Page.Header
        title="Reference Page"
        subtitle="This is the canonical page structure"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'UI Lab', href: '/ui-lab' },
          { label: 'Reference' },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm">
              Export
            </Button>
            <Button variant="primary" size="sm">
              New Action
            </Button>
          </>
        }
      />

      {/* ================================================================
          PAGE.TOOLBAR
          - Filters, search, tabs
          - Never contains primary actions (those go in Header)
          ================================================================ */}
      <Page.Toolbar>
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </Page.Toolbar>

      {/* ================================================================
          PAGE.CONTENT
          - Wrapper for all page sections
          - Handles loading/error/empty/unauthorized states automatically
          - Layout modes: default (stack), grid, split
          ================================================================ */}
      <Page.Content layout="default">
        {/* ================================================================
            PAGE.SECTION
            - Contains H2 (section title)
            - Section-specific actions in header
            - Card wrapper by default (card={true})
            ================================================================ */}
        <Page.Section
          title="Statistics"
          description="Overview of your performance"
          actions={
            <Button variant="ghost" size="sm">
              View all
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 bg-ak-surface-subtle rounded-lg"
              >
                <Text variant="footnote" color="secondary">
                  {stat.label}
                </Text>
                <div className="flex items-baseline gap-2 mt-1">
                  <Text variant="title1" color="primary">
                    {stat.value}
                  </Text>
                  <Badge
                    variant={stat.trend.startsWith('+') ? 'success' : 'default'}
                    size="sm"
                  >
                    {stat.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Page.Section>

        <Page.Section
          title="Content"
          description="Main content for this page"
          collapsible
        >
          <div className="space-y-4">
            <Text>
              This is the main content. All page content should be within
              Page.Section components for consistent spacing and structure.
            </Text>
            <Text color="secondary">
              Sections can be collapsed by setting collapsible={'{true}'}.
            </Text>
          </div>
        </Page.Section>

        {/* Section without card wrapper */}
        <Page.Section title="Without card frame" card={false}>
          <div className="p-4 border border-dashed border-ak-border-default rounded-lg">
            <Text color="secondary">
              This section has card={'{false}'} and is displayed without a background.
            </Text>
          </div>
        </Page.Section>
      </Page.Content>

      {/* ================================================================
          PAGE.FOOTER
          - Pagination
          - Secondary actions
          - Optional sticky positioning
          ================================================================ */}
      <Page.Footer>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled>
            Previous
          </Button>
          <Text variant="footnote" color="secondary">
            Page 1 of 10
          </Text>
          <Button variant="ghost" size="sm">
            Next
          </Button>
        </div>
      </Page.Footer>

      {/* ================================================================
          DEV: State Toggle (remove in production)
          ================================================================ */}
      <div className="fixed bottom-4 right-4 bg-ak-surface-card p-4 rounded-lg shadow-ak-elevated z-50">
        <Text variant="caption1" color="secondary" className="mb-2 block">
          Page State (dev only):
        </Text>
        <div className="flex flex-wrap gap-2">
          {(['idle', 'loading', 'error', 'empty', 'unauthorized'] as const).map((state) => (
            <Button
              key={state}
              variant={pageState === state ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPageState(state)}
            >
              {state}
            </Button>
          ))}
        </div>
      </div>
    </Page>
  );
}

export default PageReference;
