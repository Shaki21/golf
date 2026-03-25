/**
 * ProfileOverviewCard
 *
 * Profile overview card for dashboard pages.
 * Based on Tailwind UI with TIER Golf design system.
 */

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Camera } from 'lucide-react';
import clsx from 'clsx';

interface ProfileStat {
  label: string;
  value: string | number;
}

interface ProfileOverviewCardProps {
  /** User's display name */
  name: string;
  /** User's role or subtitle */
  role: string;
  /** User's email (optional) */
  email?: string;
  /** Avatar image URL (optional, uses initials if not provided) */
  avatarUrl?: string;
  /** Stats to display in the footer (max 3-4 recommended) */
  stats?: ProfileStat[];
  /** Link to profile page */
  profileHref?: string;
  /** Custom welcome message (defaults to time-based greeting) */
  welcomeMessage?: string;
  /** Number of unread notifications to display */
  unreadCount?: number;
  /** Callback when notifications button is clicked */
  onNotificationsClick?: () => void;
  /** Callback for profile image upload */
  onImageUpload?: (file: File) => Promise<void>;
  /** Weekly progress percentage for progress ring (0-100) */
  weeklyProgress?: number;
  /** Current number of completed sessions this week */
  sessionsCompleted?: number;
  /** Weekly goal for number of sessions */
  weeklyGoal?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getTimeOfDayClass(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

function getMotivationalMessage(
  weeklyProgress: number,
  weeklyGoal: number
): string | null {
  if (weeklyGoal === 0) return null;

  const remaining = weeklyGoal - weeklyProgress;

  if (remaining <= 0) {
    return '🎉 Du har nådd ukesmålet!';
  }

  if (remaining === 1) {
    return '🔥 Bare 1 økt igjen til ukesmålet!';
  }

  if (remaining <= 3) {
    return `🔥 Bare ${remaining} økter igjen til ukesmålet!`;
  }

  const percentage = Math.round((weeklyProgress / weeklyGoal) * 100);

  if (percentage >= 75) {
    return `Du er på god vei – ${weeklyProgress} av ${weeklyGoal} økter fullført`;
  }

  if (percentage >= 50) {
    return `Godt jobbet! ${weeklyProgress} av ${weeklyGoal} økter gjennomført`;
  }

  if (percentage >= 25) {
    return `Du er i gang – ${weeklyProgress} av ${weeklyGoal} økter fullført`;
  }

  return `Ukesmål: ${weeklyProgress} av ${weeklyGoal} økter`;
}

export function ProfileOverviewCard({
  name,
  role,
  email,
  avatarUrl,
  stats = [],
  profileHref = '/mer/profil',
  welcomeMessage,
  unreadCount = 0,
  onNotificationsClick,
  onImageUpload,
  weeklyProgress,
  sessionsCompleted = 0,
  weeklyGoal = 0,
}: ProfileOverviewCardProps) {
  const initials = getInitials(name);
  const greeting = welcomeMessage ?? getGreeting();
  const motivationalMessage = getMotivationalMessage(sessionsCompleted, weeklyGoal);
  const timeOfDay = getTimeOfDayClass();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    try {
      setIsUploading(true);
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const progressPercentage = weeklyProgress ?? 0;
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Define gradient based on time of day
  const gradientClass = {
    morning: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    afternoon: 'bg-gradient-to-br from-blue-50 to-sky-50',
    evening: 'bg-gradient-to-br from-indigo-50 to-purple-50',
  }[timeOfDay];

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-white/10">
      <div className={clsx('p-6 transition-colors duration-500', gradientClass, 'dark:bg-gray-800/75')}>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            {/* Avatar with Progress Ring and Upload */}
            <div className="shrink-0 relative group">
              {/* Hidden file input */}
              {onImageUpload && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Last opp profilbilde"
                />
              )}

              {/* Progress Ring SVG */}
              {weeklyProgress !== undefined && (
                <svg className="absolute inset-0 size-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-green-500 transition-all duration-500"
                  />
                </svg>
              )}

              {/* Avatar Image */}
              <div className="relative mx-auto size-16 mt-0.5 ml-0.5">
                {avatarUrl ? (
                  <img
                    alt={name}
                    src={avatarUrl}
                    className="size-16 rounded-full object-cover dark:ring-1 dark:ring-white/10"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-ak-primary flex items-center justify-center dark:ring-1 dark:ring-white/10">
                    <span className="text-xl font-bold text-white">{initials}</span>
                  </div>
                )}

                {/* Upload Button - shows on hover */}
                {onImageUpload && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={clsx(
                      'absolute bottom-0 right-0',
                      'size-6 rounded-full',
                      'bg-ak-primary hover:bg-ak-primary/90',
                      'text-white',
                      'flex items-center justify-center',
                      'border-2 border-white dark:border-gray-800',
                      'shadow-sm',
                      'transition-all duration-200',
                      'opacity-0 group-hover:opacity-100',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-label="Last opp profilbilde"
                    title="Last opp profilbilde"
                  >
                    <Camera size={12} />
                  </button>
                )}

                {/* Loading Spinner */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {greeting},
              </p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                {name}
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {role}
              </p>
              {motivationalMessage && (
                <p className="mt-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  {motivationalMessage}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-center gap-2 sm:mt-0">
            {/* Notifications Button */}
            {onNotificationsClick && (
              <button
                onClick={onNotificationsClick}
                className="relative flex items-center justify-center rounded-lg bg-white p-2.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/10 dark:hover:bg-white/20 transition-colors"
                title="Varsler"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* View Profile Button */}
            <Link
              to={profileHref}
              className="flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/10 dark:hover:bg-white/20 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      {stats.length > 0 && (
        <div
          className={clsx(
            'grid divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 dark:divide-white/10 dark:border-white/10 dark:bg-gray-800/50',
            stats.length === 1 && 'grid-cols-1',
            stats.length === 2 && 'grid-cols-2 sm:divide-x sm:divide-y-0',
            stats.length === 3 && 'grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-y-0',
            stats.length >= 4 && 'grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-y-0'
          )}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center text-sm font-medium">
              <span className="text-gray-900 dark:text-white">{stat.value}</span>{' '}
              <span className="text-gray-600 dark:text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileOverviewCard;
