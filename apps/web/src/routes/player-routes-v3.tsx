/**
 * ============================================================
 * PLAYER ROUTES V3 - TIER Golf
 * ============================================================
 *
 * Route definitions for the player portal with 5-area structure.
 *
 * Areas:
 * 1. /dashboard - Dashboard (home)
 * 2. /trening/* - Training (green)
 * 3. /utvikling/* - My Development (blue)
 * 4. /plan/* - Plan (amber)
 * 5. /mer/* - More (purple)
 *
 * ============================================================
 */

import React, { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageTitle } from '../components/typography';

// ============================================================
// Lazy-loaded Hub Pages
// ============================================================

const DashboardHub = lazy(() => import('../features/hub-pages/DashboardHub'));
const TreningHub = lazy(() => import('../features/hub-pages/TreningHub'));
const UtviklingHub = lazy(() => import('../features/hub-pages/UtviklingHub'));
const PlanHub = lazy(() => import('../features/hub-pages/PlanHub'));
const MerHub = lazy(() => import('../features/hub-pages/MerHub'));

// ============================================================
// Existing Page Components (lazy loaded)
// ============================================================

// Training area
const TreningLogg = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Log training" /> }));
const TreningDagbok = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Training diary" /> }));
const TreningOkter = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="My sessions" /> }));
const TreningPlan = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Training plan" /> }));
const TreningOvelser = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Exercise library" /> }));
const TreningVideoer = lazy(() => import('../features/video-library/VideoLibrary'));
const VideoAnnotation = lazy(() => import('../features/video-annotations/VideoAnnotationPage'));
const TreningTesting = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Testing" /> }));
const TreningTestRegistrer = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Register test" /> }));
const TreningTeknikkplan = lazy(() => import('../features/technique-plan/TechniquePlanPage'));
const TreningFokus = lazy(() => import('../features/focus-engine/FocusEnginePage'));
const TreningStatistikk = lazy(() => import('../features/training/TrainingStatsDashboard'));

// Development area
const UtviklingOversikt = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="My development" /> }));
const UtviklingStatistikk = lazy(() => import('../features/stats/StatsPage'));
const UtviklingHistorikk = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="History" /> }));
const UtviklingTestresultater = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Test results" /> }));
const UtviklingKrav = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Category requirements" /> }));
const UtviklingBadges = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Badges" /> }));
const UtviklingAchievements = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Achievements" /> }));
const UtviklingStrokesGained = lazy(() => import('../features/strokes-gained/StrokesGainedPage'));
const UtviklingDataGolf = lazy(() => import('../features/datagolf/PlayerDataGolfPage'));
const UtviklingBreakingPoints = lazy(() => import('../features/breaking-points/BreakingPointsPage'));
const UtviklingTreningsomrader = lazy(() => import('../features/training-area-performance/TrainingAreaPerformancePage').then(m => ({ default: m.TrainingAreaPerformancePage })));
const UtviklingPeerComparison = lazy(() => import('../features/peer-comparison/PeerComparisonPage'));
const ProgressReportsPage = lazy(() => import('../features/progress-reports/ProgressReportsPage'));

// Plan area
const PlanKalender = lazy(() => import('../features/calendar/CalendarPage'));
const NotionKalender = lazy(() => import('../features/calendar/NotionCalendarPage'));
const PlayerCalendarPage = lazy(() => import('../features/calendar/PlayerCalendarPage'));
const PlanUkeplan = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Weekly plan" /> }));
const PlanBooking = lazy(() => import('../features/bookings/PlayerBookingPage'));
const PlanSkole = lazy(() => import('../features/school/SkoleplanContainer'));
const PlanMaal = lazy(() => import('../features/goals/GoalsPage'));
const PlanAarsplan = lazy(() => import('../features/player-annual-plan').then(m => ({ default: m.PlayerAnnualPlanOverview })));
const PlanAarsplanWizard = lazy(() => import('../features/player-annual-plan').then(m => ({ default: m.PlayerAnnualPlanWizard })));
const PlanTurneringer = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Tournament calendar" /> }));
const PlanMineTurneringer = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="My tournaments" /> }));
const TournamentPrepPage = lazy(() => import('../features/tournament-prep/TournamentPrepPage'));

