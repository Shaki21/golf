/**
 * TIER Golf - Main Application Layout
 *
 * Uses Catalyst SidebarLayout with TIER Golf styling.
 * Provides consistent navigation and structure across the app.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  SidebarLayout,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarDivider,
  SidebarSpacer,
  Navbar,
  NavbarSection,
  NavbarSpacer,
  NavbarItem,
  Avatar,
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from '../ui';
import {
  Home,
  Target,
  Trophy,
  Calendar,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';

// Navigation items for players
const playerNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Min Utvikling', href: '/progress', icon: Target },
  { name: 'Mål', href: '/goals', icon: Trophy },
  { name: 'Kalender', href: '/calendar', icon: Calendar },
  { name: 'Trening', href: '/training', icon: BookOpen },
];

// Navigation items for coaches
const coachNavItems = [
  { name: 'Dashboard', href: '/coach/dashboard', icon: Home },
  { name: 'Mine Spillere', href: '/coach/athletes', icon: User },
  { name: 'Treningsplaner', href: '/coach/training-plans', icon: BookOpen },
  { name: 'Kalender', href: '/coach/calendar', icon: Calendar },
];

export default function AppLayout({ children, userRole = 'player', user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navItems = userRole === 'coach' ? coachNavItems : playerNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <SidebarLayout
      navbar={
        <Navbar className="bg-ak-surface-card dark:bg-ak-surface-dark-base border-b border-ak-border dark:border-ak-surface-dark-border">
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar
                  src={user?.avatar}
                  initials={user?.name?.charAt(0) || 'U'}
                  className="size-8 bg-ak-primary text-ak-text-inverse"
                />
                <span className="ml-2 hidden sm:inline text-ak-text-primary dark:text-ak-text-inverse">
                  {user?.name || 'Bruker'}
                </span>
                <ChevronDown className="ml-1 size-4 text-ak-text-muted" />
              </DropdownButton>
              <DropdownMenu anchor="bottom end" className="min-w-48">
                <DropdownItem href="/profile">
                  <User className="size-4" />
                  <span>Min Profil</span>
                </DropdownItem>
                <DropdownItem href="/settings">
                  <Settings className="size-4" />
                  <span>Innstillinger</span>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span>Logg ut</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar className="bg-ak-surface-card dark:bg-ak-surface-dark-base">
          <SidebarHeader>
            <div className="flex items-center gap-3 px-2">
              <img
                src="/assets/tier-golf/tier-golf-icon.svg"
                alt="TIER Golf"
                className="h-10 w-10"
              />
              <div>
                <p className="text-sm font-semibold text-ak-text-primary dark:text-ak-text-inverse">
                  TIER Golf
                </p>
                <p className="text-xs text-ak-text-muted">
                  {userRole === 'coach' ? 'Trener' : 'Spiller'}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  current={location.pathname === item.href}
                >
                  <item.icon className="size-5" data-slot="icon" />
                  <SidebarLabel>{item.name}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="/settings">
                <Settings className="size-5" data-slot="icon" />
                <SidebarLabel>Innstillinger</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter>
            <SidebarSection>
              <SidebarItem onClick={handleLogout}>
                <LogOut className="size-5" data-slot="icon" />
                <SidebarLabel>Logg ut</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <main className="min-h-screen bg-ak-surface-base dark:bg-ak-surface-dark-base">
        {children}
      </main>
    </SidebarLayout>
  );
}
