/**
 * TIER Golf - Profile Dropdown
 * Design System v3.0 - Forest Green (Premium Light)
 * Migrated to Tailwind CSS
 *
 * Avatar dropdown-meny med profil og innstillinger.
 * Erstatter innstillinger i sidebar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { settingsMenuItems } from '../../config/player-navigation-v2';
import { Avatar } from '../../ui/primitives/Avatar';

const { LogOut, ChevronDown } = LucideIcons;

// Helper to get icon from string name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIcon = (iconName: string): React.ComponentType<any> => {
  return (LucideIcons as any)[iconName] || LucideIcons.Circle;
};

interface ProfileDropdownProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  onLogout?: () => void;
  variant?: 'light' | 'dark';
}

export default function ProfileDropdown({
  user,
  onLogout,
  variant = 'dark'
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'Spiller';

  const isDark = variant === 'dark';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-none cursor-pointer transition-all duration-200 ${
          isDark ? 'bg-white/[0.08] hover:bg-white/[0.12]' : 'bg-black/[0.04] hover:bg-black/[0.08]'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Åpne profilmeny"
      >
        <Avatar name={displayName} size="sm" />
        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-tier-navy'}`}>
          {displayName}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isDark ? 'text-white/60' : 'text-black/40'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden z-[1000] transition-all duration-200 ${
          isOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-2'
        }`}
        role="menu"
        aria-label="Profilmeny"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-[15px] font-semibold text-tier-navy mb-0.5">
            {displayName}
          </div>
          {user?.email && (
            <div className="text-[13px] text-gray-600">{user.email}</div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {settingsMenuItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline text-tier-navy text-sm font-medium transition-colors duration-150 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className="text-gray-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-gray-200 my-2" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 text-sm font-medium transition-colors duration-150 cursor-pointer border-none bg-transparent w-full text-left hover:bg-red-600/[0.08]"
            role="menuitem"
          >
            <LogOut size={18} />
            <span>Logg ut</span>
          </button>
        </div>
      </div>
    </div>
  );
}
