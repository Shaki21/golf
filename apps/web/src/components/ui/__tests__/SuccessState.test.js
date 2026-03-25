import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SuccessState from '../SuccessState';

describe('SuccessState', () => {
  it('renders success message', () => {
    render(<SuccessState message="Operation successful" />);
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('renders dismiss button', () => {
    render(<SuccessState message="Success" onDismiss={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onDismiss when button clicked', () => {
    const handleDismiss = jest.fn();
    render(<SuccessState message="Success" onDismiss={handleDismiss} />);

    const dismissButton = screen.getByRole('button');
    fireEvent.click(dismissButton);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders success icon', () => {
    const { container } = render(<SuccessState message="Success" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
