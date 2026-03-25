/**
 * OperationsSection (Layer 3)
 *
 * Admin/operations layer with:
 * - Collapsible sections
 * - Quieter visual styling
 * - Inline actions where possible
 *
 * Coach language:
 * - "Training plan" not "Calendar"
 * - "Book next session" not "Booking"
 * - "Tournaments that matter now" not "My tournaments"
 */

import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface OperationItem {
  href: string;
  label: string;
  icon: string;
  description?: string;
  count?: number;
  isNew?: boolean;
}

interface OperationSection {
  id: string;
  label: string;
  icon: string;
  defaultOpen?: boolean;
  items: OperationItem[];
}

const PLAN_OPERATIONS: OperationSection[] = [
  {
    id: 'training-plan',
    label: 'Training Plan',
    icon: 'Calendar',
    defaultOpen: true,
    items: [
      {
        href: '/plan/kalender',
        label: 'Weekly overview',
        icon: 'CalendarDays',
        description: 'View and manage your training week',
      },
      {
        href: '/plan/booking',
        label: 'Book next session',
        icon: 'CalendarPlus',
        description: 'Schedule time with your coach',
      },
      {
        href: '/plan/ukeplan',
        label: 'Week planner',
        icon: 'LayoutGrid',
        description: 'Detailed weekly overview',
      },
    ],
  },
  {
    id: 'goals-plans',
    label: 'Goals & Plans',
    icon: 'Target',
    defaultOpen: false,
    items: [
      {
        href: '/plan/maal',
        label: 'My goals',
        icon: 'Target',
        description: 'Manage your goals',
      },
      {
        href: '/plan/aarsplan',
        label: 'Annual plan',
        icon: 'FileText',
        description: 'Long-term training plan',
      },
    ],
  },
  {
    id: 'tournaments',
    label: 'Tournaments that matter now',
    icon: 'Trophy',
    defaultOpen: false,
    items: [
      {
        href: '/plan/turneringer',
        label: 'Tournament calendar',
        icon: 'Calendar',
        description: 'All upcoming tournaments',
      },
      {
        href: '/plan/turneringer/mine',
        label: 'My registrations',
        icon: 'ClipboardList',
        description: 'Tournaments you are registered for',
      },
    ],
  },
  {
    id: 'camps-school',
    label: 'Camps & School',
    icon: 'GraduationCap',
    defaultOpen: false,
    items: [
      {
        href: '/samlinger',
        label: 'Training camps',
        icon: 'Users',
        description: 'Upcoming camps and gatherings',
      },
      {
        href: '/plan/skole',
        label: 'School schedule',
        icon: 'BookOpen',
        description: 'School timetable and absences',
      },
    ],
  },
];

interface OperationsSectionProps {
  sections?: OperationSection[];
  className?: string;
}

export const OperationsSection = memo(function OperationsSection({
  sections = PLAN_OPERATIONS,
  className = '',
}: OperationsSectionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-semibold text-tier-text-tertiary uppercase tracking-wider px-1">
        Tools & Administration
      </p>
      {sections.map((section) => (
        <CollapsibleSection key={section.id} section={section} />
      ))}
    </div>
  );
});

interface CollapsibleSectionProps {
  section: OperationSection;
}

function CollapsibleSection({ section }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);
  const SectionIcon = getIcon(section.icon);

  return (
    <div className="bg-tier-white rounded-xl border border-tier-border-subtle overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-tier-surface-subtle transition-colors"
      >
        <div className="flex items-center gap-3">
          <SectionIcon size={18} className="text-tier-text-secondary" />
          <span className="font-medium text-tier-navy text-sm">
            {section.label}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-tier-text-tertiary" />
        ) : (
          <ChevronRight size={16} className="text-tier-text-tertiary" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-tier-border-subtle">
          {section.items.map((item, index) => (
            <OperationItemLink key={item.href} item={item} isLast={index === section.items.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface OperationItemLinkProps {
  item: OperationItem;
  isLast: boolean;
}

function OperationItemLink({ item, isLast }: OperationItemLinkProps) {
  const ItemIcon = getIcon(item.icon);

  return (
    <Link
      to={item.href}
      className={`group flex items-center gap-3 px-4 py-3 hover:bg-tier-surface-subtle transition-colors ${
        !isLast ? 'border-b border-tier-border-subtle' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-tier-surface-secondary flex items-center justify-center shrink-0 group-hover:bg-tier-surface-base transition-colors">
        <ItemIcon size={16} className="text-tier-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark transition-colors">
            {item.label}
          </span>
          {item.count !== undefined && item.count > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-tier-navy/10 text-tier-navy rounded-full font-medium">
              {item.count}
            </span>
          )}
          {item.isNew && (
            <span className="text-xs px-1.5 py-0.5 bg-status-success/10 text-status-success rounded-full font-medium">
              New
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-tier-text-tertiary mt-0.5 line-clamp-1">
            {item.description}
          </p>
        )}
      </div>
      <ChevronRight size={14} className="text-tier-text-tertiary group-hover:text-tier-navy transition-colors shrink-0" />
    </Link>
  );
}

// Helper to get icon from string name
function getIcon(iconName: string): React.ComponentType<{ size?: number; className?: string }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
  return icons[iconName] || LucideIcons.Circle;
}

export default OperationsSection;
