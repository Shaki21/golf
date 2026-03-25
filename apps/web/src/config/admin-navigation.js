/**
 * ============================================================
 * ADMIN NAVIGASJONSKONFIGURASJON - TIER Golf
 * ============================================================
 *
 * Navigasjon for administratorer i TIER Golf systemet.
 * Basert på COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 *
 * VIKTIG:
 * - Admin har IKKE tilgang til spillerdata eller prestasjoner
 * - Admin administrerer kun systemkonfigurasjon
 *
 * ============================================================
 */

export const adminNavigationConfig = [
  // ────────────────────────────────────────────────────────────
  // SYSTEM OVERSIKT
  // ────────────────────────────────────────────────────────────
  {
    label: 'Systemoversikt',
    icon: 'Server',
    href: '/admin'
  },

  // ────────────────────────────────────────────────────────────
  // BRUKERADMINISTRASJON
  // ────────────────────────────────────────────────────────────
  {
    label: 'Brukere',
    icon: 'Users',
    submenu: [
      { href: '/admin/users/coaches', label: 'Trenere' },
      { href: '/admin/users/pending', label: 'Ventende godkjenninger' },
      { href: '/admin/users/invitations', label: 'Invitasjoner' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // ABONNEMENT & TIERS
  // ────────────────────────────────────────────────────────────
  {
    label: 'Abonnement',
    icon: 'CreditCard',
    submenu: [
      { href: '/admin/tiers', label: 'Subscription Tiers' },
      { href: '/admin/tiers/features', label: 'Features per Tier' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // FEATURE FLAGS
  // ────────────────────────────────────────────────────────────
  {
    label: 'Feature Flags',
    icon: 'ToggleLeft',
    href: '/admin/feature-flags'
  },

  // ────────────────────────────────────────────────────────────
  // SUPPORT & ESKALERING
  // ────────────────────────────────────────────────────────────
  {
    label: 'Support',
    icon: 'Headphones',
    href: '/admin/support',
    badge: 'openTickets' // Dynamisk basert på åpne saker
  },

  // ────────────────────────────────────────────────────────────
  // SYSTEM LOGS
  // ────────────────────────────────────────────────────────────
  {
    label: 'Systemlogg',
    icon: 'FileText',
    submenu: [
      { href: '/admin/logs/audit', label: 'Audit Log' },
      { href: '/admin/logs/errors', label: 'Error Log' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // KONFIGURASJON
  // ────────────────────────────────────────────────────────────
  {
    label: 'Konfigurasjon',
    icon: 'Settings',
    submenu: [
      { href: '/admin/config/categories', label: 'Kategorier (A-K)' },
      { href: '/admin/config/tests', label: 'Testkonfigurasjon' },
      { href: '/admin/config/notifications', label: 'Varsler' },
    ]
  },
];

/**
 * ============================================================
 * ADMIN SYSTEM STATUS
 * ============================================================
 *
 * Vises i toppen av admin sidebar.
 */

export const adminSystemStatus = {
  showEnvironmentBadge: true,
  showVersion: true,
  showUptime: true,
};

/**
 * ============================================================
 * ADMIN SIDEBAR SEKSJONER
 * ============================================================
 */

export const adminSidebarSections = {
  overview: adminNavigationConfig.slice(0, 1),    // Systemoversikt
  users: adminNavigationConfig.slice(1, 2),       // Brukere
  billing: adminNavigationConfig.slice(2, 4),     // Abonnement, Feature Flags
  support: adminNavigationConfig.slice(4, 6),     // Support, Systemlogg
  config: adminNavigationConfig.slice(6),         // Konfigurasjon
};
