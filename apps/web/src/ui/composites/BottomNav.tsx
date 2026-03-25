import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Zap,
  TrendingUp,
  CalendarDays,
  Menu,
  User,
  MessageSquare,
  Settings,
  BookOpen,
  ChevronRight,
  ChevronUp,
  Target,
  ClipboardList,
  BarChart3,
  Video,
  Award,
  Calendar,
  Trophy,
  Flag,
  LogOut
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../components/shadcn';
import { useAuth } from '../../contexts/AuthContext';

/**
 * BottomNav
 * Mobile-first bottom tab navigation with 4+1 burger menu structure
 * Features dropdown menus for items with sub-navigation
 *
 * Main tabs: Home, Activity, Progress, Plan
 * Burger menu: Profile, Messages, Settings, Resources
 */

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  subItems?: { label: string; to: string; icon: React.ReactNode }[];
}

interface BurgerMenuItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  subItems?: { label: string; to: string }[];
}

interface BottomNavProps {
  /** Additional className */
  className?: string;
}

// Main navigation items (4 tabs) - Consolidated structure
const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    to: '/',
    icon: <Home size={20} />,
  },
  {
    label: 'Statistics',
    to: '/treningsstatistikk',
    icon: <Zap size={20} />,
    subItems: [
      { label: 'Training Plan', to: '/trening/dagens', icon: <Target size={18} /> },
      { label: 'Training Log', to: '/trening/logg', icon: <Zap size={18} /> },
      { label: 'Testing', to: '/testprotokoll', icon: <ClipboardList size={18} /> },
    ],
  },
  {
    label: 'Progress',
    to: '/fremgang',
    icon: <TrendingUp size={20} />,
    subItems: [
      { label: 'Statistics', to: '/stats', icon: <BarChart3 size={18} /> },
      { label: 'Video', to: '/videos', icon: <Video size={18} /> },
      { label: 'Achievements', to: '/achievements', icon: <Award size={18} /> },
    ],
  },
  {
    label: 'Plan',
    to: '/plan',
    icon: <CalendarDays size={20} />,
    subItems: [
      { label: 'Calendar', to: '/kalender', icon: <Calendar size={18} /> },
      { label: 'Tournaments', to: '/turneringskalender', icon: <Trophy size={18} /> },
      { label: 'Goals & Plan', to: '/maalsetninger', icon: <Flag size={18} /> },
    ],
  },
];

// Burger menu items - Consolidated structure
const burgerMenuItems: BurgerMenuItem[] = [
  {
    label: 'Profile',
    to: '/profil',
    icon: <User size={20} />,
    subItems: [
      { label: 'My Profile', to: '/profil' },
      { label: 'Coach Team', to: '/trenerteam' },
    ],
  },
  {
    label: 'Messages',
    to: '/meldinger',
    icon: <MessageSquare size={20} />,
    subItems: [
      { label: 'Inbox', to: '/meldinger' },
      { label: 'Notifications', to: '/varsler' },
    ],
  },
  {
    label: 'Settings',
    to: '/innstillinger',
    icon: <Settings size={20} />,
    subItems: [
      { label: 'Account', to: '/innstillinger' },
      { label: 'Notifications', to: '/innstillinger/varsler' },
      { label: 'Calibration', to: '/kalibrering' },
    ],
  },
  {
    label: 'Resources',
    to: '/ressurser',
    icon: <BookOpen size={20} />,
    subItems: [
      { label: 'Library', to: '/ovelsesbibliotek' },
      { label: 'Notes & Archive', to: '/notater' },
    ],
  },
];

const BottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const isActive = (path: string, subItems?: { to: string }[]): boolean => {
    if (location.pathname === path) return true;
    if (subItems) {
      return subItems.some(item => location.pathname.startsWith(item.to.split('?')[0]));
    }
    return false;
  };

  const handleSubItemClick = (to: string) => {
    navigate(to);
    setOpenPopover(null);
  };

  const handleMenuItemClick = (to: string) => {
    navigate(to);
    setIsMenuOpen(false);
    setExpandedSection(null);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleSection = (label: string) => {
    setExpandedSection(expandedSection === label ? null : label);
  };

  // Render a nav item - either simple link or with dropdown
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.to, item.subItems);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    // Simple link for items without subitems (like Hjem)
    if (!hasSubItems) {
      return (
        <NavLink
          key={item.to}
          to={item.to}
          aria-current={active ? 'page' : undefined}
          className="flex flex-col items-center justify-center gap-0.5 p-1 pt-2 no-underline flex-1 min-w-0 rounded bg-transparent border-none cursor-pointer relative"
        >
          <span
            className={`flex items-center justify-center ${active ? 'text-tier-gold' : 'text-tier-text-tertiary'}`}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          <span
            className={`text-[10px] text-center ${active ? 'text-tier-gold font-semibold' : 'text-tier-text-tertiary font-medium'}`}
          >
            {item.label}
          </span>
        </NavLink>
      );
    }

    // Popover dropdown for items with subitems
    return (
      <Popover
        key={item.to}
        open={openPopover === item.label}
        onOpenChange={(open) => setOpenPopover(open ? item.label : null)}
      >
        <PopoverTrigger asChild>
          <button
            className="flex flex-col items-center justify-center gap-0.5 p-1 pt-2 no-underline flex-1 min-w-0 rounded bg-transparent border-none cursor-pointer relative"
            aria-expanded={openPopover === item.label}
          >
            <span
              className={`flex items-center justify-center ${active ? 'text-tier-gold' : 'text-tier-text-tertiary'}`}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] text-center ${active ? 'text-tier-gold font-semibold' : 'text-tier-text-tertiary font-medium'}`}
            >
              {item.label}
            </span>
            <ChevronUp
              size={12}
              className={`absolute top-0.5 right-1/2 translate-x-1/2 opacity-60 transition-transform duration-200 ${
                active ? 'text-tier-gold' : 'text-tier-text-tertiary'
              }`}
              style={{
                transform: `translateX(50%) ${openPopover === item.label ? 'rotate(0deg)' : 'rotate(180deg)'}`,
              }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          className="p-0 w-auto min-w-[160px]"
        >
          <div className="px-3 py-2 border-b border-tier-border-subtle">
            <span className="text-[11px] font-semibold text-tier-text-secondary uppercase tracking-wide">
              {item.label}
            </span>
          </div>
          <div className="p-1">
            {item.subItems?.map((subItem) => {
              const subActive = location.pathname === subItem.to ||
                location.pathname.startsWith(subItem.to.split('?')[0]);
              return (
                <button
                  key={subItem.to}
                  onClick={() => handleSubItemClick(subItem.to)}
                  className={`flex items-center gap-2 px-3 py-2 w-full border-none bg-transparent rounded cursor-pointer text-left transition-colors duration-150 ${
                    subActive ? 'bg-tier-gold/10' : 'hover:bg-tier-surface-subtle'
                  }`}
                >
                  <span className="flex items-center text-tier-text-secondary">{subItem.icon}</span>
                  <span className="text-sm font-medium text-tier-navy">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      <nav
        className={`flex justify-around items-center bg-white border-t border-tier-border-subtle pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] w-full relative ${className}`}
        aria-label="Main navigation"
      >
        {/* Main 4 navigation items */}
        {mainNavItems.map(renderNavItem)}

        {/* Burger menu button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 p-1 pt-2 no-underline flex-1 min-w-0 rounded bg-transparent border-none cursor-pointer relative"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
        >
          <span className="flex items-center justify-center text-tier-text-tertiary" aria-hidden="true">
            <Menu size={20} />
          </span>
          <span className="text-[10px] text-center text-tier-text-tertiary font-medium">
            More
          </span>
        </button>
      </nav>

      {/* Burger menu sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader className="border-b border-tier-border-subtle pb-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col flex-1 pt-4">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-tier-surface-subtle rounded-lg mb-4">
                <div className="w-10 h-10 rounded-full bg-tier-gold text-white flex items-center justify-center font-semibold text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm text-tier-navy">{user.firstName} {user.lastName}</span>
                  <span className="text-[11px] text-tier-text-secondary">{user.email}</span>
                </div>
              </div>
            )}

            {/* Menu items */}
            <div className="flex flex-col gap-1 flex-1">
              {burgerMenuItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                  <button
                    onClick={() => item.subItems ? toggleSection(item.label) : handleMenuItemClick(item.to)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-transparent border-none cursor-pointer w-full text-left transition-colors duration-150 hover:bg-tier-surface-subtle"
                  >
                    <span className="text-tier-text-secondary flex items-center">{item.icon}</span>
                    <span className="flex-1 text-sm font-medium text-tier-navy">{item.label}</span>
                    {item.subItems && (
                      <ChevronRight
                        size={18}
                        className={`text-tier-text-tertiary transition-transform duration-200 ${
                          expandedSection === item.label ? 'rotate-90' : 'rotate-0'
                        }`}
                      />
                    )}
                  </button>

                  {/* Sub-items */}
                  {item.subItems && expandedSection === item.label && (
                    <div className="flex flex-col pl-[calc(0.75rem+20px+0.75rem)] gap-0.5">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.to}
                          onClick={() => handleMenuItemClick(subItem.to)}
                          className={`px-3 py-2 rounded bg-transparent border-none cursor-pointer text-left text-[11px] transition-colors duration-150 ${
                            location.pathname === subItem.to
                              ? 'bg-tier-gold/10 text-tier-gold'
                              : 'text-tier-text-secondary hover:bg-tier-surface-subtle'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Logout button */}
            <div className="border-t border-tier-border-subtle pt-4 mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg bg-transparent border-none cursor-pointer w-full text-left text-sm font-medium text-red-500"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
