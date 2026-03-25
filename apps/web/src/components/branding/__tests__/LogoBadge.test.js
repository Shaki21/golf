import React from 'react';
import { render } from '@testing-library/react';
import { LogoBadge } from '../LogoBadge';

describe('LogoBadge', () => {
  it('renders container element', () => {
    const { container } = render(<LogoBadge />);
    const badge = container.firstChild;
    expect(badge).toBeInTheDocument();
  });

  it('renders AKLogo inside', () => {
    const { container } = render(<LogoBadge />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies default badge size', () => {
    const { container } = render(<LogoBadge />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({ width: '56px', height: '56px' });
  });

  it('applies custom badge size', () => {
    const { container } = render(<LogoBadge badgeSize={80} />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({ width: '80px', height: '80px' });
  });

  it('applies default background color', () => {
    const { container } = render(<LogoBadge />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({ backgroundColor: 'var(--tier-primary)' });
  });

  it('applies custom background color', () => {
    const { container } = render(<LogoBadge backgroundColor="#FF0000" />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('applies default border radius', () => {
    const { container } = render(<LogoBadge />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({ borderRadius: '16px' });
  });

  it('applies custom border radius', () => {
    const { container } = render(<LogoBadge borderRadius="50%" />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({ borderRadius: '50%' });
  });

  it('passes logo size to AKLogo', () => {
    const { container } = render(<LogoBadge logoSize={30} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('height', '30');
  });

  it('passes logo color to AKLogo', () => {
    const customColor = '#00FF00';
    const { container } = render(<LogoBadge logoColor={customColor} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', customColor);
  });

  it('applies custom className', () => {
    const { container } = render(<LogoBadge className="custom-badge" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-badge');
  });

  it('renders as div by default', () => {
    const { container } = render(<LogoBadge />);
    const badge = container.firstChild;
    expect(badge.tagName).toBe('DIV');
  });

  it('renders as custom element type', () => {
    const { container } = render(<LogoBadge as="span" />);
    const badge = container.firstChild;
    expect(badge.tagName).toBe('SPAN');
  });

  it('has flex centering styles', () => {
    const { container } = render(<LogoBadge />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('justify-center');
  });
});
