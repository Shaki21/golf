import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Title" />);
    expect(screen.queryByText('Subtitle text')).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageHeader
        title="Title"
        actions={<button>Action Button</button>}
      />
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('renders as header element', () => {
    const { container } = render(<PageHeader title="Title" />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('renders header with correct structure', () => {
    const { container } = render(<PageHeader title="Title" />);
    const headerContent = container.querySelector('header > div');
    expect(headerContent).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PageHeader title="Title" className="custom-class" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-class');
  });

  it('has sticky positioning', () => {
    const { container } = render(<PageHeader title="Title" />);
    const header = container.querySelector('header');
    // Uses inline style for sticky positioning
    expect(header).toHaveStyle({ position: 'sticky' });
  });
});
