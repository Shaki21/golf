/**
 * TIER Golf - Actions Grid
 * Design System v3.0
 *
 * A responsive grid of action cards for quick navigation
 * to key features and functionality.
 *
 * Based on Tailwind UI action panels pattern.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SubSectionTitle } from '../../components/typography';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  iconForeground?: string;
  iconBackground?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface ActionsGridProps {
  actions: ActionItem[];
  columns?: 2 | 3;
  className?: string;
}

const defaultColors = [
  { iconForeground: 'text-teal-700', iconBackground: 'bg-teal-50' },
  { iconForeground: 'text-purple-700', iconBackground: 'bg-purple-50' },
  { iconForeground: 'text-sky-700', iconBackground: 'bg-sky-50' },
  { iconForeground: 'text-yellow-700', iconBackground: 'bg-yellow-50' },
  { iconForeground: 'text-rose-700', iconBackground: 'bg-rose-50' },
  { iconForeground: 'text-indigo-700', iconBackground: 'bg-indigo-50' },
];

export default function ActionsGrid({
  actions,
  columns = 2,
  className = '',
}: ActionsGridProps) {
  return (
    <div
      className={classNames(
        'divide-y divide-border-default overflow-hidden rounded-ak-lg bg-ak-mist/50 shadow-sm sm:grid sm:divide-y-0 ring-1 ring-border-default',
        columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
        className
      )}
    >
      {actions.map((action, actionIdx) => {
        const Icon = action.icon;
        const colors = action.iconForeground && action.iconBackground
          ? { iconForeground: action.iconForeground, iconBackground: action.iconBackground }
          : defaultColors[actionIdx % defaultColors.length];

        // Calculate border radius based on position
        const isFirstRow = actionIdx < columns;
        const isLastRow = actionIdx >= actions.length - columns;
        const isFirstCol = actionIdx % columns === 0;
        const isLastCol = actionIdx % columns === columns - 1 || actionIdx === actions.length - 1;

        return (
          <div
            key={action.id}
            className={classNames(
              'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ak-primary transition-colors',
              // Borders between items
              !isLastRow && 'sm:border-b sm:border-border-default',
              !isFirstCol && 'sm:border-l sm:border-border-default',
              // Hover state
              !action.disabled && 'hover:bg-ak-snow cursor-pointer',
              action.disabled && 'opacity-60 cursor-not-allowed',
              // Rounded corners
              actionIdx === 0 && 'rounded-tl-ak-lg',
              actionIdx === columns - 1 && 'sm:rounded-tr-ak-lg',
              actionIdx === actions.length - columns && 'sm:rounded-bl-ak-lg',
              actionIdx === actions.length - 1 && 'rounded-br-ak-lg'
            )}
          >
            <div>
              <span
                className={classNames(
                  'inline-flex rounded-ak-md p-3',
                  colors.iconBackground,
                  colors.iconForeground
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              {action.badge !== undefined && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-ak-primary px-2 py-1 text-xs font-medium text-white">
                  {action.badge}
                </span>
              )}
            </div>
            <div className="mt-6">
              <SubSectionTitle className="text-base font-semibold text-ak-charcoal">
                {action.disabled ? (
                  <span>{action.title}</span>
                ) : (
                  <Link to={action.href} className="focus:outline-none">
                    {/* Extend touch target to entire panel */}
                    <span aria-hidden="true" className="absolute inset-0" />
                    {action.title}
                  </Link>
                )}
              </SubSectionTitle>
              {action.description && (
                <p className="mt-2 text-sm text-ak-steel line-clamp-2">
                  {action.description}
                </p>
              )}
            </div>
            {!action.disabled && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-6 right-6 text-ak-mist group-hover:text-ak-steel transition-colors"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
