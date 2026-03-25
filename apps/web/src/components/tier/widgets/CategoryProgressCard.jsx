import React from 'react';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TierCard } from '../TierCard';
import { CategoryRing } from '../CategoryRing';
import { TierBadge } from '../TierBadge';
import { TierButton } from '../TierButton';
import { SubSectionTitle, CardTitle } from '../../typography/Headings';

/**
 * TIER Golf Category Progress Card
 *
 * Shows detailed progress for a specific category (A-K) with test requirements.
 *
 * @param {Object} props
 * @param {'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'} props.category - Category letter
 * @param {number} props.progress - Overall progress percentage (0-100)
 * @param {Array<Object>} props.tests - Array of test requirements
 * @param {Function} props.onViewDetails - Callback when "Se detaljer" is clicked
 * @param {boolean} props.compact - Compact view without tests list
 * @param {string} props.className - Additional CSS classes
 *
 * Test object structure:
 * {
 *   id: string,
 *   name: string,
 *   status: 'completed' | 'pending' | 'locked',
 *   result?: string,
 *   target: string
 * }
 *
 * @example
 * <CategoryProgressCard
 *   category="A"
 *   progress={65}
 *   tests={[
 *     { id: '1', name: 'Driving Distance', status: 'completed', result: '285 yards', target: '280 yards' },
 *     { id: '2', name: 'Approach Accuracy', status: 'pending', target: '75% GIR' },
 *     { id: '3', name: 'Short Game', status: 'locked', target: '65% Up & Down' }
 *   ]}
 *   onViewDetails={() => navigate('/categories/A')}
 * />
 */

export function CategoryProgressCard({
  category,
  progress = 0,
  tests = [],
  onViewDetails,
  compact = false,
  className,
  ...props
}) {
  const completedTests = tests.filter(t => t.status === 'completed').length;
  const totalTests = tests.length;

  const categoryName = CategoryRing.categoryNames[category] || 'Ukjent';

  const getTestIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      case 'pending':
        return <Circle className="w-4 h-4 text-tier-navy" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-text-muted" />;
      default:
        return <Circle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getTestStatusBadge = (test) => {
    switch (test.status) {
      case 'completed':
        return (
          <TierBadge variant="success" size="sm">
            ✓ {test.result || 'Bestått'}
          </TierBadge>
        );
      case 'pending':
        return (
          <TierBadge variant="neutral" size="sm">
            {test.target}
          </TierBadge>
        );
      case 'locked':
        return (
          <TierBadge variant="neutral" size="sm">
            🔒 Låst
          </TierBadge>
        );
      default:
        return null;
    }
  };

  return (
    <TierCard
      variant="category"
      category={category}
      className={cn('p-0', className)}
      {...props}
    >
      {/* Header section */}
      <div className={`bg-category-${category.toLowerCase()}/10 px-6 py-4`}>
        <div className="flex items-center gap-4">
          <CategoryRing category={category} progress={progress} size={80} />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SubSectionTitle className="font-display text-xl font-bold text-tier-navy" style={{ marginBottom: 0 }}>
                Kategori {category}
              </SubSectionTitle>
              <TierBadge variant="gold" size="sm">
                {completedTests}/{totalTests}
              </TierBadge>
            </div>
            <p className="text-sm text-text-muted">{categoryName}</p>
          </div>
        </div>
      </div>

      {/* Body section */}
      {!compact && tests.length > 0 && (
        <div className="px-6 py-4">
          <CardTitle className="text-sm font-semibold text-tier-navy mb-3">
            Tester ({completedTests}/{totalTests})
          </CardTitle>

          <div className="space-y-2">
            {tests.map((test) => (
              <div
                key={test.id}
                className={cn(
                  'flex items-center justify-between gap-3 p-3 rounded-lg',
                  'border border-gray-100',
                  test.status === 'completed' && 'bg-status-success/5',
                  test.status === 'locked' && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  {getTestIcon(test.status)}
                  <span className={cn(
                    'text-sm',
                    test.status === 'completed' ? 'font-medium text-tier-navy' : 'text-text-secondary'
                  )}>
                    {test.name}
                  </span>
                </div>

                {getTestStatusBadge(test)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with action button */}
      {onViewDetails && (
        <div className="px-6 py-4 border-t border-gray-100">
          <TierButton
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="w-full"
          >
            Se alle detaljer
          </TierButton>
        </div>
      )}

      {/* Compact view footer */}
      {compact && (
        <div className="px-6 py-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">
              {completedTests} av {totalTests} tester fullført
            </span>
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="text-tier-navy font-medium hover:underline"
              >
                Se mer →
              </button>
            )}
          </div>
        </div>
      )}
    </TierCard>
  );
}

CategoryProgressCard.displayName = 'CategoryProgressCard';
