import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from '../Tabs.composite';

describe('Tabs.composite', () => {
  const defaultTabs = [
    { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
    { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
  ];

  describe('Basic Rendering', () => {
    it('renders all tabs', () => {
      render(<Tabs tabs={defaultTabs} />);

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('renders first tab as active by default', () => {
      render(<Tabs tabs={defaultTabs} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab1).toHaveAttribute('tabIndex', '0');
    });

    it('renders active tab content', () => {
      render(<Tabs tabs={defaultTabs} />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<Tabs tabs={defaultTabs} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders empty state with no tabs', () => {
      render(<Tabs tabs={[]} />);

      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('switches tabs on click', () => {
      render(<Tabs tabs={defaultTabs} />);

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('calls onChange when tab is clicked', () => {
      const onChange = jest.fn();
      render(<Tabs tabs={defaultTabs} onChange={onChange} />);

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('does not switch to disabled tab', () => {
      const tabsWithDisabled = [
        ...defaultTabs,
        { id: 'tab4', label: 'Tab 4', content: <div>Content 4</div>, disabled: true },
      ];
      render(<Tabs tabs={tabsWithDisabled} />);

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 4' }));

      expect(screen.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.queryByText('Content 4')).not.toBeInTheDocument();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component with defaultActiveTab', () => {
      render(<Tabs tabs={defaultTabs} defaultActiveTab="tab2" />);

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('works as controlled component with activeTab', () => {
      const { rerender } = render(<Tabs tabs={defaultTabs} activeTab="tab2" />);

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      rerender(<Tabs tabs={defaultTabs} activeTab="tab3" />);

      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('activeTab takes precedence over defaultActiveTab', () => {
      render(<Tabs tabs={defaultTabs} activeTab="tab2" defaultActiveTab="tab3" />);

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
    });

    it('in controlled mode, does not change activeTab on click', () => {
      const { rerender } = render(<Tabs tabs={defaultTabs} activeTab="tab1" />);

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

      // activeTab should still be tab1 because component is controlled
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard Navigation - Horizontal', () => {
    it('navigates right with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('navigates left with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} defaultActiveTab="tab2" />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('wraps around at end with ArrowRight', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} defaultActiveTab="tab3" />);

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      tab3.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around at start with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} defaultActiveTab="tab1" />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');
    });

    it('skips disabled tabs in keyboard navigation', async () => {
      const user = userEvent.setup();
      const tabsWithDisabled = [
        defaultTabs[0],
        { ...defaultTabs[1], disabled: true },
        defaultTabs[2],
      ];
      render(<Tabs tabs={tabsWithDisabled} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      // Should skip Tab 2 (disabled) and go to Tab 3
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard Navigation - Vertical', () => {
    it('navigates down with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} orientation="vertical" />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates up with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} orientation="vertical" defaultActiveTab="tab2" />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} orientation="vertical" defaultActiveTab="tab3" />);

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      tab3.focus();

      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} orientation="vertical" />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');
    });

    it('does not respond to horizontal arrow keys in vertical mode', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={defaultTabs} orientation="vertical" />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      // Should still be on Tab 1
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Variant Styles', () => {
    it('renders default variant', () => {
      render(<Tabs tabs={defaultTabs} variant="default" />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toBeInTheDocument();
    });

    it('renders pills variant', () => {
      render(<Tabs tabs={defaultTabs} variant="pills" />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toHaveStyle({
        backgroundColor: 'var(--gray-100)',
        borderRadius: 'var(--radius-md)',
      });
    });

    it('renders underline variant', () => {
      render(<Tabs tabs={defaultTabs} variant="underline" />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toHaveStyle({
        gap: 'var(--spacing-4)',
      });
    });
  });

  describe('Orientation', () => {
    it('renders horizontal orientation by default', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('renders vertical orientation', () => {
      render(<Tabs tabs={defaultTabs} orientation="vertical" />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Icons and Badges', () => {
    it('renders tab with icon', () => {
      const tabsWithIcon = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content</div>, icon: '🏠' },
      ];
      render(<Tabs tabs={tabsWithIcon} />);

      expect(screen.getByText('🏠')).toBeInTheDocument();
    });

    it('renders tab with badge', () => {
      const tabsWithBadge = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content</div>, badge: 5 },
      ];
      render(<Tabs tabs={tabsWithBadge} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders tab with string badge', () => {
      const tabsWithBadge = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content</div>, badge: 'New' },
      ];
      render(<Tabs tabs={tabsWithBadge} />);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders tab with both icon and badge', () => {
      const tabsWithBoth = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content</div>, icon: '🏠', badge: 3 },
      ];
      render(<Tabs tabs={tabsWithBoth} />);

      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('applies full width styles', () => {
      render(<Tabs tabs={defaultTabs} fullWidth />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toHaveStyle({ width: '100%' });
    });

    it('applies flex styling to individual tabs when fullWidth', () => {
      render(<Tabs tabs={defaultTabs} fullWidth />);
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });

      expect(tab1).toHaveStyle({ flex: 1, justifyContent: 'center' });
    });
  });

  describe('Disabled Tabs', () => {
    it('renders disabled tab with correct attributes', () => {
      const tabsWithDisabled = [
        ...defaultTabs,
        { id: 'tab4', label: 'Tab 4', content: <div>Content 4</div>, disabled: true },
      ];
      render(<Tabs tabs={tabsWithDisabled} />);

      const disabledTab = screen.getByRole('tab', { name: 'Tab 4' });
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
      expect(disabledTab).toHaveStyle({ opacity: 0.5, cursor: 'not-allowed' });
    });

    it('does not call onChange for disabled tab', () => {
      const onChange = jest.fn();
      const tabsWithDisabled = [
        ...defaultTabs,
        { id: 'tab4', label: 'Tab 4', content: <div>Content 4</div>, disabled: true },
      ];
      render(<Tabs tabs={tabsWithDisabled} onChange={onChange} />);

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 4' }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes on tablist', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tabList = screen.getByRole('tablist');

      expect(tabList).toHaveAttribute('role', 'tablist');
      expect(tabList).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('has correct ARIA attributes on tabs', () => {
      render(<Tabs tabs={defaultTabs} />);
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });

      expect(tab1).toHaveAttribute('role', 'tab');
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab1).toHaveAttribute('aria-controls', 'tabpanel-tab1');
      expect(tab1).toHaveAttribute('tabIndex', '0');
    });

    it('has correct ARIA attributes on tabpanels', () => {
      render(<Tabs tabs={defaultTabs} />);
      const panel = screen.getByRole('tabpanel');

      expect(panel).toHaveAttribute('role', 'tabpanel');
      expect(panel).toHaveAttribute('id', 'tabpanel-tab1');
      expect(panel).toHaveAttribute('aria-labelledby', 'tab-tab1');
    });

    it('inactive tabs have tabIndex -1', () => {
      render(<Tabs tabs={defaultTabs} />);

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('tabIndex', '-1');
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('tabIndex', '-1');
    });

    it('only active tabpanel is visible', () => {
      render(<Tabs tabs={defaultTabs} />);

      const panels = screen.getAllByRole('tabpanel', { hidden: true });
      expect(panels).toHaveLength(3);

      const visiblePanel = screen.getByRole('tabpanel');
      expect(visiblePanel).toHaveTextContent('Content 1');
    });
  });

  describe('Edge Cases', () => {
    it('handles single tab', () => {
      const singleTab = [{ id: 'tab1', label: 'Only Tab', content: <div>Content</div> }];
      render(<Tabs tabs={singleTab} />);

      expect(screen.getByRole('tab', { name: 'Only Tab' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles tab with complex content', () => {
      const complexTabs = [
        {
          id: 'tab1',
          label: 'Tab 1',
          content: (
            <div>
              {/* eslint-disable-next-line react/forbid-elements */}
              <h3>Title</h3>
              <p>Paragraph</p>
              <button>Action</button>
            </div>
          ),
        },
      ];
      render(<Tabs tabs={complexTabs} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('handles changing tabs array', () => {
      const { rerender } = render(<Tabs tabs={defaultTabs} />);

      const newTabs = [
        { id: 'new1', label: 'New 1', content: <div>New Content 1</div> },
        { id: 'new2', label: 'New 2', content: <div>New Content 2</div> },
      ];

      rerender(<Tabs tabs={newTabs} />);

      expect(screen.getByRole('tab', { name: 'New 1' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Tab 1' })).not.toBeInTheDocument();
    });

    it('handles all tabs disabled', () => {
      const allDisabled = defaultTabs.map((tab) => ({ ...tab, disabled: true }));
      render(<Tabs tabs={allDisabled} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });
});
