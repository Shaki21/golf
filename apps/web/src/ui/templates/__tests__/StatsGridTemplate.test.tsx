import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsGridTemplate, { StatsItem } from '../StatsGridTemplate';

describe('StatsGridTemplate', () => {
  const mockStatsSimple: StatsItem[] = [
    {
      id: 'stat-1',
      label: 'Sessions',
      value: 12,
    },
    {
      id: 'stat-2',
      label: 'Hours',
      value: '24.5',
      sublabel: 'This week',
    },
  ];

  const mockStatsWithTrends: StatsItem[] = [
    {
      id: 'stat-1',
      label: 'Sessions',
      value: 12,
      change: {
        value: '+3',
        direction: 'up',
      },
    },
    {
      id: 'stat-2',
      label: 'Hours',
      value: '24.5',
      change: {
        value: '-1.5',
        direction: 'down',
      },
    },
    {
      id: 'stat-3',
      label: 'Streak',
      value: 7,
      change: {
        value: '0',
        direction: 'neutral',
      },
    },
  ];

  describe('Basic Rendering', () => {
    it('renders all stat items', () => {
      render(<StatsGridTemplate items={mockStatsSimple} />);

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Sessions')).toBeInTheDocument();
      expect(screen.getByText('24.5')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
    });

    it('renders sublabels when provided', () => {
      render(<StatsGridTemplate items={mockStatsSimple} />);
      expect(screen.getByText('This week')).toBeInTheDocument();
    });

    it('renders empty grid when no items', () => {
      const { container } = render(<StatsGridTemplate items={[]} />);
      const grid = container.firstChild;
      expect(grid).toBeEmptyDOMElement();
    });
  });

  describe('Change Indicators', () => {
    it('renders trend indicators when change provided', () => {
      render(<StatsGridTemplate items={mockStatsWithTrends} />);

      expect(screen.getByText('+3')).toBeInTheDocument();
      expect(screen.getByText('-1.5')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('displays correct trend icons', () => {
      render(<StatsGridTemplate items={mockStatsWithTrends} />);

      // Check for up/down/neutral indicators
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('−')).toBeInTheDocument();
    });

    it('does not render trend when change not provided', () => {
      render(<StatsGridTemplate items={mockStatsSimple} />);

      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('applies custom column count', () => {
      const { container } = render(
        <StatsGridTemplate items={mockStatsSimple} columns={3} />
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('uses auto-responsive grid when columns not specified', () => {
      const { container } = render(<StatsGridTemplate items={mockStatsSimple} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(150px, 1fr))');
    });

    it('accepts 2, 3, or 4 columns', () => {
      const { container: container2 } = render(
        <StatsGridTemplate items={mockStatsSimple} columns={2} />
      );
      const { container: container3 } = render(
        <StatsGridTemplate items={mockStatsSimple} columns={3} />
      );
      const { container: container4 } = render(
        <StatsGridTemplate items={mockStatsSimple} columns={4} />
      );

      expect((container2.firstChild as HTMLElement).style.gridTemplateColumns).toBe('repeat(2, 1fr)');
      expect((container3.firstChild as HTMLElement).style.gridTemplateColumns).toBe('repeat(3, 1fr)');
      expect((container4.firstChild as HTMLElement).style.gridTemplateColumns).toBe('repeat(4, 1fr)');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StatsGridTemplate items={mockStatsSimple} className="custom-stats" />
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid.classList.contains('custom-stats')).toBe(true);
    });

    it('renders stat cards with proper structure', () => {
      const { container } = render(<StatsGridTemplate items={mockStatsSimple} />);

      // Check that we have the grid container and stat items
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
      expect(grid.children.length).toBe(2); // Two stat cards
    });
  });

  describe('Edge Cases', () => {
    it('handles numeric and string values', () => {
      const mixedItems: StatsItem[] = [
        { id: '1', label: 'Count', value: 42 },
        { id: '2', label: 'Score', value: '98.5%' },
        { id: '3', label: 'Rank', value: '1st' },
      ];

      render(<StatsGridTemplate items={mixedItems} />);

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('98.5%')).toBeInTheDocument();
      expect(screen.getByText('1st')).toBeInTheDocument();
    });

    it('handles long labels gracefully', () => {
      const longLabelItem: StatsItem[] = [
        {
          id: '1',
          label: 'Very Long Label That Should Wrap',
          value: 100,
        },
      ];

      render(<StatsGridTemplate items={longLabelItem} />);
      expect(screen.getByText('Very Long Label That Should Wrap')).toBeInTheDocument();
    });

    it('handles zero and negative values', () => {
      const edgeItems: StatsItem[] = [
        { id: '1', label: 'Zero', value: 0 },
        { id: '2', label: 'Negative', value: -5 },
      ];

      render(<StatsGridTemplate items={edgeItems} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('-5')).toBeInTheDocument();
    });
  });
});
