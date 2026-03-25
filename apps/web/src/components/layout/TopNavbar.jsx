/**
 * TopNavbar Component
 *
 * Top navigation bar with responsive mobile menu.
 * Uses TIER Golf design tokens and integrates with auth context.
 */

import React from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Trening', href: '/sessions' },
  { name: 'Kalender', href: '/kalender' },
  { name: 'Utvikling', href: '/utvikling' },
  { name: 'Mål', href: '/maalsetninger' },
  { name: 'Testing', href: '/testprotokoll' },
  { name: 'Turneringer', href: '/turneringskalender' },
  { name: 'Kunnskap', href: '/ressurser' },
];

const userNavigation = [
  { name: 'Min profil', href: '/profil' },
  { name: 'Innstillinger', href: '/innstillinger/varsler' },
  { name: 'Logg ut', href: '#', action: 'logout' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get user initials from name
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleUserNavClick = async (item, close) => {
    if (item.action === 'logout') {
      await logout();
      navigate('/login');
    } else {
      navigate(item.href);
    }
    close?.();
  };

  const isCurrentPath = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <Disclosure as="nav" className="bg-[var(--accent)]">
      {({ close }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                {/* Logo */}
                <Link to="/" className="shrink-0">
                  <img
                    alt="TIER Golf"
                    src="/logo-white.svg"
                    className="h-8 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-[var(--text-inverse)] font-bold text-lg">
                    TIER Golf
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        aria-current={isCurrentPath(item.href) ? 'page' : undefined}
                        className={classNames(
                          isCurrentPath(item.href)
                            ? 'bg-[var(--accent-dark)] text-[var(--text-inverse)]'
                            : 'text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]',
                          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Right Section */}
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {/* Notifications */}
                  <Link
                    to="/varsler"
                    className="relative rounded-full p-1 text-[var(--text-inverse)]/70 hover:text-[var(--text-inverse)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-inverse)] transition-colors"
                  >
                    <span className="sr-only">Vis varsler</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </Link>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <MenuButton className="relative flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-inverse)]">
                      <span className="sr-only">Åpne brukermeny</span>
                      {user?.avatarUrl ? (
                        <img
                          alt=""
                          src={user.avatarUrl}
                          className="size-8 rounded-full outline -outline-offset-1 outline-[var(--text-inverse)]/10"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-[var(--accent-dark)] flex items-center justify-center text-[var(--text-inverse)] text-sm font-medium">
                          {getInitials(user?.name || user?.email)}
                        </div>
                      )}
                    </MenuButton>

                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[var(--background-white)] py-1 shadow-lg border border-[var(--border-default)] transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                      {userNavigation.map((item) => (
                        <MenuItem key={item.name}>
                          <button
                            onClick={() => handleUserNavClick(item)}
                            className="block w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] data-focus:bg-[var(--background-surface)] data-focus:outline-hidden"
                          >
                            {item.name}
                          </button>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex md:hidden">
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-[var(--accent)] p-2 text-[var(--text-inverse)]/70 hover:bg-[var(--accent-hover)] hover:text-[var(--text-inverse)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-inverse)]">
                  <span className="sr-only">Åpne hovedmeny</span>
                  <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                  <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={Link}
                  to={item.href}
                  aria-current={isCurrentPath(item.href) ? 'page' : undefined}
                  className={classNames(
                    isCurrentPath(item.href)
                      ? 'bg-[var(--accent-dark)] text-[var(--text-inverse)]'
                      : 'text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]',
                    'block rounded-md px-3 py-2 text-base font-medium',
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>

            {/* Mobile user section */}
            <div className="border-t border-[var(--accent-dark)] pt-4 pb-3">
              <div className="flex items-center px-5">
                <div className="shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      alt=""
                      src={user.avatarUrl}
                      className="size-10 rounded-full outline -outline-offset-1 outline-[var(--text-inverse)]/10"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-[var(--accent-dark)] flex items-center justify-center text-[var(--text-inverse)] text-base font-medium">
                      {getInitials(user?.name || user?.email)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-[var(--text-inverse)]">
                    {user?.name || 'Bruker'}
                  </div>
                  <div className="text-sm font-medium text-[var(--text-inverse)]/70">
                    {user?.email}
                  </div>
                </div>
                <Link
                  to="/varsler"
                  className="relative ml-auto shrink-0 rounded-full p-1 text-[var(--text-inverse)]/70 hover:text-[var(--text-inverse)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-inverse)]"
                >
                  <span className="sr-only">Vis varsler</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </Link>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {userNavigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="button"
                    onClick={() => handleUserNavClick(item, close)}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default TopNavbar;
