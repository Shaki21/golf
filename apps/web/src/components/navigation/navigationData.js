/**
 * Navigation Data
 *
 * 4+1 Navigation Structure (Mobile-first) - CONSOLIDATED
 *
 * Main Navigation (Bottom Bar):
 * 1. Hjem - Dashboard
 * 2. Aktivitet - Treningsplan | Treningslogg | Testing
 * 3. Fremgang - Statistikk | Video | Prestasjoner
 * 4. Plan - Kalender | Turneringer | Mål & Plan
 *
 * Burger Menu (☰):
 * - Profil (Min profil, Trenerteam)
 * - Meldinger (Innboks, Varsler)
 * - Innstillinger (Konto, Varsler, Kalibrering)
 * - Ressurser (Bibliotek, Notater & Arkiv)
 */

export const navigationSections = [
  // === MAIN NAVIGATION (4 tabs) ===
  {
    id: 'hjem',
    label: 'Hjem',
    icon: 'Home',
    href: '/',
    isMainNav: true,
  },
  {
    id: 'aktivitet',
    label: 'Status',
    icon: 'Zap',
    isMainNav: true,
    items: [
      { href: '/trening/dagens', label: 'Treningsplan' },
      { href: '/trening/logg', label: 'Treningslogg' },
      { href: '/testprotokoll', label: 'Testing' },
    ],
    // Detailed routes (for path matching)
    allRoutes: [
      '/trening/dagens',
      '/trening/ukens',
      '/trening/logg',
      '/trening/dagbok',
      '/testprotokoll',
      '/testresultater',
      '/testing/registrer',
    ],
  },
  {
    id: 'fremgang',
    label: 'Fremgang',
    icon: 'TrendingUp',
    isMainNav: true,
    items: [
      { href: '/stats', label: 'Statistikk' },
      { href: '/videos', label: 'Video' },
      { href: '/achievements', label: 'Prestasjoner' },
    ],
    // Detailed routes (for path matching)
    allRoutes: [
      '/stats',
      '/utvikling',
      '/utvikling/breaking-points',
      '/utvikling/kategori',
      '/videos',
      '/bevis',
      '/achievements',
      '/badges',
      '/progress',
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'CalendarDays',
    isMainNav: true,
    items: [
      { href: '/kalender', label: 'Kalender' },
      { href: '/turneringskalender', label: 'Turneringer' },
      { href: '/maalsetninger', label: 'Mål & Plan' },
    ],
    // Detailed routes (for path matching)
    allRoutes: [
      '/kalender',
      '/kalender/booking',
      '/turneringskalender',
      '/mine-turneringer',
      '/maalsetninger',
      '/aarsplan',
    ],
  },

  // === BURGER MENU (☰) ===
  {
    id: 'profil',
    label: 'Profil',
    icon: 'User',
    isBurgerMenu: true,
    items: [
      { href: '/profil', label: 'Min profil' },
      { href: '/trenerteam', label: 'Trenerteam' },
    ],
  },
  {
    id: 'meldinger',
    label: 'Meldinger',
    icon: 'MessageSquare',
    isBurgerMenu: true,
    items: [
      { href: '/meldinger', label: 'Innboks' },
      { href: '/varsler', label: 'Varsler' },
    ],
  },
  {
    id: 'innstillinger',
    label: 'Innstillinger',
    icon: 'Settings',
    isBurgerMenu: true,
    items: [
      { href: '/innstillinger', label: 'Konto' },
      { href: '/innstillinger/varsler', label: 'Varsler' },
      { href: '/kalibrering', label: 'Kalibrering' },
    ],
  },
  {
    id: 'ressurser',
    label: 'Ressurser',
    icon: 'BookOpen',
    isBurgerMenu: true,
    items: [
      { href: '/ovelsesbibliotek', label: 'Bibliotek' },
      { href: '/notater', label: 'Notater & Arkiv' },
    ],
    // Detailed routes (for path matching)
    allRoutes: [
      '/ovelsesbibliotek',
      '/ressurser',
      '/notater',
      '/arkiv',
    ],
  },
];

/**
 * Get main navigation items (4 tabs)
 */
export function getMainNavItems() {
  return navigationSections.filter(section => section.isMainNav);
}

/**
 * Get burger menu items
 */
export function getBurgerMenuItems() {
  return navigationSections.filter(section => section.isBurgerMenu);
}

/**
 * Get section by ID
 */
export function getSectionById(id) {
  return navigationSections.find(section => section.id === id);
}

/**
 * Get section that contains a given path
 */
export function getSectionByPath(path) {
  return navigationSections.find(section => {
    if (section.href === path) return true;
    // Check allRoutes first (more comprehensive)
    if (section.allRoutes) {
      return section.allRoutes.some(route => path.startsWith(route.split('?')[0]));
    }
    // Fallback to items
    if (section.items) {
      return section.items.some(item => path.startsWith(item.href.split('?')[0]));
    }
    return false;
  });
}

/**
 * Flat list of all navigation items for search/autocomplete
 */
export function getAllNavigationItems() {
  const items = [];
  navigationSections.forEach(section => {
    if (section.href) {
      items.push({
        href: section.href,
        label: section.label,
        section: section.id,
        icon: section.icon,
      });
    }
    if (section.items) {
      section.items.forEach(item => {
        items.push({
          href: item.href,
          label: item.label,
          section: section.id,
          sectionLabel: section.label,
          icon: section.icon,
        });
      });
    }
  });
  return items;
}
