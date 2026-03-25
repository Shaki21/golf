import React from 'react';
import { render } from '@testing-library/react';
import { AKLogo } from '../AKLogo';

describe('AKLogo', () => {
  it('renders SVG element', () => {
    const { container } = render(<AKLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with default size', () => {
    const { container } = render(<AKLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('height', '44');
  });

  it('renders with custom size', () => {
    const { container } = render(<AKLogo size={60} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('renders with default color (white)', () => {
    const { container } = render(<AKLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'var(--tier-surface-card)');
  });

  it('renders with custom color', () => {
    const customColor = '#FF0000';
    const { container } = render(<AKLogo color={customColor} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', customColor);
  });

  it('has correct viewBox', () => {
    const { container } = render(<AKLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 196.41 204.13');
  });

  it('has accessible aria-label', () => {
    const { container } = render(<AKLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'TIER Golf logo');
  });

  it('has img role for accessibility', () => {
    const { container } = render(<AKLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('contains path element for logo shape', () => {
    const { container } = render(<AKLogo />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('maintains aspect ratio in width calculation', () => {
    const { container } = render(<AKLogo size={100} />);
    const svg = container.querySelector('svg');
    const aspectRatio = 196.41 / 204.13;
    const expectedWidth = (100 * aspectRatio).toString();
    expect(svg.getAttribute('width')).toBe(expectedWidth);
  });
});