// Onboarding
const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage'));
const IntakeFormPage = lazy(() => import('../features/intake/IntakeFormPage'));

// More area
const MerProfil = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="My profile" /> }));
const MerProfilRediger = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Edit profile" /> }));
const MerTrenerteam = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Coach team" /> }));
const MerMeldinger = lazy(() => import('../features/chat/ChatPage'));
const MerFeedback = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Coach feedback" /> }));
const MerKunnskap = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Knowledge base" /> }));
const MerNotater = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Notes" /> }));
const MerInnstillinger = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Settings" /> }));
const MerSupport = lazy(() => import('../features/support/SupportPage'));
const MerVarsler = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Notification settings" /> }));
const CalibrationPage = lazy(() => import('../features/calibration/CalibrationPage'));
const WeatherCoursesPage = lazy(() => import('../features/weather-courses/WeatherCoursesPage'));
const PlayerInsightsPage = lazy(() => import('../features/player-insights/PlayerInsightsPage'));
const AIConversationsHistoryPage = lazy(() => import('../features/ai-conversations/AIConversationsHistoryPage'));
const CollectionsPage = lazy(() => import('../features/collections/CollectionsPage'));
const VideoComparisonPage = lazy(() => import('../features/video-comparison/VideoComparisonPage'));
const AdminPanelPage = lazy(() => import('../features/admin/AdminPanelPage'));
const DataExportPage = lazy(() => import('../features/export/DataExportPage'));
const SeasonManagementPage = lazy(() => import('../features/season/SeasonManagementPage'));
const ArchiveBrowserPage = lazy(() => import('../features/archive/ArchiveBrowserPage'));
const PaymentManagementPage = lazy(() => import('../features/payments/PaymentManagementPage'));
// const TrackManSyncPage = lazy(() => import('../features/trackman-sync/TrackManSyncPage')); // TODO: Create this feature
const FocusEnginePage = lazy(() => import('../features/focus-engine/FocusEnginePage'));
// const PerformanceComparisonsPage = lazy(() => import('../features/comparisons/PerformanceComparisonsPage')); // TODO: Create this feature
// const ChatSystemPage = lazy(() => import('../features/chat-system/ChatSystemPage')); // TODO: Create this feature
const FeatureFlagsPage = lazy(() => import('../features/admin-feature-flags').then(m => ({ default: m.AdminFeatureFlagsEditor })));
const AuditLogPage = lazy(() => import('../features/admin-logs/AuditLogPage'));

// ============================================================
// Placeholder Component
// ============================================================

interface PlaceholderPageProps {
  title: string;
}

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div style={{ padding: 32 }}>
      <PageTitle style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{title}</PageTitle>
      <p style={{ color: '#6B7280' }}>This page is under development.</p>
    </div>
  );
}

// ============================================================
// Suspense Wrapper
// ============================================================

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// ============================================================
// Route Constants
// ============================================================

export const ROUTES_V3 = {
  // Dashboard
  DASHBOARD: '/dashboard',

  // Trening
  TRENING: {
    HUB: '/trening',
    LOGG: '/trening/logg',
    DAGBOK: '/trening/dagbok',
    OKTER: '/trening/okter',
    PLAN: '/trening/plan',
    OVELSER: '/trening/ovelser',
    VIDEOER: '/trening/videoer',
    TESTING: '/trening/testing',
    TESTING_REGISTRER: '/trening/testing/registrer',
    TEKNIKKPLAN: '/trening/teknikkplan',
    FOKUS: '/trening/fokus',
  },

  // Utvikling
  UTVIKLING: {
    HUB: '/utvikling',
    OVERSIKT: '/utvikling/oversikt',
    STATISTIKK: '/utvikling/statistikk',
    HISTORIKK: '/utvikling/historikk',
    TESTRESULTATER: '/utvikling/testresultater',
    KRAV: '/utvikling/krav',
    BADGES: '/utvikling/badges',
    ACHIEVEMENTS: '/utvikling/achievements',
    STROKES_GAINED: '/utvikling/strokes-gained',
    DATAGOLF: '/utvikling/sammenlign-proff',
    BREAKING_POINTS: '/utvikling/vendepunkter',
  },

  // Plan
  PLAN: {
    HUB: '/plan',
    KALENDER: '/plan/kalender',
    UKEPLAN: '/plan/ukeplan',
    BOOKING: '/plan/booking',
    SKOLE: '/plan/skole',
    MAAL: '/plan/maal',
    AARSPLAN: '/plan/aarsplan',
    TURNERINGER: '/plan/turneringer',
    TURNERINGER_MINE: '/plan/turneringer/mine',
  },

  // Mer
  MER: {
    HUB: '/mer',
    PROFIL: '/mer/profil',
    PROFIL_REDIGER: '/mer/profil/rediger',
    TRENERTEAM: '/mer/trenerteam',
    MELDINGER: '/mer/meldinger',
    FEEDBACK: '/mer/feedback',
    KUNNSKAP: '/mer/kunnskap',
    NOTATER: '/mer/notater',
    INNSTILLINGER: '/mer/innstillinger',
    VARSLER: '/mer/varsler',
    KALIBRERING: '/mer/kalibrering',
  },
} as const;

