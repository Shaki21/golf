/**
 * ============================================================
 * PLAYER ROUTES V4 - TIER Golf
 * ============================================================
 *
 * V4 Changes from V3:
 * - "My Development" → "Analysis" (17 URLs → 6 hub URLs)
 * - Hub-based architecture with tabs
 * - All old /utvikling/* URLs redirect to /analyse/*
 * - ~60% reduction in navigation URLs
 *
 * Route structure:
 * 1. /dashboard - Dashboard (home)
 * 2. /trening/* - Training (green) [UNCHANGED FROM V3]
 * 3. /analyse/* - Analysis (blue) [NEW - replaces /utvikling/*]
 * 4. /plan/* - Plan (amber) [UNCHANGED FROM V3]
 * 5. /mer/* - More (purple) [UNCHANGED FROM V3]
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

// TodayView replaces DashboardHub (action-centric dashboard)
const TodayView = lazy(() => import('../features/hub-pages/TodayView'));
const DashboardHub = lazy(() => import('../features/hub-pages/DashboardHub')); // Legacy, kept for reference
const TreningHub = lazy(() => import('../features/hub-pages/TreningHub'));
const PlanHub = lazy(() => import('../features/hub-pages/PlanHub'));
const MerHub = lazy(() => import('../features/hub-pages/MerHub'));
const VideoHub = lazy(() => import('../features/hub-pages/VideoHub'));

// ===================================================================
// NEW V4: ANALYSE HUB PAGES (replaces UtviklingHub)
// ===================================================================
const AnalyseHub = lazy(() => import('../features/analyse/AnalyseHub'));
const AnalyseStatistikkHub = lazy(() => import('../features/analyse/AnalyseStatistikkHub'));
const AnalyseSammenligningerHub = lazy(() => import('../features/analyse/AnalyseSammenligningerHub'));
const AnalyseRapporterHub = lazy(() => import('../features/analyse/AnalyseRapporterHub'));
const AnalyseTesterHub = lazy(() => import('../features/analyse/AnalyseTesterHub'));
const AnalysePrestasjoner = lazy(() => import('../features/analyse/AnalysePrestasjoner'));

// ===================================================================
// MANUAL STATS & STROKES GAINED
// ===================================================================
const ManualStatsPage = lazy(() => import('../features/manual-stats/ManualStatsPageV5'));
const StrokesGainedPage = lazy(() => import('../features/strokes-gained/StrokesGainedPageV5'));
const RoundEntryForm = lazy(() => import('../features/manual-stats/RoundEntryForm'));
const RoundReviewComponent = lazy(() => import('../features/manual-stats/RoundReviewComponent'));
const RoundDetailPage = lazy(() => import('../features/manual-stats/RoundDetailPage'));
const CategoryDeepDivePage = lazy(() => import('../features/strokes-gained/CategoryDeepDivePage'));

// ============================================================
// Existing Page Components (lazy loaded) - UNCHANGED FROM V3
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
const IntakeFormPage = lazy(() => import('../features/intake/IntakeFormPage'));
const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage'));
const SeasonManagementPage = lazy(() => import('../features/season/SeasonManagementPage'));

// More area
const MerProfil = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="My profile" /> }));
const MerProfilRediger = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Edit profile" /> }));
const MerTrenerteam = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Coach team" /> }));
const MerMeldinger = lazy(() => import('../features/chat/ChatPage'));
const MerFeedback = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Coach feedback" /> }));
const MerKunnskap = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Knowledge base" /> }));
const MerNotater = lazy(() => Promise.resolve({
  default: () => (
    <div style={{ padding: 32, minHeight: '100vh', backgroundColor: '#f5f5f0' }}>
      <PageTitle style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a365d' }}>Notes</PageTitle>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>Training diary and reflections</p>
      <div style={{ padding: 24, backgroundColor: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <p style={{ color: '#6B7280', textAlign: 'center' }}>No notes yet. Start by creating your first note.</p>
      </div>
    </div>
  )
}));
const MerInnstillinger = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Settings" /> }));
const MerSupport = lazy(() => import('../features/support/SupportPage'));
const MerVarsler = lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Notification settings" /> }));
const CalibrationPage = lazy(() => import('../features/calibration/CalibrationPage'));
const WeatherCoursesPage = lazy(() => import('../features/weather-courses/WeatherCoursesPage'));
const AIConversationsHistoryPage = lazy(() => import('../features/ai-conversations/AIConversationsHistoryPage'));
const CollectionsPage = lazy(() => import('../features/collections/CollectionsPage'));
const VideoComparisonPage = lazy(() => import('../features/video-comparison/VideoComparisonPage'));
const AdminPanelPage = lazy(() => import('../features/admin/AdminPanelPage'));
const DataExportPage = lazy(() => import('../features/export/DataExportPage'));
const ArchiveBrowserPage = lazy(() => import('../features/archive/ArchiveBrowserPage'));
const PaymentManagementPage = lazy(() => import('../features/payments/PaymentManagementPage'));
const FocusEnginePage = lazy(() => import('../features/focus-engine/FocusEnginePage'));
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
// Route Definitions
// ============================================================

export function getPlayerRoutesV4() {
  return (
    <>
      {/* ===================================================================
       * DASHBOARD - TodayView (Action-Centric)
       * =================================================================== */}
      <Route path="/dashboard" element={<SuspenseWrapper><TodayView /></SuspenseWrapper>} />
      {/* Legacy dashboard route - redirect to new TodayView */}
      <Route path="/dashboard/legacy" element={<SuspenseWrapper><DashboardHub /></SuspenseWrapper>} />

      {/* ===================================================================
       * TRENING - UNCHANGED FROM V3
       * =================================================================== */}
      <Route path="/trening" element={<SuspenseWrapper><TreningHub /></SuspenseWrapper>} />
      <Route path="/trening/logg" element={<SuspenseWrapper><TreningLogg /></SuspenseWrapper>} />
      <Route path="/trening/dagbok" element={<SuspenseWrapper><TreningDagbok /></SuspenseWrapper>} />
      <Route path="/trening/okter" element={<SuspenseWrapper><TreningOkter /></SuspenseWrapper>} />
      <Route path="/trening/plan" element={<SuspenseWrapper><TreningPlan /></SuspenseWrapper>} />
      <Route path="/trening/ovelser" element={<SuspenseWrapper><TreningOvelser /></SuspenseWrapper>} />

      {/* Video Hub - Consolidated video features with tabs */}
      <Route path="/trening/video" element={<SuspenseWrapper><VideoHub /></SuspenseWrapper>} />
      <Route path="/trening/video/bibliotek" element={<SuspenseWrapper><VideoHub /></SuspenseWrapper>} />
      <Route path="/trening/video/sammenligning" element={<SuspenseWrapper><VideoHub /></SuspenseWrapper>} />
      <Route path="/trening/video/annotering" element={<SuspenseWrapper><VideoHub /></SuspenseWrapper>} />

      {/* Legacy video routes - redirect to new hub */}
      <Route path="/trening/videoer" element={<Navigate to="/trening/video?tab=bibliotek" replace />} />
      <Route path="/trening/video-sammenligning" element={<Navigate to="/trening/video?tab=sammenligning" replace />} />
      <Route path="/trening/video-annotering" element={<Navigate to="/trening/video?tab=annotering" replace />} />

      {/* Keep specific video annotation route for deep linking */}
      <Route path="/trening/videoer/:videoId/annotate" element={<SuspenseWrapper><VideoAnnotation /></SuspenseWrapper>} />

      <Route path="/trening/testing" element={<SuspenseWrapper><TreningTesting /></SuspenseWrapper>} />
      <Route path="/trening/testing/registrer" element={<SuspenseWrapper><TreningTestRegistrer /></SuspenseWrapper>} />
      <Route path="/trening/teknikkplan" element={<SuspenseWrapper><TreningTeknikkplan /></SuspenseWrapper>} />
      <Route path="/trening/fokus" element={<SuspenseWrapper><TreningFokus /></SuspenseWrapper>} />
      <Route path="/trening/fokus-motor" element={<SuspenseWrapper><FocusEnginePage /></SuspenseWrapper>} />
      {/* Direct exercise start - deep link from TodayHero */}
      <Route path="/trening/start/:sessionId" element={<SuspenseWrapper><TreningFokus /></SuspenseWrapper>} />

      {/* ===================================================================
       * ANALYSE - NEW V4 HUB STRUCTURE (replaces /utvikling/*)
       * =================================================================== */}
      <Route path="/analyse" element={<SuspenseWrapper><AnalyseHub /></SuspenseWrapper>} />
      <Route path="/analyse/statistikk" element={<SuspenseWrapper><AnalyseStatistikkHub /></SuspenseWrapper>} />
      <Route path="/analyse/sammenligninger" element={<SuspenseWrapper><AnalyseSammenligningerHub /></SuspenseWrapper>} />
      <Route path="/analyse/rapporter" element={<SuspenseWrapper><AnalyseRapporterHub /></SuspenseWrapper>} />
      <Route path="/analyse/tester" element={<SuspenseWrapper><AnalyseTesterHub /></SuspenseWrapper>} />
      <Route path="/analyse/prestasjoner" element={<SuspenseWrapper><AnalysePrestasjoner /></SuspenseWrapper>} />

      {/* Deep pages for Analyse (not in navigation, linked from hubs) */}
      <Route path="/analyse/statistikk/historikk" element={<SuspenseWrapper><PlaceholderPage title="Statistics history" /></SuspenseWrapper>} />

      {/* ===================================================================
       * ROUNDS & STROKES GAINED - Manual Stats Module
       * =================================================================== */}
      <Route path="/rounds" element={<SuspenseWrapper><ManualStatsPage /></SuspenseWrapper>} />
      <Route path="/rounds/new" element={<SuspenseWrapper><RoundEntryForm /></SuspenseWrapper>} />
      <Route path="/rounds/:roundId" element={<SuspenseWrapper><RoundDetailPage /></SuspenseWrapper>} />
      <Route path="/rounds/:roundId/review" element={<SuspenseWrapper><RoundReviewComponent /></SuspenseWrapper>} />
      <Route path="/strokes-gained" element={<SuspenseWrapper><StrokesGainedPage /></SuspenseWrapper>} />
      <Route path="/strokes-gained/:categoryId" element={<SuspenseWrapper><CategoryDeepDivePage /></SuspenseWrapper>} />

      {/* ===================================================================
       * PLAN - UNCHANGED FROM V3
       * =================================================================== */}
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

      {/* ===================================================================
       * MER - UNCHANGED FROM V3
       * =================================================================== */}
      <Route path="/mer" element={<SuspenseWrapper><MerHub /></SuspenseWrapper>} />
      <Route path="/mer/profil" element={<SuspenseWrapper><MerProfil /></SuspenseWrapper>} />
      <Route path="/mer/profil/rediger" element={<SuspenseWrapper><MerProfilRediger /></SuspenseWrapper>} />
      <Route path="/mer/trenerteam" element={<SuspenseWrapper><MerTrenerteam /></SuspenseWrapper>} />
      <Route path="/mer/meldinger" element={<SuspenseWrapper><MerMeldinger /></SuspenseWrapper>} />
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

      {/* ===================================================================
       * V4 REDIRECTS - From old /utvikling/* to new /analyse/*
       * =================================================================== */}

      {/* Hub redirects */}
      <Route path="/utvikling" element={<Navigate to="/analyse" replace />} />
      <Route path="/utvikling/oversikt" element={<Navigate to="/analyse" replace />} />

      {/* Statistikk hub redirects */}
      <Route path="/utvikling/statistikk" element={<Navigate to="/analyse/statistikk" replace />} />
      <Route path="/utvikling/strokes-gained" element={<Navigate to="/analyse/statistikk?tab=strokes-gained" replace />} />
      <Route path="/utvikling/fremgang" element={<Navigate to="/analyse/statistikk?tab=trender" replace />} />
      <Route path="/utvikling/historikk" element={<Navigate to="/analyse/statistikk/historikk" replace />} />

      {/* Absorbed content - redirect to tabs with anchors */}
      <Route path="/utvikling/vendepunkter" element={<Navigate to="/analyse/statistikk?tab=oversikt#vendepunkter" replace />} />
      <Route path="/utvikling/innsikter" element={<Navigate to="/analyse/statistikk?tab=status-maal" replace />} />
      <Route path="/utvikling/treningsomrader" element={<Navigate to="/analyse/statistikk?tab=trender#treningsomrader" replace />} />

      {/* Sammenligninger hub redirects */}
      <Route path="/utvikling/peer-sammenligning" element={<Navigate to="/analyse/sammenligninger?tab=peer" replace />} />
      <Route path="/utvikling/sammenlign-proff" element={<Navigate to="/analyse/sammenligninger?tab=proff" replace />} />
      <Route path="/utvikling/datagolf" element={<Navigate to="/analyse/sammenligninger?tab=proff" replace />} />
      <Route path="/utvikling/sammenligninger" element={<Navigate to="/analyse/sammenligninger?tab=multi" replace />} />

      {/* Rapporter hub redirect */}
      <Route path="/utvikling/rapporter" element={<Navigate to="/analyse/rapporter" replace />} />

      {/* Tester hub redirects */}
      <Route path="/utvikling/testresultater" element={<Navigate to="/analyse/tester?tab=resultater" replace />} />
      <Route path="/utvikling/krav" element={<Navigate to="/analyse/tester?tab=krav" replace />} />

      {/* Prestasjoner hub redirects */}
      <Route path="/utvikling/badges" element={<Navigate to="/analyse/prestasjoner?tab=badges" replace />} />
      <Route path="/utvikling/achievements" element={<Navigate to="/analyse/prestasjoner?tab=achievements" replace />} />

      {/* ===================================================================
       * PLANLEGGER REDIRECTS - From /planlegger/* to /plan/*
       * =================================================================== */}
      <Route path="/planlegger" element={<Navigate to="/plan" replace />} />
      <Route path="/planlegger/turneringer" element={<Navigate to="/plan/turneringer" replace />} />
      <Route path="/planlegger/turneringer/mine" element={<Navigate to="/plan/turneringer/mine" replace />} />
      <Route path="/planlegger/kalender" element={<Navigate to="/plan/kalender" replace />} />
      <Route path="/planlegger/ukeplan" element={<Navigate to="/plan/ukeplan" replace />} />
      <Route path="/planlegger/booking" element={<Navigate to="/plan/booking" replace />} />
      <Route path="/planlegger/maal" element={<Navigate to="/plan/maal" replace />} />

      {/* ===================================================================
       * V3 REDIRECTS - From V2 to V3 (maintained for backward compatibility)
       * =================================================================== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/hjem" element={<Navigate to="/dashboard" replace />} />
      <Route path="/tren" element={<Navigate to="/trening" replace />} />
      <Route path="/tren/logg" element={<Navigate to="/trening/logg" replace />} />
      <Route path="/tren/okter" element={<Navigate to="/trening/okter" replace />} />
      <Route path="/tren/ovelser" element={<Navigate to="/trening/ovelser" replace />} />
      <Route path="/tren/testing" element={<Navigate to="/trening/testing" replace />} />
      <Route path="/tren/testing/registrer" element={<Navigate to="/trening/testing/registrer" replace />} />
      <Route path="/tren/testing/resultater" element={<Navigate to="/analyse/tester?tab=resultater" replace />} />
      <Route path="/tren/testing/krav" element={<Navigate to="/analyse/tester?tab=krav" replace />} />
      <Route path="/planlegg" element={<Navigate to="/plan" replace />} />
      <Route path="/planlegg/ukeplan" element={<Navigate to="/plan/ukeplan" replace />} />
      <Route path="/planlegg/kalender" element={<Navigate to="/plan/kalender" replace />} />
      <Route path="/planlegg/turneringer/kalender" element={<Navigate to="/plan/turneringer" replace />} />
      <Route path="/planlegg/turneringer/mine" element={<Navigate to="/plan/turneringer/mine" replace />} />
      <Route path="/analyser" element={<Navigate to="/analyse" replace />} />
      <Route path="/analyser/utvikling" element={<Navigate to="/analyse" replace />} />
      <Route path="/analyser/statistikk" element={<Navigate to="/analyse/statistikk" replace />} />
      <Route path="/analyser/mal" element={<Navigate to="/plan/maal" replace />} />
      <Route path="/analyser/historikk" element={<Navigate to="/analyse/statistikk/historikk" replace />} />
      <Route path="/samhandle" element={<Navigate to="/mer" replace />} />
      <Route path="/samhandle/meldinger" element={<Navigate to="/mer/meldinger" replace />} />
      <Route path="/samhandle/feedback" element={<Navigate to="/mer/feedback" replace />} />
      <Route path="/samhandle/kunnskap" element={<Navigate to="/mer/kunnskap" replace />} />
      <Route path="/profil" element={<Navigate to="/mer/profil" replace />} />
      <Route path="/profil/oppdater" element={<Navigate to="/mer/profil/rediger" replace />} />
      <Route path="/innstillinger" element={<Navigate to="/mer/innstillinger" replace />} />
      <Route path="/innstillinger/varsler" element={<Navigate to="/mer/varsler" replace />} />
      <Route path="/trenerteam" element={<Navigate to="/mer/trenerteam" replace />} />
      <Route path="/kalibrering" element={<Navigate to="/mer/kalibrering" replace />} />
    </>
  );
}

export default getPlayerRoutesV4;
