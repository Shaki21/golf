/**
 * TIER Golf - Members List
 * Design System v3.0
 *
 * A reusable component for displaying lists of members/people
 * with avatar, name, role, and online status.
 *
 * Based on Tailwind UI people list pattern.
 */

import React from 'react';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  role?: string;
  imageUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  lastSeen?: string | null;
  lastSeenDateTime?: string;
  isOnline?: boolean;
  category?: string;
  type?: 'player' | 'coach' | 'parent' | 'admin';
}

interface MembersListProps {
  members: Member[];
  onMemberClick?: (member: Member) => void;
  showRole?: boolean;
  showEmail?: boolean;
  showStatus?: boolean;
  emptyMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    avatar: 'h-8 w-8',
    avatarText: 'text-xs',
    name: 'text-sm',
    detail: 'text-xs',
    padding: 'py-3',
    gap: 'gap-x-3',
  },
  md: {
    avatar: 'h-10 w-10',
    avatarText: 'text-sm',
    name: 'text-sm',
    detail: 'text-xs',
    padding: 'py-4',
    gap: 'gap-x-4',
  },
  lg: {
    avatar: 'h-12 w-12',
    avatarText: 'text-base',
    name: 'text-base',
    detail: 'text-sm',
    padding: 'py-5',
    gap: 'gap-x-4',
  },
};

export default function MembersList({
  members,
  onMemberClick,
  showRole = true,
  showEmail = true,
  showStatus = true,
  emptyMessage = 'No members',
  className = '',
  size = 'lg',
}: MembersListProps) {
  const sizes = sizeClasses[size];

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get type badge style
  const getTypeBadgeStyle = (type?: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      coach: { bg: 'bg-amber-50', text: 'text-amber-700' },
      player: { bg: 'bg-blue-50', text: 'text-blue-700' },
      parent: { bg: 'bg-purple-50', text: 'text-purple-700' },
      admin: { bg: 'bg-red-50', text: 'text-red-700' },
    };
    return styles[type || ''] || { bg: 'bg-gray-50', text: 'text-gray-700' };
  };

  if (members.length === 0) {
    return (
      <div className={classNames('p-8 text-center', className)}>
        <p className="text-sm text-ak-steel">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      className={classNames(
        'divide-y divide-border-default',
        className
      )}
    >
      {members.map((member) => {
        const typeBadge = getTypeBadgeStyle(member.type);
        const initials = member.avatarInitials || getInitials(member.name);

        return (
          <li
            key={member.id}
            className={classNames(
              'flex justify-between',
              sizes.gap,
              sizes.padding,
              onMemberClick && 'cursor-pointer hover:bg-ak-snow transition-colors'
            )}
            onClick={() => onMemberClick?.(member)}
          >
            <div className={classNames('flex min-w-0', sizes.gap)}>
              {/* Avatar */}
              {member.imageUrl ? (
                <img
                  alt={member.name}
                  src={member.imageUrl}
                  className={classNames(
                    'flex-none rounded-full bg-ak-snow ring-1 ring-border-default',
                    sizes.avatar
                  )}
                />
              ) : (
                <div
                  className={classNames(
                    'flex-none rounded-full flex items-center justify-center font-semibold',
                    sizes.avatar,
                    sizes.avatarText
                  )}
                  style={{
                    backgroundColor: member.avatarColor || 'var(--tier-primary)',
                    color: 'white',
                  }}
                >
                  {initials}
                </div>
              )}

              {/* Name and details */}
              <div className="min-w-0 flex-auto">
                <div className="flex items-center gap-2">
                  <p
                    className={classNames(
                      'font-semibold text-ak-charcoal truncate',
                      sizes.name
                    )}
                  >
                    {member.name}
                  </p>
                  {member.type && (
                    <span
                      className={classNames(
                        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
                        typeBadge.bg,
                        typeBadge.text
                      )}
                    >
                      {member.type === 'coach' && 'Coach'}
                      {member.type === 'player' && 'Player'}
                      {member.type === 'parent' && 'Parent'}
                      {member.type === 'admin' && 'Admin'}
                    </span>
                  )}
                  {member.category && (
                    <span className="inline-flex items-center rounded bg-ak-snow px-1.5 py-0.5 text-xs font-medium text-ak-steel">
                      {member.category}
                    </span>
                  )}
                </div>
                {showEmail && member.email && (
                  <p
                    className={classNames(
                      'mt-1 truncate text-ak-steel',
                      sizes.detail
                    )}
                  >
                    {member.email}
                  </p>
                )}
              </div>
            </div>

            {/* Right side - role and status */}
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              {showRole && member.role && (
                <p className={classNames('text-ak-charcoal', sizes.name)}>
                  {member.role}
                </p>
              )}
              {showStatus && (
                <>
                  {member.isOnline || member.lastSeen === null ? (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <p className={classNames('text-ak-steel', sizes.detail)}>
                        Online
                      </p>
                    </div>
                  ) : member.lastSeen ? (
                    <p className={classNames('mt-1 text-ak-steel', sizes.detail)}>
                      Last seen{' '}
                      <time dateTime={member.lastSeenDateTime}>
                        {member.lastSeen}
                      </time>
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