// ============================================================
// Route Definitions
// ============================================================

export function getPlayerRoutesV3() {
  return (
    <>
      {/* Dashboard */}
      <Route path="/dashboard" element={<SuspenseWrapper><DashboardHub /></SuspenseWrapper>} />

      {/* Trening */}
      <Route path="/trening" element={<SuspenseWrapper><TreningHub /></SuspenseWrapper>} />
      <Route path="/trening/logg" element={<SuspenseWrapper><TreningLogg /></SuspenseWrapper>} />
      <Route path="/trening/dagbok" element={<SuspenseWrapper><TreningDagbok /></SuspenseWrapper>} />
      <Route path="/trening/okter" element={<SuspenseWrapper><TreningOkter /></SuspenseWrapper>} />
      <Route path="/trening/plan" element={<SuspenseWrapper><TreningPlan /></SuspenseWrapper>} />
      <Route path="/trening/ovelser" element={<SuspenseWrapper><TreningOvelser /></SuspenseWrapper>} />
      <Route path="/trening/videoer" element={<SuspenseWrapper><TreningVideoer /></SuspenseWrapper>} />
      <Route path="/trening/videoer/:videoId/annotate" element={<SuspenseWrapper><VideoAnnotation /></SuspenseWrapper>} />
      <Route path="/trening/video-sammenligning" element={<SuspenseWrapper><VideoComparisonPage /></SuspenseWrapper>} />
      <Route path="/trening/testing" element={<SuspenseWrapper><TreningTesting /></SuspenseWrapper>} />
      <Route path="/trening/testing/registrer" element={<SuspenseWrapper><TreningTestRegistrer /></SuspenseWrapper>} />
      <Route path="/trening/teknikkplan" element={<SuspenseWrapper><TreningTeknikkplan /></SuspenseWrapper>} />
      <Route path="/trening/fokus" element={<SuspenseWrapper><TreningFokus /></SuspenseWrapper>} />
      <Route path="/trening/fokus-motor" element={<SuspenseWrapper><FocusEnginePage /></SuspenseWrapper>} />
      <Route path="/trening/video-annotering" element={<SuspenseWrapper><VideoAnnotation /></SuspenseWrapper>} />
      <Route path="/trening/statistikk" element={<SuspenseWrapper><TreningStatistikk /></SuspenseWrapper>} />
      {/* <Route path="/trening/trackman-sync" element={<SuspenseWrapper><TrackManSyncPage /></SuspenseWrapper>} /> */}

      {/* Utvikling */}
      <Route path="/utvikling" element={<SuspenseWrapper><UtviklingHub /></SuspenseWrapper>} />
      <Route path="/utvikling/oversikt" element={<SuspenseWrapper><UtviklingOversikt /></SuspenseWrapper>} />
      <Route path="/utvikling/statistikk" element={<SuspenseWrapper><UtviklingStatistikk /></SuspenseWrapper>} />
      <Route path="/utvikling/historikk" element={<SuspenseWrapper><UtviklingHistorikk /></SuspenseWrapper>} />
      <Route path="/utvikling/testresultater" element={<SuspenseWrapper><UtviklingTestresultater /></SuspenseWrapper>} />
      <Route path="/utvikling/krav" element={<SuspenseWrapper><UtviklingKrav /></SuspenseWrapper>} />
      <Route path="/utvikling/badges" element={<SuspenseWrapper><UtviklingBadges /></SuspenseWrapper>} />
      <Route path="/utvikling/achievements" element={<SuspenseWrapper><UtviklingAchievements /></SuspenseWrapper>} />
      <Route path="/utvikling/strokes-gained" element={<SuspenseWrapper><UtviklingStrokesGained /></SuspenseWrapper>} />
      <Route path="/utvikling/sammenlign-proff" element={<SuspenseWrapper><UtviklingDataGolf /></SuspenseWrapper>} />
      <Route path="/utvikling/vendepunkter" element={<SuspenseWrapper><UtviklingBreakingPoints /></SuspenseWrapper>} />
      <Route path="/utvikling/innsikter" element={<SuspenseWrapper><PlayerInsightsPage /></SuspenseWrapper>} />
      <Route path="/utvikling/treningsomrader" element={<SuspenseWrapper><UtviklingTreningsomrader /></SuspenseWrapper>} />
      <Route path="/utvikling/peer-sammenligning" element={<SuspenseWrapper><UtviklingPeerComparison /></SuspenseWrapper>} />
      {/* <Route path="/utvikling/sammenligninger" element={<SuspenseWrapper><PerformanceComparisonsPage /></SuspenseWrapper>} /> */}
      <Route path="/utvikling/rapporter" element={<SuspenseWrapper><ProgressReportsPage /></SuspenseWrapper>} />

      {/* Plan */}
      <Route path="/plan" element={<SuspenseWrapper><PlanHub /></SuspenseWrapper>} />
      <Route path="/plan/kalender" element={<SuspenseWrapper><NotionKalender /></SuspenseWrapper>} />
      <Route path="/plan/kalender-v3" element={<SuspenseWrapper><PlayerCalendarPage /></SuspenseWrapper>} />
      <Route path="/plan/kalender-old" element={<SuspenseWrapper><PlanKalender /></SuspenseWrapper>} />
      <Route path="/plan/ukeplan" element={<SuspenseWrapper><PlanUkeplan /></SuspenseWrapper>} />
      <Route path="/plan/booking" element={<SuspenseWrapper><PlanBooking /></SuspenseWrapper>} />
      <Route path="/plan/skole" element={<SuspenseWrapper><PlanSkole /></SuspenseWrapper>} />
      <Route path="/plan/intake" element={<SuspenseWrapper><IntakeFormPage /></SuspenseWrapper>} />
      <Route path="/plan/maal" element={<SuspenseWrapper><PlanMaal /></SuspenseWrapper>} />
      <Route path="/plan/aarsplan" element={<SuspenseWrapper><PlanAarsplan /></SuspenseWrapper>} />
      <Route path="/plan/aarsplan/ny" element={<SuspenseWrapper><PlanAarsplanWizard /></SuspenseWrapper>} />
      <Route path="/plan/sesonger" element={<SuspenseWrapper><SeasonManagementPage /></SuspenseWrapper>} />
      <Route path="/plan/turneringer" element={<SuspenseWrapper><PlanTurneringer /></SuspenseWrapper>} />
      <Route path="/plan/turneringer/mine" element={<SuspenseWrapper><PlanMineTurneringer /></SuspenseWrapper>} />
      <Route path="/plan/turneringsforberedelse" element={<SuspenseWrapper><TournamentPrepPage /></SuspenseWrapper>} />
      <Route path="/plan/turneringer/prep/:prepId" element={<SuspenseWrapper><TournamentPrepPage /></SuspenseWrapper>} />

      {/* Mer */}
      <Route path="/mer" element={<SuspenseWrapper><MerHub /></SuspenseWrapper>} />
      <Route path="/mer/profil" element={<SuspenseWrapper><MerProfil /></SuspenseWrapper>} />
      <Route path="/mer/profil/rediger" element={<SuspenseWrapper><MerProfilRediger /></SuspenseWrapper>} />
      <Route path="/mer/trenerteam" element={<SuspenseWrapper><MerTrenerteam /></SuspenseWrapper>} />
      <Route path="/mer/meldinger" element={<SuspenseWrapper><MerMeldinger /></SuspenseWrapper>} />
      {/* <Route path="/mer/chat" element={<SuspenseWrapper><ChatSystemPage /></SuspenseWrapper>} /> */}
      <Route path="/mer/feedback" element={<SuspenseWrapper><MerFeedback /></SuspenseWrapper>} />
      <Route path="/mer/kunnskap" element={<SuspenseWrapper><MerKunnskap /></SuspenseWrapper>} />
      <Route path="/mer/notater" element={<SuspenseWrapper><MerNotater /></SuspenseWrapper>} />
      <Route path="/mer/innstillinger" element={<SuspenseWrapper><MerInnstillinger /></SuspenseWrapper>} />
      <Route path="/mer/varsler" element={<SuspenseWrapper><MerVarsler /></SuspenseWrapper>} />
      <Route path="/mer/kalibrering" element={<SuspenseWrapper><CalibrationPage /></SuspenseWrapper>} />
      <Route path="/mer/support" element={<SuspenseWrapper><MerSupport /></SuspenseWrapper>} />
      <Route path="/mer/baner-vaer" element={<SuspenseWrapper><WeatherCoursesPage /></SuspenseWrapper>} />
      <Route path="/mer/ai-historikk" element={<SuspenseWrapper><AIConversationsHistoryPage /></SuspenseWrapper>} />
      <Route path="/mer/samlinger" element={<SuspenseWrapper><CollectionsPage /></SuspenseWrapper>} />
      <Route path="/mer/admin" element={<SuspenseWrapper><AdminPanelPage /></SuspenseWrapper>} />
      <Route path="/mer/admin/feature-flags" element={<SuspenseWrapper><FeatureFlagsPage /></SuspenseWrapper>} />
      <Route path="/mer/admin/audit" element={<SuspenseWrapper><AuditLogPage /></SuspenseWrapper>} />
      <Route path="/mer/eksporter" element={<SuspenseWrapper><DataExportPage /></SuspenseWrapper>} />
      <Route path="/mer/arkiv" element={<SuspenseWrapper><ArchiveBrowserPage /></SuspenseWrapper>} />
      <Route path="/mer/betaling" element={<SuspenseWrapper><PaymentManagementPage /></SuspenseWrapper>} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<SuspenseWrapper><OnboardingPage /></SuspenseWrapper>} />
      <Route path="/onboarding/intake" element={<SuspenseWrapper><IntakeFormPage /></SuspenseWrapper>} />

      {/* Redirects from old routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/hjem" element={<Navigate to="/dashboard" replace />} />
    </>
  );
}

// ============================================================
// Redirect Routes (from V2 to V3)
// ============================================================

export const V3_REDIRECTS: Record<string, string> = {
  // V2 -> V3
  '/': '/dashboard',
  '/hjem': '/dashboard',
  '/tren': '/trening',
  '/tren/logg': '/trening/logg',
  '/tren/okter': '/trening/okter',
  '/tren/ovelser': '/trening/ovelser',
  '/tren/testing': '/trening/testing',
  '/tren/testing/registrer': '/trening/testing/registrer',
  '/tren/testing/resultater': '/utvikling/testresultater',
  '/tren/testing/krav': '/utvikling/krav',
  '/planlegg': '/plan',
  '/planlegg/ukeplan': '/plan/ukeplan',
  '/planlegg/kalender': '/plan/kalender',
  '/planlegg/turneringer/kalender': '/plan/turneringer',
  '/planlegg/turneringer/mine': '/plan/turneringer/mine',
  '/analyser': '/utvikling',
  '/analyser/utvikling': '/utvikling/oversikt',
  '/analyser/statistikk': '/utvikling/statistikk',
  '/analyser/mal': '/plan/maal',
  '/analyser/historikk': '/utvikling/historikk',
  '/samhandle': '/mer',
  '/samhandle/meldinger': '/mer/meldinger',
  '/samhandle/feedback': '/mer/feedback',
  '/samhandle/kunnskap': '/mer/kunnskap',
  '/profil': '/mer/profil',
  '/profil/oppdater': '/mer/profil/rediger',
  '/innstillinger': '/mer/innstillinger',
  '/innstillinger/varsler': '/mer/varsler',
  '/trenerteam': '/mer/trenerteam',
  '/kalibrering': '/mer/kalibrering',
};

export default getPlayerRoutesV3;
