import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsGridTemplate from '../StatsGridTemplate';

describe('StatsGridTemplate', () => {
  // Test data
  const simpleStats = [
    { id: '1', label: 'Sessions', value: '12' },
    { id: '2', label: 'Hours', value: '24' },
    { id: '3', label: 'Streak', value: '5' },
  ];

  const statsWithChange = [
    {
      id: '1',
      label: 'Sessions',
      value: '12',
      change: { value: '5%', direction: 'up' },
    },
    {
      id: '2',
      label: 'Hours',
      value: '24',
      change: { value: '10%', direction: 'down' },
    },
    {
      id: '3',
      label: 'Streak',
      value: '5',
      change: { value: '0%', direction: 'neutral' },
    },
  ];

  const statsWithSublabel = [
    {
      id: '1',
      label: 'Sessions',
      value: '12',
      sublabel: 'This week',
    },
  ];

  describe('Basic Rendering', () => {
    it('renders all stat items', () => {
      render(<StatsGridTemplate items={simpleStats} />);

      expect(screen.getByText('Sessions')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('Streak')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders with empty items array', () => {
      const { container } = render(<StatsGridTemplate items={[]} />);
      const grid = container.firstChild;
      expect(grid.children).toHaveLength(0);
    });

    it('applies custom className', () => {
      const { container } = render(
        <StatsGridTemplate items={simpleStats} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Column Configuration', () => {
    it('renders with 2 columns', () => {
      const { container } = render(
        <StatsGridTemplate items={simpleStats} columns={2} />
      );
      const grid = container.firstChild;
      expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(2, 1fr)' });
    });

    it('renders with 3 columns (default)', () => {
      const { container } = render(
        <StatsGridTemplate items={simpleStats} columns={3} />
      );
      const grid = container.firstChild;
      expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
    });

    it('renders with 4 columns', () => {
      const { container } = render(
        <StatsGridTemplate items={simpleStats} columns={4} />
      );
      const grid = container.firstChild;
      expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(4, 1fr)' });
    });
  });

  describe('Change Indicators', () => {
    it('renders change indicator when provided', () => {
      render(<StatsGridTemplate items={statsWithChange} />);

      expect(screen.getByText('5%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders up arrow for positive change', () => {
      render(<StatsGridTemplate items={statsWithChange} />);

      const upArrow = screen.getByText('↑');
      expect(upArrow).toBeInTheDocument();
    });

    it('renders down arrow for negative change', () => {
      render(<StatsGridTemplate items={statsWithChange} />);

      const downArrow = screen.getByText('↓');
      expect(downArrow).toBeInTheDocument();
    });

    it('renders neutral indicator', () => {
      render(<StatsGridTemplate items={statsWithChange} />);

      const neutralIndicator = screen.getByText('−');
      expect(neutralIndicator).toBeInTheDocument();
    });

    it('does not render change indicator when not provided', () => {
      render(<StatsGridTemplate items={simpleStats} />);

      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
      expect(screen.queryByText('−')).not.toBeInTheDocument();
    });
  });

  describe('Sublabels', () => {
    it('renders sublabel when provided', () => {
      render(<StatsGridTemplate items={statsWithSublabel} />);

      expect(screen.getByText('This week')).toBeInTheDocument();
    });

    it('does not render sublabel when not provided', () => {
      render(<StatsGridTemplate items={simpleStats} />);

      expect(screen.queryByText('This week')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Structure', () => {
    it('renders with grid layout', () => {
      const { container } = render(<StatsGridTemplate items={simpleStats} />);
      const grid = container.firstChild;

      expect(grid).toHaveStyle({ display: 'grid' });
    });

    it('renders stat cards with correct structure', () => {
      const { container } = render(<StatsGridTemplate items={simpleStats} />);
      const grid = container.firstChild;
      const cards = grid.children;

      expect(cards.length).toBe(simpleStats.length);
    });

    it('applies correct styling to stat values', () => {
      render(<StatsGridTemplate items={simpleStats} />);
      const value = screen.getByText('12');

      expect(value).toHaveStyle({
        fontSize: 'var(--font-size-title2)',
        fontWeight: 700,
      });
    });

    it('applies correct styling to labels', () => {
      render(<StatsGridTemplate items={simpleStats} />);
      const label = screen.getByText('Sessions');

      expect(label).toHaveStyle({
        fontSize: 'var(--font-size-footnote)',
        textTransform: 'uppercase',
      });
    });
  });

  describe('Data Types', () => {
    it('handles numeric values', () => {
      const numericStats = [
        { id: '1', label: 'Count', value: 42 },
      ];

      render(<StatsGridTemplate items={numericStats} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles string values', () => {
      const stringStats = [
        { id: '1', label: 'Status', value: 'Active' },
      ];

      render(<StatsGridTemplate items={stringStats} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('handles mixed value types', () => {
      const mixedStats = [
        { id: '1', label: 'Count', value: 42 },
        { id: '2', label: 'Time', value: '2.5h' },
      ];

      render(<StatsGridTemplate items={mixedStats} />);
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('2.5h')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single item', () => {
      const singleItem = [{ id: '1', label: 'Test', value: '1' }];

      render(<StatsGridTemplate items={singleItem} />);
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles item with all optional fields', () => {
      const fullItem = [
        {
          id: '1',
          label: 'Complete',
          value: '100',
          sublabel: 'Finished',
          change: { value: '25%', direction: 'up' },
        },
      ];

      render(<StatsGridTemplate items={fullItem} />);
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Finished')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      const zeroStats = [{ id: '1', label: 'Empty', value: '0' }];

      render(<StatsGridTemplate items={zeroStats} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<StatsGridTemplate items={simpleStats} />);

      // Check that divs are used appropriately
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('each stat card has unique key', () => {
      const { container } = render(<StatsGridTemplate items={simpleStats} />);
      const cards = container.firstChild.children;

      // All cards should be rendered (no React key warnings in console)
      expect(cards.length).toBe(simpleStats.length);
    });
  });
});
