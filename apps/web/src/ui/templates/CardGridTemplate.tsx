import React, { ReactNode } from 'react';
import { SubSectionTitle } from '../../components/typography';

export interface CardItem {
  id: string;
  image?: string;
  imageAlt?: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  metadata?: string;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  onClick?: () => void;
  loading?: boolean;
}

interface CardGridTemplateProps {
  cards: CardItem[];
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
}

/**
 * Reusable card grid template component
 * Supports responsive grids, images, badges, actions, and loading states
 */
export const CardGridTemplate: React.FC<CardGridTemplateProps> = ({
  cards,
  columns = 3,
  gap = 'md',
  emptyState,
  className = '',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapSizes = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const badgeColors = {
    primary: 'bg-ak-primary/10 text-ak-primary border-ak-primary/20',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-ak-warning/10 text-ak-warning border-ak-warning/20',
    error: 'bg-ak-error/10 text-ak-error border-ak-error/20',
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="bg-white rounded-xl border border-ak-mist overflow-hidden">
      <div className="animate-pulse">
        <div className="h-48 bg-ak-mist" />
        <div className="p-4">
          <div className="h-5 bg-ak-mist rounded w-3/4 mb-2" />
          <div className="h-4 bg-ak-mist rounded w-full mb-1" />
          <div className="h-4 bg-ak-mist rounded w-2/3" />
        </div>
      </div>
    </div>
  );

  // Render a single card
  const renderCard = (card: CardItem) => {
    if (card.loading) {
      return <div key={card.id}>{renderLoadingSkeleton()}</div>;
    }

    const hasClickHandler = Boolean(card.onClick);

    return (
      <div
        key={card.id}
        className={`bg-white rounded-xl border border-ak-mist overflow-hidden transition-all ${
          hasClickHandler
            ? 'cursor-pointer hover:shadow-lg hover:border-ak-primary/20 hover:-translate-y-1'
            : ''
        }`}
        onClick={card.onClick}
        role={hasClickHandler ? 'button' : undefined}
        tabIndex={hasClickHandler ? 0 : undefined}
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {/* Image or Icon */}
        {card.image ? (
          <div className="relative h-48 bg-ak-snow overflow-hidden">
            <img
              src={card.image}
              alt={card.imageAlt || card.title}
              className="w-full h-full object-cover"
            />
            {card.badge && (
              <span
                className={`absolute top-3 right-3 px-2 py-1 text-[11px] font-medium rounded border backdrop-blur-sm ${
                  badgeColors[card.badgeColor || 'primary']
                }`}
              >
                {card.badge}
              </span>
            )}
          </div>
        ) : card.icon ? (
          <div className="h-48 bg-ak-snow flex items-center justify-center relative">
            <div className="text-ak-steel">{card.icon}</div>
            {card.badge && (
              <span
                className={`absolute top-3 right-3 px-2 py-1 text-[11px] font-medium rounded border ${
                  badgeColors[card.badgeColor || 'primary']
                }`}
              >
                {card.badge}
              </span>
            )}
          </div>
        ) : null}

        {/* Content */}
        <div className="p-4">
          {/* Title and Badge (if no image/icon) */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <SubSectionTitle className="text-[16px] font-semibold text-ak-charcoal line-clamp-2">
              {card.title}
            </SubSectionTitle>
            {card.badge && !card.image && !card.icon && (
              <span
                className={`px-2 py-0.5 text-[11px] font-medium rounded border flex-shrink-0 ${
                  badgeColors[card.badgeColor || 'primary']
                }`}
              >
                {card.badge}
              </span>
            )}
          </div>

          {/* Description */}
          {card.description && (
            <p className="text-[14px] text-ak-steel line-clamp-3 mb-3">
              {card.description}
            </p>
          )}

          {/* Metadata */}
          {card.metadata && (
            <p className="text-[12px] text-ak-steel mb-3">{card.metadata}</p>
          )}

          {/* Actions */}
          {card.actions && (
            <div className="flex items-center gap-2 pt-2 border-t border-ak-mist">
              {card.actions.primary && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    card.actions!.primary!.onClick();
                  }}
                  className="flex-1 px-4 py-2 bg-ak-primary text-white rounded-lg text-[13px] font-medium hover:bg-ak-primary-dark transition-colors"
                >
                  {card.actions.primary.label}
                </button>
              )}
              {card.actions.secondary && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    card.actions!.secondary!.onClick();
                  }}
                  className="flex-1 px-4 py-2 bg-ak-snow text-ak-charcoal rounded-lg text-[13px] font-medium hover:bg-ak-mist transition-colors"
                >
                  {card.actions.secondary.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render empty state
  if (cards.length === 0 && emptyState) {
    return (
      <div className={`text-center py-12 ${className}`}>
        {emptyState.icon && (
          <div className="flex justify-center mb-4 text-ak-mist">
            {emptyState.icon}
          </div>
        )}
        <SubSectionTitle className="text-[16px] font-semibold text-ak-charcoal mb-2">
          {emptyState.title}
        </SubSectionTitle>
        {emptyState.description && (
          <p className="text-[14px] text-ak-steel mb-4">
            {emptyState.description}
          </p>
        )}
        {emptyState.action && (
          <button
            onClick={emptyState.action.onClick}
            className="px-6 py-3 bg-ak-primary text-white rounded-lg text-[14px] font-medium hover:bg-ak-primary-dark transition-colors"
          >
            {emptyState.action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} ${gapSizes[gap]} ${className}`}>
      {cards.map((card) => renderCard(card))}
    </div>
  );
};

export default CardGridTemplate;
