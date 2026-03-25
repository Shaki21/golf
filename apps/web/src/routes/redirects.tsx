/**
 * ============================================================
 * URL Redirects - Legacy → V2 Routes
 * TIER Golf
 * ============================================================
 *
 * Håndterer redirects fra gammel URL-struktur til ny.
 * Sikrer at eksisterende dype lenker fortsatt fungerer.
 *
 * Bruk: Import RedirectRoutes i App.jsx og inkluder i Routes.
 *
 * ============================================================
 */

import React from 'react';
import { Navigate, Route } from 'react-router-dom';

/**
 * Mapping fra gammel til ny URL
 */
export const REDIRECT_MAP: Record<string, string> = {
  // Dashboard → Hjem
  '/': '/hjem',
  '/dashboard': '/hjem',

  // Trening → Tren
  '/trening/logg': '/tren/logg',
  '/trening/dagbok': '/tren/logg',
  '/trening': '/tren',
  '/sessions': '/tren/okter',
  '/ovelsesbibliotek': '/tren/ovelser',
  '/oevelser': '/tren/ovelser',

  // Testing → Tren/Testing
  '/testprotokoll': '/tren/testing',
  '/testing/registrer': '/tren/testing/registrer',
  '/testresultater': '/tren/testing/resultater',
  '/testing/krav': '/tren/testing/krav',

  // Kalender → Planlegg
  '/kalender': '/planlegg/kalender',
  '/calendar': '/planlegg/kalender',

  // Turneringer → Planlegg/Turneringer
  '/turneringskalender': '/planlegg/turneringer/kalender',
  '/mine-turneringer': '/planlegg/turneringer/mine',

  // Statistikk → Analyser
  '/statistikk': '/analyser/statistikk',
  '/stats': '/analyser/statistikk',

  // Utvikling → Analyser
  '/min-utvikling': '/analyser/utvikling',
  '/utvikling': '/analyser/utvikling',

  // Målsetninger → Analyser
  '/maalsetninger': '/analyser/mal',
  '/goals': '/analyser/mal',
  '/progress': '/analyser/historikk',

  // Kommunikasjon → Samhandle
  '/meldinger': '/samhandle/meldinger',
  '/kommunikasjon': '/samhandle/meldinger',

  // Kunnskap → Samhandle
  '/ressurser': '/samhandle/kunnskap',
  '/kunnskap': '/samhandle/kunnskap',

  // Skole → Samhandle
  '/skoleplan': '/samhandle/skole',
};

/**
 * Redirect component som navigerer til ny URL
 */
interface RedirectProps {
  from: string;
  to: string;
}

const Redirect: React.FC<RedirectProps> = ({ to }) => (
  <Navigate to={to} replace />
);

/**
 * Genererer Route-elementer for alle redirects
 * Bruk: <Routes>{RedirectRoutes}</Routes>
 */
export const RedirectRoutes = Object.entries(REDIRECT_MAP).map(([from, to]) => (
  <Route key={from} path={from} element={<Redirect from={from} to={to} />} />
));

/**
 * Hook for å håndtere redirect i komponenter
 */
export function useRedirect(pathname: string): string | null {
  return REDIRECT_MAP[pathname] || null;
}

/**
 * Utility for å sjekke om en URL skal redirectes
 */
export function shouldRedirect(pathname: string): boolean {
  return pathname in REDIRECT_MAP;
}

/**
 * Utility for å få redirect-URL
 */
export function getRedirectUrl(pathname: string): string {
  return REDIRECT_MAP[pathname] || pathname;
}

export default RedirectRoutes;
