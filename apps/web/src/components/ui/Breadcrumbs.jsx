/**
 * Breadcrumbs Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Route name mappings
const routeNames = {
  '': 'Dashboard',
  'profil': 'Min Profil',
  'trenerteam': 'Team',
  'maalsetninger': 'Målsetninger',
  'aarsplan': 'Årsplan',
  'kalender': 'Kalender',
  'testprotokoll': 'Testprotokoll',
  'testresultater': 'Testresultater',
  'treningsprotokoll': 'Treningsprotokoll',
  'treningsstatistikk': 'Treningsstatistikk',
  'oevelser': 'Øvelser',
  'ovelsesbibliotek': 'Øvelsesbibliotek',
  'notater': 'Notater',
  'arkiv': 'Arkiv',
  'progress': 'Fremgang',
  'achievements': 'Prestasjoner',
  'sessions': 'Økter',
  'active': 'Aktiv',
  'reflect': 'Refleksjon',
  'coach': 'Trener',
  'modification-requests': 'Planendringer',
  'turneringskalender': 'Turneringskalender',
  'ressurser': 'Ressurser',
  'skoleplan': 'Skoleplan',
};

export default function Breadcrumbs({ customItems, showHome = true }) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Generate breadcrumb items from URL path
  const generateBreadcrumbs = () => {
    const items = [];

    if (showHome) {
      items.push({
        label: 'Hjem',
        href: '/',
        icon: Home,
      });
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      items.push({
        label: name,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    });

    return items;
  };

  const breadcrumbs = customItems || generateBreadcrumbs();

  if (breadcrumbs.length <= 1 && !customItems) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav
      aria-label="Brødsmuler"
      style={{
        marginBottom: '16px',
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flexWrap: 'wrap',
        }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <li
              key={item.href || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {index > 0 && (
                <ChevronRight
                  size={14}
                  color="var(--tier-text-secondary)"
                  style={{ flexShrink: 0 }}
                />
              )}
              {isLast ? (
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--tier-text-primary)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  aria-current="page"
                >
                  {Icon && <Icon size={14} />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  style={{
                    fontSize: '13px',
                    color: 'var(--tier-text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--tier-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--tier-text-secondary)')}
                >
                  {Icon && <Icon size={14} />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
