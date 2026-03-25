/**
 * Centralized lazy imports for route components
 * This file organizes all lazy-loaded components by feature area
 */
import { lazy } from 'react';

// =============================================================================
// Auth & Landing
// =============================================================================
export const Login = lazy(() => import('../features/auth/Login'));
export const SplitScreenLanding = lazy(() => import('../features/landing/SplitScreenLanding'));
export const NotFoundPage = lazy(() => import('../features/not-found/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// =============================================================================
// Dashboard & Profile
// =============================================================================
export const DashboardContainer = lazy(() => import('../features/dashboard/DashboardContainer'));
export const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
export const BrukerprofilContainer = lazy(() => import('../features/profile/BrukerprofilContainer'));

// =============================================================================
// Player Core Features
// =============================================================================
export const TrenerteamContainer = lazy(() => import('../features/coaches/TrenerteamContainer'));
export const MaalsetningerContainer = lazy(() => import('../features/goals/MaalsetningerContainer'));
export const GoalsPage = lazy(() => import('../features/goals/GoalsPage'));
export const AarsplanContainer = lazy(() => import('../features/annual-plan/AarsplanContainer'));
export const PlanPreviewContainer = lazy(() => import('../features/annual-plan/PlanPreviewContainer'));

// =============================================================================
// Tests & Evaluation
// =============================================================================
export const TestprotokollContainer = lazy(() => import('../features/tests/TestprotokollContainer'));
export const TestresultaterContainer = lazy(() => import('../features/tests/TestresultaterContainer'));
export const KategoriKravContainer = lazy(() => import('../features/tests/KategoriKravContainer'));
export const RegistrerTestContainer = lazy(() => import('../features/tests/RegistrerTestContainer'));
export const EvalueringContainer = lazy(() => import('../features/evaluering/EvalueringContainer'));
export const TreningsevalueringContainer = lazy(() => import('../features/evaluering/TreningsevalueringContainer'));
export const TurneringsevalueringContainer = lazy(() => import('../features/evaluering/TurneringsevalueringContainer'));

// =============================================================================
// Training
// =============================================================================
export const TreningsprotokollContainer = lazy(() => import('../features/training/TreningsprotokollContainer'));
export const TreningsstatistikkContainer = lazy(() => import('../features/training/TreningsstatistikkContainer'));
export const OevelserContainer = lazy(() => import('../features/exercises/OevelserContainer'));
export const DagensTreningsplanContainer = lazy(() => import('../features/trening-plan/DagensTreningsplanContainer'));
export const UkensTreningsplanContainer = lazy(() => import('../features/trening-plan/UkensTreningsplanContainer'));
export const TekniskPlanContainer = lazy(() => import('../features/trening-plan/TekniskPlanContainer'));
export const TreningsdagbokContainer = lazy(() => import('../features/trening-plan/treningsdagbok').then(m => ({ default: m.TreningsdagbokPage })));
export const LoggTreningContainer = lazy(() => import('../features/trening-plan/LoggTreningContainer'));

// =============================================================================
// Stats & Analytics
// =============================================================================
export const StatsOppdateringContainer = lazy(() => import('../features/stats-pages/StatsOppdateringContainer'));
export const TurneringsstatistikkContainer = lazy(() => import('../features/stats-pages/TurneringsstatistikkContainer'));
export const StatsVerktoyContainer = lazy(() => import('../features/stats-pages/StatsVerktoyContainer'));
export const StatsPageV2 = lazy(() => import('../features/stats/StatsPageV2'));

// =============================================================================
// Player Stats (DataGolf & Test Results)
// =============================================================================
export const PlayerStatsPage = lazy(() => import('../features/player-stats').then(m => ({ default: m.PlayerStatsPage })));
export const StrokesGainedPage = lazy(() => import('../features/player-stats').then(m => ({ default: m.StrokesGainedPage })));
export const PlayerTestResultsPage = lazy(() => import('../features/player-stats').then(m => ({ default: m.TestResultsPage })));
export const StatusProgressPage = lazy(() => import('../features/player-stats').then(m => ({ default: m.StatusProgressPage })));

// =============================================================================
// Development & Progress
// =============================================================================
export const ProgressDashboardContainer = lazy(() => import('../features/progress/ProgressDashboardContainer'));
export const UtviklingsOversiktContainer = lazy(() => import('../features/utvikling/UtviklingsOversiktContainer'));
export const BreakingPointsContainer = lazy(() => import('../features/utvikling/BreakingPointsContainer'));
export const KategoriFremgangContainer = lazy(() => import('../features/utvikling/KategoriFremgangContainer'));
export const BenchmarkHistorikkContainer = lazy(() => import('../features/utvikling/BenchmarkHistorikkContainer'));

// =============================================================================
// Achievements & Badges
// =============================================================================
export const AchievementsDashboardContainer = lazy(() => import('../features/achievements/AchievementsDashboardContainer'));
export const BadgesContainer = lazy(() => import('../features/badges/Badges'));

// =============================================================================
// Tournaments
// =============================================================================
export const TurneringskalenderContainer = lazy(() => import('../features/tournaments/TurneringskalenderContainer'));
export const MineTurneringerContainer = lazy(() => import('../features/tournaments/MineTurneringerContainer'));
export const TurneringsResultaterContainer = lazy(() => import('../features/tournaments/TurneringsResultaterContainer'));
export const RegistrerTurneringsResultatContainer = lazy(() => import('../features/tournaments/RegistrerTurneringsResultatContainer'));
export const TournamentCalendarPage = lazy(() => import('../features/tournament-calendar').then(m => ({ default: m.TournamentCalendarPage })));
export const TournamentPlannerPage = lazy(() => import('../features/tournament-calendar').then(m => ({ default: m.TournamentPlannerPage })));

// =============================================================================
// Calendar
// =============================================================================
export const CalendarPage = lazy(() => import('../features/calendar/CalendarPage'));
export const DayViewPage = lazy(() => import('../features/calendar/DayViewPage'));
export const CalendarOversiktPage = lazy(() => import('../features/calendar-oversikt').then(m => ({ default: m.CalendarOversiktPage })));
export const BookTrenerContainer = lazy(() => import('../features/calendar/BookTrenerContainer'));

// =============================================================================
// Sessions
// =============================================================================
export const SessionDetailViewContainer = lazy(() => import('../features/sessions/SessionDetailViewContainer'));
export const ActiveSessionViewContainer = lazy(() => import('../features/sessions/ActiveSessionViewContainer'));
export const SessionReflectionFormContainer = lazy(() => import('../features/sessions/SessionReflectionFormContainer'));
export const SessionEvaluationFormContainer = lazy(() => import('../features/sessions/SessionEvaluationFormContainer'));
export const SessionCreateFormContainer = lazy(() => import('../features/sessions/SessionCreateFormContainer'));
export const EvaluationStatsDashboardContainer = lazy(() => import('../features/sessions/EvaluationStatsDashboardContainer'));
export const SessionsListContainer = lazy(() => import('../features/sessions/SessionsListContainer'));
export const ExerciseLibraryContainer = lazy(() => import('../features/sessions/ExerciseLibraryContainer'));

// =============================================================================
// Communication & Messaging
// =============================================================================
export const MessageCenter = lazy(() => import('../features/messaging/MessageCenter'));
export const ConversationView = lazy(() => import('../features/messaging/ConversationView'));
export const NewConversation = lazy(() => import('../features/messaging/NewConversation'));
export const NotificationCenter = lazy(() => import('../features/notifications/NotificationCenter'));

// =============================================================================
// Knowledge & Resources
// =============================================================================
export const RessurserContainer = lazy(() => import('../features/knowledge/RessurserContainer'));
export const BevisContainer = lazy(() => import('../features/bevis/BevisContainer'));
export const NotaterContainer = lazy(() => import('../features/notes/NotaterContainer'));
export const ArkivContainer = lazy(() => import('../features/archive/ArkivContainer'));

// =============================================================================
// School
// =============================================================================
export const SkoleplanContainer = lazy(() => import('../features/school/SkoleplanContainer'));
export const SkoleoppgaverContainer = lazy(() => import('../features/school/SkoleoppgaverContainer'));

// =============================================================================
// Settings
// =============================================================================
export const KalibreringsContainer = lazy(() => import('../features/innstillinger/KalibreringsContainer'));
export const VarselinnstillingerContainer = lazy(() => import('../features/innstillinger/VarselinnstillingerContainer'));

// =============================================================================
// Video Features
// =============================================================================
export const VideoAnalysisPage = lazy(() => import('../features/video-analysis/VideoAnalysisPage').then(m => ({ default: m.VideoAnalysisPage })));
export const VideoLibraryPage = lazy(() => import('../features/video-library/VideoLibraryPage').then(m => ({ default: m.VideoLibraryPage })));
export const VideoComparisonPage = lazy(() => import('../features/video-comparison/VideoComparisonPage'));
export const VideoProgressView = lazy(() => import('../features/video-progress').then(m => ({ default: m.VideoProgressView })));

// =============================================================================
// Other Features
// =============================================================================
export const SamlingerContainer = lazy(() => import('../features/samlinger/SamlingerContainer'));
export const PeriodeplanerContainer = lazy(() => import('../features/periodeplaner/PeriodeplanerContainer'));
export const PlaceholderPage = lazy(() => import('../features/planning/PlaceholderPage'));
export const ModificationRequestDashboardContainer = lazy(() => import('../features/coach/ModificationRequestDashboardContainer'));

// =============================================================================
// Mobile
// =============================================================================
export const MobileShell = lazy(() => import('../components/layout/MobileShell'));
export const MobileHome = lazy(() => import('../mobile/MobileHome'));
export const MobilePlan = lazy(() => import('../mobile/MobilePlan'));
export const MobileQuickLog = lazy(() => import('../mobile/MobileQuickLog'));
export const MobileCalendar = lazy(() => import('../mobile/MobileCalendar'));
export const MobileCalibration = lazy(() => import('../mobile/MobileCalibration'));

// =============================================================================
// Coach Features
// =============================================================================
export const CoachDashboard = lazy(() => import('../features/coach-dashboard').then(m => ({ default: m.CoachDashboard })));
export const CoachAthleteList = lazy(() => import('../features/coach-athlete-list').then(m => ({ default: m.CoachAthleteList })));
export const CoachAthleteDetail = lazy(() => import('../features/coach-athlete-detail').then(m => ({ default: m.CoachAthleteDetail })));
export const CoachTrainingPlan = lazy(() => import('../features/coach-training-plan').then(m => ({ default: m.CoachTrainingPlan })));
export const CoachTrainingPlanTemplates = lazy(() => import('../features/coach-training-plan').then(m => ({ default: m.CoachTrainingPlanTemplates })));
export const CoachTrainingPlanEditor = lazy(() => import('../features/coach-training-plan-editor').then(m => ({ default: m.CoachTrainingPlanEditor })));
export const CoachNotes = lazy(() => import('../features/coach-notes').then(m => ({ default: m.CoachNotes })));
export const CoachAlertsPage = lazy(() => import('../features/coach-intelligence').then(m => ({ default: m.CoachAlertsPage })));
export const CoachProofViewer = lazy(() => import('../features/coach-proof-viewer').then(m => ({ default: m.CoachProofViewer })));
export const CoachTrajectoryViewer = lazy(() => import('../features/coach-trajectory-viewer').then(m => ({ default: m.CoachTrajectoryViewer })));
export const CoachVideosDashboard = lazy(() => import('../features/coach-videos/CoachVideosDashboard').then(m => ({ default: m.CoachVideosDashboard })));
export const ReferenceLibrary = lazy(() => import('../features/coach-videos/ReferenceLibrary').then(m => ({ default: m.ReferenceLibrary })));
export const CoachPlayerPage = lazy(() => import('../features/coach-player/CoachPlayerPage').then(m => ({ default: m.CoachPlayerPage })));
export const CoachGroupList = lazy(() => import('../features/coach-groups').then(m => ({ default: m.CoachGroupList })));
export const CoachGroupDetail = lazy(() => import('../features/coach-groups').then(m => ({ default: m.CoachGroupDetail })));
export const CoachGroupCreate = lazy(() => import('../features/coach-groups').then(m => ({ default: m.CoachGroupCreate })));
export const CoachGroupPlan = lazy(() => import('../features/coach-groups').then(m => ({ default: m.CoachGroupPlan })));
export const CoachBookingCalendar = lazy(() => import('../features/coach-booking').then(m => ({ default: m.CoachBookingCalendar })));
export const CoachBookingRequests = lazy(() => import('../features/coach-booking').then(m => ({ default: m.CoachBookingRequests })));
export const CoachBookingSettings = lazy(() => import('../features/coach-booking').then(m => ({ default: m.CoachBookingSettings })));
export const CoachTournamentCalendar = lazy(() => import('../features/coach-tournaments').then(m => ({ default: m.CoachTournamentCalendar })));
export const CoachTournamentPlayers = lazy(() => import('../features/coach-tournaments').then(m => ({ default: m.CoachTournamentPlayers })));
export const CoachTournamentResults = lazy(() => import('../features/coach-tournaments').then(m => ({ default: m.CoachTournamentResults })));
export const CoachStatsOverview = lazy(() => import('../features/coach-stats').then(m => ({ default: m.CoachStatsOverview })));
export const CoachStatsProgress = lazy(() => import('../features/coach-stats').then(m => ({ default: m.CoachStatsProgress })));
export const CoachStatsRegression = lazy(() => import('../features/coach-stats').then(m => ({ default: m.CoachStatsRegression })));
export const CoachDataGolf = lazy(() => import('../features/coach-stats').then(m => ({ default: m.CoachDataGolf })));
export const CoachMessageList = lazy(() => import('../features/coach-messages').then(m => ({ default: m.CoachMessageList })));
export const CoachMessageCompose = lazy(() => import('../features/coach-messages').then(m => ({ default: m.CoachMessageCompose })));
export const CoachScheduledMessages = lazy(() => import('../features/coach-messages').then(m => ({ default: m.CoachScheduledMessages })));
export const CoachExerciseLibrary = lazy(() => import('../features/coach-exercises').then(m => ({ default: m.CoachExerciseLibrary })));
export const CoachMyExercises = lazy(() => import('../features/coach-exercises').then(m => ({ default: m.CoachMyExercises })));
export const CoachExerciseTemplates = lazy(() => import('../features/coach-exercises').then(m => ({ default: m.CoachExerciseTemplates })));
export const CoachSessionTemplateEditor = lazy(() => import('../features/coach-exercises').then(m => ({ default: m.CoachSessionTemplateEditor })));
export const CoachSettings = lazy(() => import('../features/coach-settings').then(m => ({ default: m.CoachSettings })));
export const CoachAthleteStatus = lazy(() => import('../features/coach-athlete-status').then(m => ({ default: m.CoachAthleteStatus })));
export const CoachAthleteTournaments = lazy(() => import('../features/coach-athlete-tournaments').then(m => ({ default: m.CoachAthleteTournaments })));
export const CoachPlanningHub = lazy(() => import('../features/coach-planning').then(m => ({ default: m.CoachPlanningHub })));
export const CoachSessionEvaluations = lazy(() => import('../features/coach-session-evaluations').then(m => ({ default: m.CoachSessionEvaluations })));

// =============================================================================
// Samling (Training Camps)
// =============================================================================
export const SamlingList = lazy(() => import('../features/samling').then(m => ({ default: m.SamlingList })));
export const SamlingDetail = lazy(() => import('../features/samling').then(m => ({ default: m.SamlingDetail })));
export const SamlingCreate = lazy(() => import('../features/samling').then(m => ({ default: m.SamlingCreate })));

// =============================================================================
// Admin Features
// =============================================================================
export const AdminSystemOverview = lazy(() => import('../features/admin-system-overview').then(m => ({ default: m.AdminSystemOverview })));
export const AdminCoachManagement = lazy(() => import('../features/admin-coach-management').then(m => ({ default: m.AdminCoachManagement })));
export const AdminTierManagement = lazy(() => import('../features/admin-tier-management').then(m => ({ default: m.AdminTierManagement })));
export const AdminFeatureFlagsEditor = lazy(() => import('../features/admin-feature-flags').then(m => ({ default: m.AdminFeatureFlagsEditor })));
export const AdminEscalationSupport = lazy(() => import('../features/admin-escalation').then(m => ({ default: m.AdminEscalationSupport })));

// =============================================================================
// Dev/Lab (Development only)
// =============================================================================
export const UILabContainer = lazy(() => import('../features/ui-lab/UILabContainer'));
export const StatsLab = lazy(() => import('../ui/lab/StatsLab'));
export const AppShellLab = lazy(() => import('../ui/lab/AppShellLab'));
export const CalendarLab = lazy(() => import('../ui/lab/CalendarLab'));
export const UiCanonPage = lazy(() => import('../ui/lab/UiCanonPage'));
