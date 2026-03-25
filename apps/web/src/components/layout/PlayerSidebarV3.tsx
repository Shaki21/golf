/**
 * ============================================================
 * PlayerSidebarV3 - Simplified flat sidebar (Phase 2 UX)
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * New sidebar with only 4 top-level choices without nesting:
 * 1. Home
 * 2. Training (green)
 * 3. Progress (blue) - replaces "Analysis"
 * 4. Plan (amber)
 *
 * User functions have been moved to:
 * - Notification icon in header (messages)
 * - User dropdown in header (profile, settings, help, log out)
 *
 * Subpages are displayed as horizontal tabs on each hub page.
 *
 * ============================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  playerNavigationFlat,
  getFlatAreaByPath,
  areaColors,
  userMenuItems,
  type FlatNavItem,
  type AreaColor,
} from '../../config/player-navigation-v3';
import { QuickActionsCompact } from '../dashboard/QuickActions';
import { playerQuickActions } from '../../config/quick-actions';

const { LogOut, Menu, X, Circle, Bell, User, Settings, HelpCircle, CreditCard, ChevronDown } = LucideIcons;

// Helper to get icon from string name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIcon = (iconName: string): React.ComponentType<{ size?: number; className?: string }> => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
  return icons[iconName] || Circle;
};

// Color classes for active nav-items
const activeColorClasses: Record<AreaColor, string> = {
  default: 'bg-tier-navy/10 text-tier-navy border-tier-navy',
  green: 'bg-status-success/10 text-status-success border-status-success',
  blue: 'bg-status-info/10 text-status-info border-status-info',
  amber: 'bg-status-warning/10 text-status-warning border-status-warning',
  purple: 'bg-category-j/10 text-category-j border-category-j',
};

const hoverColorClasses: Record<AreaColor, string> = {
  default: 'hover:bg-tier-navy/5',
  green: 'hover:bg-status-success/5',
  blue: 'hover:bg-status-info/5',
  amber: 'hover:bg-status-warning/5',
  purple: 'hover:bg-category-j/5',
};

interface PlayerSidebarV3Props {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  unreadMessages?: number;
  /** Number of items requiring attention in Plan area (at-risk goals, missing logs, etc.) */
  planAttentionCount?: number;
  onLogout?: () => void;
}

