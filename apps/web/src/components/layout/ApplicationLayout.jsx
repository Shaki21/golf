'use client'

/**
 * ApplicationLayout - Catalyst-based layout with TIER Golf Premium Light styling
 *
 * Uses semantic color tokens from design-system.
 */

import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { navigationConfig } from '../../config/navigation'
import { AKLogo } from '../branding/AKLogo'

import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
  SidebarDivider,
} from '../catalyst/sidebar'
import { SidebarLayout } from '../catalyst/sidebar-layout'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '../catalyst/navbar'
import { Avatar } from '../catalyst/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '../catalyst/dropdown'

const { LogOut, Settings, User, ChevronUp, ChevronDown, ChevronRight } = LucideIcons

// Helper to get icon from string
const getIcon = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Circle
}

function AccountDropdownMenu({ anchor, user, onLogout }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/profil">
        <User data-slot="icon" className="size-4" />
        <DropdownLabel>Min profil</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="/innstillinger">
        <Settings data-slot="icon" className="size-4" />
        <DropdownLabel>Innstillinger</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={onLogout}>
        <LogOut data-slot="icon" className="size-4" />
        <DropdownLabel>Logg ut</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

// Collapsible menu item with submenu
function NavMenuItem({ item, pathname, openMenus, toggleMenu }) {
  const Icon = getIcon(item.icon)
  const isOpen = openMenus[item.label]
  const hasActiveChild = item.submenu?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))

  if (item.submenu) {
    return (
      <div>
        <button
          onClick={() => toggleMenu(item.label)}
          className={`
            flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium
            transition-colors duration-150
            ${hasActiveChild
              ? 'text-tier-gold bg-tier-navy-light'
              : 'text-white hover:bg-tier-navy-light hover:text-tier-gold'}
          `}
        >
          <Icon className="size-5 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {isOpen ? (
            <ChevronDown className="size-4 text-white/60" />
          ) : (
            <ChevronRight className="size-4 text-white/60" />
          )}
        </button>

        {isOpen && (
          <div className="mt-1 ml-7 space-y-0.5">
            {item.submenu.map((subItem) => {
              const active = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
              return (
                <SidebarItem key={subItem.href} href={subItem.href} current={active}>
                  <SidebarLabel>{subItem.label}</SidebarLabel>
                </SidebarItem>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const active = pathname === item.href
  return (
    <SidebarItem href={item.href} current={active}>
      <Icon data-slot="icon" className="size-5" />
      <SidebarLabel>{item.label}</SidebarLabel>
    </SidebarItem>
  )
}

export default function ApplicationLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pathname = location.pathname
  const [openMenus, setOpenMenus] = useState({})

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  // Filter navigation items based on user role
  const items = useMemo(() => {
    const userRole = user?.role || 'player'
    return navigationConfig.filter(item => {
      if (!item.roles) return true
      return item.roles.includes(userRole)
    })
  }, [user?.role])

  // Auto-open menu if current path matches a submenu item
  React.useEffect(() => {
    items.forEach(item => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(sub =>
          pathname === sub.href || pathname.startsWith(sub.href + '/')
        )
        if (hasActiveChild && !openMenus[item.label]) {
          setOpenMenus(prev => ({ ...prev, [item.label]: true }))
        }
      }
    })
  }, [pathname, items])

  const userInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U'
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Bruker'

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar
                  initials={userInitials}
                  className="size-8 bg-tier-navy text-white text-sm"
                  square
                />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" user={user} onLogout={handleLogout} />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="flex justify-center py-2">
              <AKLogo size={44} className="text-white" />
            </div>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {items.map((item) => (
                <NavMenuItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                />
              ))}
            </SidebarSection>

            <SidebarSpacer />
          </SidebarBody>

          <SidebarFooter>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <Avatar
                  initials={userInitials}
                  className="size-8 bg-white/10 text-white text-sm"
                  square
                />
                <SidebarLabel className="text-white">{userName}</SidebarLabel>
                <ChevronUp data-slot="icon" className="size-4 text-white/60" />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" user={user} onLogout={handleLogout} />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
