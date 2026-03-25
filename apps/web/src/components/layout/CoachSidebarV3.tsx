/**
 * ============================================================
 * CoachSidebarV3 - Simplified flat sidebar for coaches (Phase 1 UX)
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * New sidebar with only 5 top-level options without nesting:
 * 1. Home (navy)
 * 2. Players (green)
 * 3. Analysis (blue)
 * 4. Plan (amber)
 * 5. More (purple)
 *
 * Subpages are shown as horizontal tabs on each hub page.
 *
 * Advantages over V2:
 * - No nested menus = fewer clicks
 * - Clear visual hierarchy
 * - Faster navigation
 * - Better mobile experience
 *
 * ============================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  coachNavigationFlat,
  getCoachFlatAreaByPath,
  areaColors,
  type CoachFlatNavItem,
  type AreaColor,
} from '../../config/coach-navigation-v3';
import { QuickActionsCompact } from '../dashboard/QuickActions';
import { coachQuickActions } from '../../config/quick-actions';

const { LogOut, Menu, X, Circle } = LucideIcons;

// Helper to get icon from string name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIcon = (iconName: string): React.ComponentType<{ size?: number; className?: string }> => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
  return icons[iconName] || Circle;
};

// Color classes for active nav items
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

interface CoachSidebarV3Props {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  unreadMessages?: number;
  dashboardAttentionCount?: number;
  onLogout?: () => void;
}

export default function CoachSidebarV3({
  user,
  unreadMessages = 0,
  dashboardAttentionCount = 0,
  onLogout,
}: CoachSidebarV3Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map navigation items with icons and badges
  const items = useMemo(() => {
    return coachNavigationFlat.map(item => {
      let badgeValue: string | undefined;

      if (item.badge === 'unreadMessages' && unreadMessages > 0) {
        badgeValue = unreadMessages > 99 ? '99+' : String(unreadMessages);
      } else if (item.badge === 'dashboardAttention' && dashboardAttentionCount > 0) {
        badgeValue = dashboardAttentionCount > 99 ? '99+' : String(dashboardAttentionCount);
      }

      return {
        ...item,
        Icon: getIcon(item.icon),
        badgeValue,
      };
    });
  }, [unreadMessages, dashboardAttentionCount]);

  // Get current active area
  const currentArea = useMemo(() => getCoachFlatAreaByPath(pathname), [pathname]);

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
  const isActive = (item: CoachFlatNavItem) => {
    if (pathname === item.href) return true;
    if (item.href !== '/coach' && pathname.startsWith(item.href + '/')) return true;
    // Special case for /coach root
    if (item.href === '/coach' && pathname === '/coach') return true;
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
          >
            <item.Icon size={20} className={active ? '' : 'opacity-70'} />
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
      <QuickActionsCompact actions={coachQuickActions.slice(0, 2)} />
    </div>
  );

  // Render user section
  const renderUserSection = () => (
    <div className="p-4 mt-auto">
      <div className="bg-tier-surface-secondary rounded-xl p-4 border border-tier-border-subtle">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-tier-navy flex items-center justify-center text-tier-white font-bold">
            {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-tier-navy truncate">
              {user?.firstName || 'Coach'} {user?.lastName || ''}
            </div>
            <div className="text-xs text-tier-text-tertiary truncate">
              {user?.email || 'trener@tiergolf.no'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'text-sm font-medium text-tier-text-secondary',
            'border border-tier-border-subtle',
            'hover:bg-tier-surface-tertiary hover:text-tier-text-primary',
            'transition-colors duration-200'
          )}
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );

  // Render logo
  const renderLogo = () => (
    <Link
      to="/coach"
      className="flex items-center gap-3 px-4 py-5 border-b border-tier-border-subtle"
      aria-label="Go to Coach Dashboard"
    >
      <img
        src="/assets/tier-golf/tier-golf-icon.svg"
        alt="TIER Golf"
        className="w-10 h-10"
      />
      <div>
        <div className="text-tier-navy font-bold text-lg">TIER Golf</div>
        <div className="text-tier-text-tertiary text-xs">Coach Portal</div>
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
            to="/coach"
            className="flex items-center gap-2"
            aria-label="Go to Coach Dashboard"
          >
            <img
              src="/assets/tier-golf/tier-golf-icon.svg"
              alt="TIER Golf"
              className="w-8 h-8"
            />
            <span className="font-bold text-tier-navy">TIER Golf</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-tier-surface-secondary transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
          {renderUserSection()}
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-tier-white border-t border-tier-border-subtle flex items-center justify-around z-50 safe-area-inset-bottom">
          {items.slice(0, 5).map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px]',
                  'transition-colors duration-200',
                  active
                    ? 'text-tier-gold'
                    : 'text-tier-text-tertiary hover:text-tier-text-secondary'
                )}
              >
                <item.Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.badgeValue && (
                  <span className="absolute -top-1 right-0 min-w-[16px] h-4 px-1 rounded-full bg-status-error text-tier-white text-[10px] font-bold flex items-center justify-center">
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
