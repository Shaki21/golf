/**
 * CoachOperationsSection (Layer 3)
 *
 * Operations and admin tools for coaches:
 * - Quick actions (new session, message, etc.)
 * - Management links (players, calendar, reports)
 * - Collapsible sections
 */

import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  ClipboardList,
  Trophy,
  BookOpen,
} from 'lucide-react';

interface OperationItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  count?: number;
}

interface OperationSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items: OperationItem[];
  defaultOpen?: boolean;
}

const OPERATION_SECTIONS: OperationSection[] = [
  {
    id: 'quick-actions',
    label: 'Quick Actions',
    icon: Plus,
    defaultOpen: true,
    items: [
      {
        href: '/coach/booking',
        label: 'New Session',
        icon: Calendar,
        description: 'Schedule a coaching session',
      },
      {
        href: '/coach/messages/compose',
        label: 'Send Message',
        icon: MessageSquare,
        description: 'Message a player or group',
      },
      {
        href: '/coach/groups/create',
        label: 'Add Player',
        icon: Users,
        description: 'Add players via group creation',
      },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    icon: ClipboardList,
    items: [
      {
        href: '/coach/athletes',
        label: 'Players',
        icon: Users,
        description: 'View and manage your players',
      },
      {
        href: '/coach/calendar',
        label: 'Calendar',
        icon: Calendar,
        description: 'Your coaching schedule',
      },
      {
        href: '/coach/session-evaluations',
        label: 'Sessions',
        icon: ClipboardList,
        description: 'All training sessions',
      },
      {
        href: '/coach/tournaments',
        label: 'Tournaments',
        icon: Trophy,
        description: 'Tournament management',
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights & Reports',
    icon: BarChart3,
    items: [
      {
        href: '/coach/stats',
        label: 'Statistics',
        icon: BarChart3,
        description: 'Player and team statistics',
      },
      {
        href: '/coach/stats/progress',
        label: 'Progress Reports',
        icon: FileText,
        description: 'Generate player reports',
      },
      {
        href: '/coach/exercises',
        label: 'Exercise Library',
        icon: BookOpen,
        description: 'Browse and create exercises',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      {
        href: '/coach/booking/settings',
        label: 'Booking Settings',
        icon: Calendar,
        description: 'Availability and booking rules',
      },
      {
        href: '/coach/settings',
        label: 'Profile & Preferences',
        icon: Settings,
        description: 'Your coach profile',
      },
    ],
  },
];

interface CoachOperationsSectionProps {
  className?: string;
}

export const CoachOperationsSection = memo(function CoachOperationsSection({
  className = '',
}: CoachOperationsSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-tier-text-primary">
        Tools & Administration
      </h3>
      {OPERATION_SECTIONS.map((section) => (
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
  const SectionIcon = section.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 hover:bg-tier-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-tier-navy/10 flex items-center justify-center">
            <SectionIcon size={16} className="text-tier-navy" />
          </div>
          <span className="font-medium text-tier-text-primary">{section.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-tier-text-tertiary" />
        ) : (
          <ChevronRight size={18} className="text-tier-text-tertiary" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-tier-surface-tertiary">
          {section.items.map((item) => (
            <OperationItemRow key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface OperationItemRowProps {
  item: OperationItem;
}

function OperationItemRow({ item }: OperationItemRowProps) {
  const ItemIcon = item.icon;

  return (
    <Link
      to={item.href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-tier-surface-secondary transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-tier-surface-secondary flex items-center justify-center shrink-0">
        <ItemIcon size={16} className="text-tier-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-tier-text-primary">{item.label}</span>
          {item.count !== undefined && item.count > 0 && (
            <span className="px-1.5 py-0.5 bg-tier-navy text-white text-xs font-medium rounded-full">
              {item.count}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-tier-text-tertiary truncate">{item.description}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-tier-text-tertiary shrink-0" />
    </Link>
  );
}

export default CoachOperationsSection;
