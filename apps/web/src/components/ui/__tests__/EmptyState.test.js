import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(<EmptyState title="No Data" message="Nothing to show" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="No Data"
        message="Nothing to show"
        actionLabel="Add Item"
        onAction={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="No Data" message="Nothing to show" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAction when action button clicked', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="No Data"
        message="Nothing to show"
        actionLabel="Add Item"
        onAction={handleClick}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
