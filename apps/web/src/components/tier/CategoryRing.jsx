import React from 'react';
import { cn } from '../../lib/utils';

/**
 * TIER Golf Category Ring Component
 *
 * SVG-based circular progress indicator for Category A-K system.
 * Shows category letter in center with colored progress ring.
 *
 * @param {Object} props
 * @param {'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'} props.category - Category letter
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.size - Ring size in pixels (default: 120)
 * @param {number} props.strokeWidth - Ring stroke width (default: 8)
 * @param {boolean} props.showPercentage - Show percentage text (default: true)
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <CategoryRing category="A" progress={65} size={120} />
 */

const categoryColors = {
  A: 'rgb(var(--tier-gold))', // Gold
  B: '#B8960F',
  C: '#A68A00',
  D: '#64748B', // Silver
  E: '#475569',
  F: 'rgb(var(--status-info))', // Blue
  G: '#3B82F6',
  H: 'rgb(var(--status-success))', // Green
  I: '#22C55E',
  J: '#7C3AED', // Purple
  K: '#8B5CF6',
};

const categoryNames = {
  A: 'Tour/Elite',
  B: 'Landslag',
  C: 'Høyt nasjonalt',
  D: 'Nasjonalt',
  E: 'Regionalt topp',
  F: 'Regionalt',
  G: 'Klubb høy',
  H: 'Klubb middels',
  I: 'Klubb lav',
  J: 'Utvikling',
  K: 'Nybegynner',
};

export function CategoryRing({
  category,
  progress = 0,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  className,
  ...props
}) {
  // Validate category
  if (!categoryColors[category]) {
    console.warn(`CategoryRing: Invalid category "${category}". Must be A-K.`);
    return null;
  }

  // Validate progress
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  // Calculate SVG values
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedProgress / 100) * circumference;
  const color = categoryColors[category];

  return (
    <div
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={`Kategori ${category} fremgang`}
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-4xl font-bold text-tier-navy"
          style={{ fontSize: size * 0.33 }}
        >
          {category}
        </span>
        {showPercentage && (
          <span
            className="text-xs text-text-tertiary mt-0.5"
            style={{ fontSize: size * 0.1 }}
          >
            {Math.round(normalizedProgress)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Export category data for external use
CategoryRing.categories = Object.keys(categoryColors);
CategoryRing.categoryColors = categoryColors;
CategoryRing.categoryNames = categoryNames;
