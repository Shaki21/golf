import React, { ReactNode } from 'react';
import { SubSectionTitle } from '../../components/typography';

export interface ListItem {
  id: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  metadata?: string;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export interface ListSection {
  id: string;
  header?: string;
  items: ListItem[];
}

interface ListTemplateProps {
  sections?: ListSection[];
  items?: ListItem[];
  showDividers?: boolean;
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
 * Reusable list template component
 * Supports sections, icons, metadata, selection states, and empty states
 */
export const ListTemplate: React.FC<ListTemplateProps> = ({
  sections,
  items,
  showDividers = true,
  emptyState,
  className = '',
}) => {
  const badgeColors = {
    primary: 'bg-ak-primary/10 text-ak-primary border-ak-primary/20',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-ak-warning/10 text-ak-warning border-ak-warning/20',
    error: 'bg-ak-error/10 text-ak-error border-ak-error/20',
  };

  // Render a single list item
  const renderItem = (item: ListItem, index: number, isLastItem: boolean) => {
    const itemClasses = [
      'flex items-center gap-3 p-3 rounded-lg transition-colors',
      item.onClick && !item.disabled ? 'cursor-pointer hover:bg-ak-snow' : '',
      item.selected ? 'bg-ak-primary/5 border border-ak-primary/20' : '',
      item.disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <React.Fragment key={item.id}>
        <div
          className={itemClasses}
          onClick={!item.disabled ? item.onClick : undefined}
          role={item.onClick ? 'button' : undefined}
          tabIndex={item.onClick && !item.disabled ? 0 : undefined}
        >
          {/* Icon */}
          {item.icon && (
            <div className="flex-shrink-0 text-ak-steel">{item.icon}</div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-medium text-ak-charcoal truncate">
                {item.title}
              </p>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-medium rounded border ${
                    badgeColors[item.badgeColor || 'primary']
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            {item.subtitle && (
              <p className="text-[13px] text-ak-steel truncate mt-0.5">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Metadata */}
          {item.metadata && (
            <div className="flex-shrink-0 text-[12px] text-ak-steel">
              {item.metadata}
            </div>
          )}
        </div>

        {/* Divider */}
        {showDividers && !isLastItem && (
          <div className="h-px bg-ak-mist my-1" />
        )}
      </React.Fragment>
    );
  };

  // Render a section
  const renderSection = (section: ListSection, sectionIndex: number) => (
    <div key={section.id} className={sectionIndex > 0 ? 'mt-6' : ''}>
      {/* Section Header */}
      {section.header && (
        <SubSectionTitle className="text-[13px] font-semibold text-ak-steel uppercase tracking-wide mb-3 px-1">
          {section.header}
        </SubSectionTitle>
      )}

      {/* Section Items */}
      <div className="space-y-0">
        {section.items.map((item, index) =>
          renderItem(item, index, index === section.items.length - 1)
        )}
      </div>
    </div>
  );

  // Check if list is empty
  const isEmpty = sections
    ? sections.every((s) => s.items.length === 0)
    : !items || items.length === 0;

  // Render empty state
  if (isEmpty && emptyState) {
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
    <div className={className}>
      {/* Render sections or flat items */}
      {sections
        ? sections.map((section, index) => renderSection(section, index))
        : items?.map((item, index) =>
            renderItem(item, index, index === items.length - 1)
          )}
    </div>
  );
};

export default ListTemplate;
