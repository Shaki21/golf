import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingState from '../LoadingState';

describe('LoadingState', () => {
  it('renders loading spinner', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingState message="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('has accessible loading status', () => {
    const { container } = render(<LoadingState />);
    // LoadingState uses role="status" for accessibility
    const status = container.querySelector('[role="status"]');
    expect(status).toBeInTheDocument();
  });

  it('uses correct styling from design tokens', () => {
    const { container } = render(<LoadingState />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({ display: 'flex' });
  });
});
