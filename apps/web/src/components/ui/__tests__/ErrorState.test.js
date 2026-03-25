import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '../ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders default message for system_failure', () => {
    render(<ErrorState errorType="system_failure" />);
    expect(screen.getByText(/gikk galt/i)).toBeInTheDocument();
  });

  it('renders validation error message', () => {
    render(<ErrorState errorType="validation_error" />);
    expect(screen.getByText(/ugyldig input/i)).toBeInTheDocument();
  });

  it('renders authentication error message', () => {
    render(<ErrorState errorType="authentication_error" />);
    expect(screen.getByText(/logge inn/i)).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const handleRetry = jest.fn();
    render(<ErrorState message="Error" onRetry={handleRetry} />);

    const retryButton = screen.getByRole('button', { name: /prøv igjen/i });
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders retry button only when onRetry provided', () => {
    const { rerender } = render(<ErrorState message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<ErrorState message="Error" onRetry={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('uses custom message alongside error type title', () => {
    render(<ErrorState errorType="validation_error" message="Custom error" />);
    expect(screen.getByText('Custom error')).toBeInTheDocument();
    // The title is based on error type, custom message is description
    expect(screen.getByText(/ugyldig input/i)).toBeInTheDocument();
  });
});
