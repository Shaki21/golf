/**
 * ============================================================
 * AttentionItems - Varsler og oppgaver som trenger oppmerksomhet
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Viser viktige elementer som krever brukerens oppmerksomhet.
 * Prioritert etter viktighet med tydelige visuell differensiering.
 *
 * Kategorier:
 * - urgent: Krever umiddelbar handling (rød)
 * - action: Ventende oppgave (gull)
 * - info: Informasjon/påminnelse (blå)
 * - success: Positiv hendelse (grønn)
 *
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { SubSectionTitle } from '../typography/Headings';
import { cn } from '../../lib/utils';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  MessageSquare,
  Calendar,
  Target,
  Award,
  X,
} from 'lucide-react';

export type AttentionPriority = 'urgent' | 'action' | 'info' | 'success';

export interface AttentionItem {
  id: string;
  priority: AttentionPriority;
  title: string;
  description?: string;
  timestamp?: Date;
  href?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  actionLabel?: string;
}

interface AttentionItemsProps {
  items: AttentionItem[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  viewAllHref?: string;
  onViewAll?: () => void;
  className?: string;
  emptyMessage?: string;
}

// Prioritetskonfigurasjon
const priorityConfig: Record<
  AttentionPriority,
  {
    icon: React.ElementType;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    iconBg: string;
  }
> = {
  urgent: {
    icon: AlertCircle,
    bgColor: 'bg-status-error/5',
    borderColor: 'border-status-error/30',
    iconColor: 'text-status-error',
    iconBg: 'bg-status-error/10',
  },
  action: {
    icon: Clock,
    bgColor: 'bg-tier-gold/5',
    borderColor: 'border-tier-gold/30',
    iconColor: 'text-tier-gold',
    iconBg: 'bg-tier-gold/10',
  },
  info: {
    icon: Info,
    bgColor: 'bg-status-info/5',
    borderColor: 'border-status-info/30',
    iconColor: 'text-status-info',
    iconBg: 'bg-status-info/10',
  },
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-status-success/5',
    borderColor: 'border-status-success/30',
    iconColor: 'text-status-success',
    iconBg: 'bg-status-success/10',
  },
};

export function AttentionItems({
  items,
  title = 'Needs attention',
  maxItems = 5,
  showViewAll = true,
  viewAllHref,
  onViewAll,
  className,
  emptyMessage = 'No alerts right now',
}: AttentionItemsProps) {
  // Sorter etter prioritet (urgent først)
  const sortedItems = [...items].sort((a, b) => {
    const order: Record<AttentionPriority, number> = {
      urgent: 0,
      action: 1,
      info: 2,
      success: 3,
    };
    return order[a.priority] - order[b.priority];
  });

  const displayItems = sortedItems.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  if (items.length === 0) {
    return (
      <div className={cn('rounded-xl border border-tier-border-subtle p-6', className)}>
        <div className="text-center">
          <CheckCircle2
            size={32}
            className="mx-auto text-status-success mb-2"
          />
          <p className="text-tier-text-secondary">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <SubSectionTitle className="font-semibold text-tier-navy flex items-center gap-2" style={{ marginBottom: 0 }}>
          <Bell size={18} className="text-tier-text-tertiary" />
          {title}
          {items.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-status-error text-tier-white">
              {items.length}
            </span>
          )}
        </SubSectionTitle>

        {showViewAll && hasMore && (viewAllHref || onViewAll) && (
          <ViewAllButton href={viewAllHref} onClick={onViewAll} />
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {displayItems.map((item) => (
          <AttentionItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* View All Footer */}
      {showViewAll && hasMore && (viewAllHref || onViewAll) && (
        <div className="pt-2 text-center">
          <ViewAllButton
            href={viewAllHref}
            onClick={onViewAll}
            label={`View all ${items.length} alerts`}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ATTENTION ITEM CARD
// ═══════════════════════════════════════════════════════════

interface AttentionItemCardProps {
  item: AttentionItem;
}

function AttentionItemCard({ item }: AttentionItemCardProps) {
  const config = priorityConfig[item.priority];
  const Icon = item.icon ? () => <>{item.icon}</> : config.icon;

  const Content = () => (
    <>
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          config.iconBg
        )}
      >
        {item.icon || <config.icon size={18} className={config.iconColor} />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-tier-navy text-sm truncate">
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-tier-text-secondary truncate">
            {item.description}
          </p>
        )}
        {item.timestamp && (
          <p className="text-xs text-tier-text-tertiary mt-0.5">
            {formatRelativeTime(item.timestamp)}
          </p>
        )}
      </div>

      {/* Action indicator */}
      {(item.href || item.onAction) && (
        <ChevronRight
          size={16}
          className="flex-shrink-0 text-tier-text-tertiary"
        />
      )}
    </>
  );

  const baseClasses = cn(
    'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
    config.bgColor,
    config.borderColor,
    (item.href || item.onAction) && 'hover:shadow-sm cursor-pointer'
  );

  // With dismiss button
  if (item.onDismiss) {
    return (
      <div className={cn(baseClasses, 'pr-2')}>
        {item.href ? (
          <Link to={item.href} className="flex items-center gap-3 flex-1 min-w-0">
            <Content />
          </Link>
        ) : item.onAction ? (
          <button
            onClick={item.onAction}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <Content />
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Content />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            item.onDismiss?.();
          }}
          className="p-1.5 rounded-lg hover:bg-tier-surface-secondary text-tier-text-tertiary hover:text-tier-text-secondary transition-colors"
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Link version
  if (item.href) {
    return (
      <Link to={item.href} className={baseClasses}>
        <Content />
      </Link>
    );
  }

  // Button version
  if (item.onAction) {
    return (
      <button onClick={item.onAction} className={cn(baseClasses, 'w-full text-left')}>
        <Content />
      </button>
    );
  }

  // Static version
  return (
    <div className={baseClasses}>
      <Content />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VIEW ALL BUTTON
// ═══════════════════════════════════════════════════════════

interface ViewAllButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

function ViewAllButton({
  href,
  onClick,
  label = 'View all',
}: ViewAllButtonProps) {
  const className =
    'text-sm text-tier-navy hover:text-tier-gold font-medium flex items-center gap-1 transition-colors';

  if (href) {
    return (
      <Link to={href} className={className}>
        {label}
        <ChevronRight size={14} />
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {label}
      <ChevronRight size={14} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

// ═══════════════════════════════════════════════════════════
// PRE-BUILT ATTENTION ITEM CREATORS
// ═══════════════════════════════════════════════════════════

export const createAttentionItem = {
  /** New message from coach */
  newMessage: (
    id: string,
    from: string,
    preview: string,
    timestamp: Date
  ): AttentionItem => ({
    id,
    priority: 'action',
    title: `Message from ${from}`,
    description: preview,
    timestamp,
    href: '/mer/meldinger',
    icon: <MessageSquare size={18} className="text-tier-gold" />,
  }),

  /** Scheduled training today */
  scheduledTraining: (
    id: string,
    trainingName: string,
    time: string
  ): AttentionItem => ({
    id,
    priority: 'info',
    title: trainingName,
    description: `Scheduled ${time}`,
    href: '/trening',
    icon: <Calendar size={18} className="text-status-info" />,
  }),

  /** Goal near completion */
  goalNearCompletion: (
    id: string,
    goalName: string,
    progress: number
  ): AttentionItem => ({
    id,
    priority: 'action',
    title: `${goalName} - ${progress}% complete`,
    description: 'Almost there!',
    href: '/plan/maal',
    icon: <Target size={18} className="text-tier-gold" />,
  }),

  /** New badge available */
  badgeUnlocked: (id: string, badgeName: string): AttentionItem => ({
    id,
    priority: 'success',
    title: `New badge unlocked!`,
    description: badgeName,
    href: '/utvikling/badges',
    icon: <Award size={18} className="text-status-success" />,
  }),

  /** Test due soon */
  testDueSoon: (id: string, testName: string, dueDate: string): AttentionItem => ({
    id,
    priority: 'urgent',
    title: `Test due: ${testName}`,
    description: `Deadline: ${dueDate}`,
    href: '/trening/testing',
    icon: <AlertCircle size={18} className="text-status-error" />,
  }),
};

export default AttentionItems;