export default function PlayerSidebarV3({
  user,
  unreadMessages = 0,
  planAttentionCount = 0,
  onLogout,
}: PlayerSidebarV3Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Map navigation items with icons and badges
  const items = useMemo(() => {
    return playerNavigationFlat.map(item => {
      let badgeValue: string | undefined;
      let showAttentionDot = false;

      // Message count badge for "More" area
      if (item.badge === 'unreadMessages' && unreadMessages > 0) {
        badgeValue = unreadMessages > 99 ? '99+' : String(unreadMessages);
      }

      // Attention dot for Plan area (subtle, non-intrusive)
      if (item.id === 'plan' && planAttentionCount > 0) {
        showAttentionDot = true;
      }

      return {
        ...item,
        Icon: getIcon(item.icon),
        badgeValue,
        showAttentionDot,
      };
    });
  }, [unreadMessages, planAttentionCount]);

  // Get current active area
  const currentArea = useMemo(() => getFlatAreaByPath(pathname), [pathname]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  // Check if a nav item is active
  const isActive = (item: FlatNavItem) => {
    if (pathname === item.href) return true;
    if (item.href !== '/' && pathname.startsWith(item.href + '/')) return true;
    return false;
  };

  // Render navigation items
  const renderNavItems = () => (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold',
              'transition-all duration-200 border-l-4',
              active
                ? activeColorClasses[item.color]
                : cn(
                    'border-transparent text-tier-text-secondary',
                    hoverColorClasses[item.color]
                  )
            )}
            aria-label={item.showAttentionDot ? `${item.label} - requires attention` : item.label}
          >
            <div className="relative">
              <item.Icon size={20} className={active ? '' : 'opacity-70'} />
              {/* Attention dot - subtle indicator for items needing attention */}
              {item.showAttentionDot && (
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-status-warning rounded-full border-2 border-tier-white"
                  aria-hidden="true"
                />
              )}
            </div>
            <span className="flex-1">{item.label}</span>
            {item.badgeValue && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-status-error text-tier-white text-xs font-bold flex items-center justify-center">
                {item.badgeValue}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  // Render quick actions
  const renderQuickActions = () => (
    <div className="px-3 py-4 border-b border-tier-border-subtle">
      <QuickActionsCompact actions={playerQuickActions.slice(0, 2)} />
    </div>
  );

  // Render notification button
  const renderNotificationButton = () => (
    <Link
      to="/mer/meldinger"
      className="relative p-2 rounded-lg hover:bg-tier-surface-secondary transition-colors"
      aria-label="Messages"
    >
      <Bell size={20} className="text-tier-text-secondary" />
      {unreadMessages > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-status-error text-tier-white text-[10px] font-bold flex items-center justify-center">
          {unreadMessages > 99 ? '99+' : unreadMessages}
        </span>
      )}
    </Link>
  );

  // Render user dropdown
  const renderUserDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-tier-surface-secondary transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-tier-gold flex items-center justify-center text-tier-white font-bold text-sm">
          {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U'}
        </div>
        <ChevronDown size={16} className={cn(
          'text-tier-text-secondary transition-transform',
          isUserMenuOpen && 'rotate-180'
        )} />
      </button>

      {isUserMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-56 bg-tier-white rounded-xl border border-tier-border-subtle shadow-lg z-50 py-2">
            {/* User info */}
            <div className="px-4 py-3 border-b border-tier-border-subtle">
              <div className="text-sm font-semibold text-tier-navy">
                {user?.firstName || 'Player'} {user?.lastName || ''}
              </div>
              <div className="text-xs text-tier-text-tertiary truncate">
                {user?.email || 'player@tiergolf.com'}
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {userMenuItems.map((item) => {
                const MenuIcon = getIcon(item.icon);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-tier-text-secondary hover:bg-tier-surface-secondary hover:text-tier-text-primary transition-colors"
                  >
                    <MenuIcon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-tier-border-subtle pt-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-status-error/5 transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render user section (for sidebar)
  const renderUserSection = () => (
    <div className="p-4 mt-auto border-t border-tier-border-subtle">
      <div className="flex items-center gap-3">
        {renderNotificationButton()}
        {renderUserDropdown()}
      </div>
    </div>
  );

  // Render logo
  const renderLogo = () => (
    <Link
      to="/dashboard"
      className="flex items-center gap-3 px-4 py-5 border-b border-tier-border-subtle"
      aria-label="Go to Dashboard"
    >
      <img
        src="/assets/tier-golf/tier-golf-icon.svg"
        alt="TIER Golf"
        className="w-10 h-10"
      />
      <div>
        <div className="text-tier-navy font-bold text-lg">TIER Golf</div>
      </div>
    </Link>
  );

  // Mobile view
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-tier-white border-b border-tier-border-subtle flex items-center justify-between px-4 z-50">
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            aria-label="Go to Dashboard"
          >
            <img
              src="/assets/tier-golf/tier-golf-icon.svg"
              alt="TIER Golf"
              className="w-8 h-8"
            />
            <span className="font-bold text-tier-navy">TIER Golf</span>
          </Link>

          <div className="flex items-center gap-1">
            {renderNotificationButton()}
            {renderUserDropdown()}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-tier-surface-secondary transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            'fixed top-14 left-0 bottom-0 w-72 bg-tier-white z-40',
            'flex flex-col border-r border-tier-border-subtle',
            'transform transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {renderQuickActions()}
          <div className="flex-1 overflow-y-auto p-3">
            {renderNavItems()}
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-tier-white border-t border-tier-border-subtle flex items-center justify-around z-50 safe-area-inset-bottom">
          {items.slice(0, 4).map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px]',
                  'transition-colors duration-200',
                  active
                    ? 'text-tier-gold'
                    : 'text-tier-text-tertiary hover:text-tier-text-secondary'
                )}
                aria-label={item.showAttentionDot ? `${item.label} - requires attention` : item.label}
              >
                <div className="relative">
                  <item.Icon size={22} />
                  {/* Attention dot for mobile */}
                  {item.showAttentionDot && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-status-warning rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.badgeValue && (
                  <span className="absolute top-0 right-1 min-w-[16px] h-4 px-1 rounded-full bg-status-error text-tier-white text-[10px] font-bold flex items-center justify-center">
                    {item.badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </>
    );
  }

  // Desktop view
  return (
    <aside className="w-64 h-screen bg-tier-white border-r border-tier-border-subtle flex flex-col flex-shrink-0 ">
      {renderLogo()}
      {renderQuickActions()}
      <div className="flex-1 overflow-y-auto p-3">
        {renderNavItems()}
      </div>
      {renderUserSection()}
    </aside>
  );
}
