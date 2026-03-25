# Screen Inventory - AK Golf Academy Web App

> **Generert:** 2025-12-26
> **Formål:** Komplett oversikt over alle screens/pages i web-appen for visuell oppgradering
> **Status:** Analyse fullført - klar for batch-basert UI-oppgradering

---

## Sammendrag

| Modul | Antall Routes | Layout |
|-------|--------------|--------|
| **Auth** | 1 | None (public) |
| **Player** | 68 | AppShell / AuthenticatedLayout |
| **Coach** | 46 | CoachAppShell / CoachLayout |
| **Admin** | 13 | AdminAppShell / AdminLayout |
| **Mobile** | 5 | MobileShell |
| **Dev** | 4 | AuthenticatedLayout (IS_DEV only) |
| **Totalt** | **137** | |

---

## Layouts & Shells

### AppShell (Player)
- **Fil:** `src/components/layout/AppShell.jsx`
- **Brukes av:** Alle player-routes
- **Wrapper:** `AuthenticatedLayout` - tar `title`, `subtitle`, `actions` props
- **Variant:** `DashboardLayout` - spesialisert for dashboard med dynamisk greeting

### CoachAppShell (Coach)
- **Fil:** `src/components/layout/CoachAppShell.jsx`
- **Brukes av:** Alle `/coach/*` routes
- **Wrapper:** `CoachLayout`

### AdminAppShell (Admin)
- **Fil:** `src/components/layout/AdminAppShell.jsx`
- **Brukes av:** Alle `/admin/*` routes
- **Wrapper:** `AdminLayout`

### MobileShell
- **Fil:** `src/components/layout/MobileShell.jsx`
- **Brukes av:** `/m/*` routes
- **Lazy-loaded:** Ja

### Guards
- **ProtectedRoute:** `src/components/guards/ProtectedRoute.jsx`
- Støtter `requiredRole` prop for rollebasert tilgang

---

## Route-oversikt etter Modul

### AUTH (1 route)

| Path | Component | Layout | Auth | Prioritet |
|------|-----------|--------|------|-----------|
| `/login` | `Login` | None | Public | D |

**Fil:** `src/features/auth/Login.jsx`

---

### PLAYER (68 routes)

#### Dashboard & Profil

| Path | Component | Layout | Data Dependencies | UI States | Prioritet |
|------|-----------|--------|-------------------|-----------|-----------|
| `/` | `DashboardContainer` | DashboardLayout | `apiClient.get('/dashboard')`, `useAuth` | loading/error/idle | **A** |
| `/dashboard` | `DashboardContainer` | DashboardLayout | `apiClient.get('/dashboard')` | loading/error/idle | **A** |
| `/dashboard-v2` | `DashboardPage` | None (self-contained) | TBD | TBD | B |
| `/profil` | `BrukerprofilContainer` | AuthenticatedLayout | User API | loading/error | C |

**Dashboard Dependencies:**
- Fil: `src/features/dashboard/DashboardContainer.jsx`
- Hooks: `useAuth`, `useCallback`
- API: `/dashboard` (player), `/coach-analytics/dashboard/:coachId` (coach)
- Primitives: `LoadingState`, `ErrorState`, `AKGolfDashboard`

#### Video System

| Path | Component | Layout | Data Dependencies | UI States | Prioritet |
|------|-----------|--------|-------------------|-----------|-----------|
| `/videos` | `VideoLibraryPage` | AuthenticatedLayout | `videoApi`, `useVideoRequests`, `useAuth`, `useNotification` | loading/uploading/dragActive | **A** |
| `/videos/:videoId/analyze` | `VideoAnalysisPage` | AuthenticatedLayout | `videoApi`, video annotations | loading/error | **A** |
| `/videos/compare` | `VideoComparisonPage` | AuthenticatedLayout | `videoApi`, comparison data | loading/error | **A** |
| `/videos/progress` | `VideoProgressView` | AuthenticatedLayout | Video timeline API | loading/error | B |

**VideoLibraryPage Dependencies:**
- Fil: `src/features/video-library/VideoLibraryPage.jsx`
- Hooks: `useVideoRequests`, `useAuth`, `useNotification`
- API: `videoApi.uploadVideo`, `videoApi.extractVideoThumbnail`
- Analytics: `track()` for screen_view, upload events
- Primitives: Custom Tailwind components, Modal, Dropzone

#### Trening & Plan

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/trening/dagens` | `DagensTreningsplanContainer` | AuthenticatedLayout | Training API | B |
| `/trening/ukens` | `UkensTreningsplanContainer` | AuthenticatedLayout | Training API | B |
| `/trening/teknisk` | `TekniskPlanContainer` | AuthenticatedLayout | Training API | C |
| `/trening/dagbok` | `TreningsdagbokContainer` | AuthenticatedLayout | Training log API | C |
| `/trening/logg` | `LoggTreningContainer` | AuthenticatedLayout | Training API | C |
| `/treningsprotokoll` | `TreningsprotokollContainer` | AuthenticatedLayout | Training API | C |
| `/treningsstatistikk` | `TreningsstatistikkContainer` | AuthenticatedLayout | Training stats API | C |
| `/periodeplaner` | `PeriodeplanerContainer` | AuthenticatedLayout | Period plans API | C |
| `/aarsplan` | `AarsplanContainer` | AuthenticatedLayout | Annual plan API | C |
| `/plan-preview/:planId` | `PlanPreviewContainer` | AuthenticatedLayout | Plan API | D |

#### Kalender & Booking

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/kalender` | `CalendarPage` | None (self-contained) | Calendar API | **B** |
| `/kalender/booking` | `BookTrenerContainer` | AuthenticatedLayout | Booking API | B |

#### Mål & Utvikling

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/maalsetninger` | `MaalsetningerContainer` | AuthenticatedLayout | Goals API | B |
| `/goals` | `GoalsPage` | None (self-contained) | Goals API | B |
| `/utvikling` | `UtviklingsOversiktContainer` | AuthenticatedLayout | Development API | B |
| `/utvikling/breaking-points` | `BreakingPointsContainer` | AuthenticatedLayout | Breaking points API | B |
| `/utvikling/kategori` | `KategoriFremgangContainer` | AuthenticatedLayout | Category API | C |
| `/utvikling/benchmark` | `BenchmarkHistorikkContainer` | AuthenticatedLayout | Benchmark API | C |
| `/progress` | `ProgressDashboardContainer` | AuthenticatedLayout | Progress API | C |

#### Stats

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/stats` | `StatsPageV2` | None (self-contained) | Stats API | **B** |
| `/stats/ny` | `StatsOppdateringContainer` | AuthenticatedLayout | Stats API | C |
| `/stats/turnering` | `TurneringsstatistikkContainer` | AuthenticatedLayout | Tournament stats | C |
| `/stats/verktoy` | `StatsVerktoyContainer` | AuthenticatedLayout | Stats tools API | C |

#### Testing

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/testprotokoll` | `TestprotokollContainer` | AuthenticatedLayout | Test API | C |
| `/testresultater` | `TestresultaterContainer` | AuthenticatedLayout | Test results API | C |
| `/testing/krav` | `KategoriKravContainer` | AuthenticatedLayout | Category requirements | C |
| `/testing/registrer` | `RegistrerTestContainer` | AuthenticatedLayout | Test API | C |

#### Turneringer

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/turneringskalender` | `TurneringskalenderContainer` | AuthenticatedLayout | Tournament API | C |
| `/mine-turneringer` | `MineTurneringerContainer` | AuthenticatedLayout | Tournament API | C |
| `/turneringer/resultater` | `TurneringsResultaterContainer` | AuthenticatedLayout | Results API | C |
| `/turneringer/registrer` | `RegistrerTurneringsResultatContainer` | AuthenticatedLayout | Tournament API | D |

#### Sessions (Økter)

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/sessions` | `SessionsListContainer` | AuthenticatedLayout | Sessions API | C |
| `/session/new` | `SessionCreateFormContainer` | AuthenticatedLayout | Sessions API | C |
| `/session/:sessionId` | `SessionDetailViewContainer` | AuthenticatedLayout | Session detail API | C |
| `/session/:sessionId/active` | `ActiveSessionViewContainer` | AuthenticatedLayout | Active session API | C |
| `/session/:sessionId/reflection` | `SessionReflectionFormContainer` | AuthenticatedLayout | Session API | D |
| `/session/:sessionId/evaluate` | `SessionEvaluationFormContainer` | AuthenticatedLayout | Session API | D |
| `/session/stats` | `EvaluationStatsDashboardContainer` | AuthenticatedLayout | Stats API | D |

#### Evaluering

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/evaluering` | `EvalueringContainer` | AuthenticatedLayout | Evaluation API | C |
| `/evaluering/trening` | `TreningsevalueringContainer` | AuthenticatedLayout | Training eval API | D |
| `/evaluering/turnering` | `TurneringsevalueringContainer` | AuthenticatedLayout | Tournament eval API | D |

#### Kommunikasjon

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/meldinger` | `MessageCenter` | AuthenticatedLayout | Messages API | **C** |
| `/meldinger/ny` | `NewConversation` | AuthenticatedLayout | Messages API | C |
| `/meldinger/trener` | `MessageCenter (filterType="coach")` | AuthenticatedLayout | Messages API | C |
| `/meldinger/:conversationId` | `ConversationView` | AuthenticatedLayout | Conversation API | C |
| `/varsler` | `NotificationCenter` | AuthenticatedLayout | Notifications API | C |

#### Kunnskap & Ressurser

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/ressurser` | `RessurserContainer` | AuthenticatedLayout | Resources API | D |
| `/bevis` | `BevisContainer` | AuthenticatedLayout | Proof API | D |
| `/oevelser` | `OevelserContainer` | AuthenticatedLayout | Exercises API | D |
| `/ovelsesbibliotek` | `ExerciseLibraryContainer` | AuthenticatedLayout | Exercises API | D |

#### Skole

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/skoleplan` | `SkoleplanContainer` | AuthenticatedLayout | School API | D |
| `/skole/oppgaver` | `SkoleoppgaverContainer` | AuthenticatedLayout | School tasks API | D |

#### Annet

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/trenerteam` | `TrenerteamContainer` | AuthenticatedLayout | Coaches API | D |
| `/achievements` | `AchievementsDashboardContainer` | AuthenticatedLayout | Achievements API | D |
| `/badges` | `BadgesContainer` | AuthenticatedLayout | Badges API | D |
| `/arkiv` | `ArkivContainer` | AuthenticatedLayout | Archive API | D |
| `/notater` | `NotaterContainer` | AuthenticatedLayout | Notes API | C |
| `/samlinger` | `SamlingerContainer` | AuthenticatedLayout | Gatherings API | D |
| `/kalibrering` | `KalibreringsContainer` | AuthenticatedLayout | Calibration API | D |
| `/innstillinger/varsler` | `VarselinnstillingerContainer` | AuthenticatedLayout | Settings API | D |
| `/coach/modification-requests` | `ModificationRequestDashboardContainer` | AuthenticatedLayout | Modification API | D |

---

### COACH (46 routes)

#### Dashboard & Oversikt

| Path | Component | Layout | Data Dependencies | UI States | Prioritet |
|------|-----------|--------|-------------------|-----------|-----------|
| `/coach` | `CoachDashboard` | CoachLayout | `coachesAPI.*`, widgets | loading/error | **A** |
| `/coach/alerts` | `CoachAlertsPage` | CoachLayout | Alerts API | loading/error | B |
| `/coach/planning` | `CoachPlanningHub` | CoachLayout | Planning API | loading/error | C |

**CoachDashboard Dependencies:**
- Fil: `src/features/coach-dashboard/CoachDashboard.tsx`
- Hooks: `useNavigate`, `useState`, `useEffect`
- API: `coachesAPI.getAthletes()`, `getPendingItems()`, `getTodaySchedule()`, `getWeeklyStats()`
- Widgets: `CoachPlayerAlerts`, `CoachWeeklyTournaments`, `CoachInjuryTracker`
- Primitives: `StatsGridTemplate`, custom Card, Avatar, CategoryBadge

#### Spillere (Athletes)

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/athletes` | `CoachAthleteList` | CoachLayout | Athletes API | **A** |
| `/coach/athletes/status` | `CoachAthleteStatus` | CoachLayout | Status API | B |
| `/coach/athletes/tournaments` | `CoachAthleteTournaments` | CoachLayout | Tournaments API | C |
| `/coach/athletes/:athleteId` | `CoachAthleteDetail` | CoachLayout | Athlete detail API | **A** |
| `/coach/athletes/:athleteId/plan` | `CoachTrainingPlan` | CoachLayout | Training plan API | B |
| `/coach/athletes/:athleteId/plan/edit` | `CoachTrainingPlanEditor` | CoachLayout | Training plan API | C |
| `/coach/athletes/:athleteId/notes` | `CoachNotes` | CoachLayout | Notes API | C |
| `/coach/athletes/:athleteId/trajectory` | `CoachTrajectoryViewer` | CoachLayout | Trajectory API | C |
| `/coach/players/:playerId` | `CoachPlayerPage` | CoachLayout | Player API | B |

#### Video

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/videos` | `CoachVideosDashboard` | CoachLayout | Coach videos API | **A** |
| `/coach/videos/:videoId/analyze` | `VideoAnalysisPage` | CoachLayout | Video API | **A** |
| `/coach/videos/compare` | `VideoComparisonPage` | CoachLayout | Comparison API | **A** |
| `/coach/reference-videos` | `ReferenceLibrary` | CoachLayout | Reference API | B |
| `/coach/proof` | `CoachProofViewer` | CoachLayout | Proof API | B |

#### Grupper

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/groups` | `CoachGroupList` | CoachLayout | Groups API | C |
| `/coach/groups/create` | `CoachGroupCreate` | CoachLayout | Groups API | C |
| `/coach/groups/:groupId` | `CoachGroupDetail` | CoachLayout | Group detail API | C |
| `/coach/groups/:groupId/edit` | `CoachGroupCreate` | CoachLayout | Groups API | D |
| `/coach/groups/:groupId/plan` | `PlaceholderPage` | CoachLayout | N/A | D |

#### Booking

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/booking` | `CoachBookingCalendar` | CoachLayout | Booking API | B |
| `/coach/booking/requests` | `CoachBookingRequests` | CoachLayout | Booking requests API | C |
| `/coach/booking/settings` | `CoachBookingSettings` | CoachLayout | Settings API | D |

#### Turneringer

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/tournaments` | `CoachTournamentCalendar` | CoachLayout | Tournaments API | C |
| `/coach/tournaments/players` | `CoachTournamentPlayers` | CoachLayout | Players API | C |
| `/coach/tournaments/results` | `CoachTournamentResults` | CoachLayout | Results API | C |

#### Stats

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/stats` | `CoachStatsOverview` | CoachLayout | Stats API | B |
| `/coach/stats/progress` | `CoachStatsProgress` | CoachLayout | Progress API | C |
| `/coach/stats/regression` | `CoachStatsRegression` | CoachLayout | Regression API | C |
| `/coach/stats/datagolf` | `CoachDataGolf` | CoachLayout | DataGolf API | C |

#### Meldinger

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/messages` | `CoachMessageList` | CoachLayout | Messages API | C |
| `/coach/messages/compose` | `CoachMessageCompose` | CoachLayout | Messages API | C |
| `/coach/messages/scheduled` | `CoachScheduledMessages` | CoachLayout | Scheduled API | D |

#### Øvelser

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/exercises` | `CoachExerciseLibrary` | CoachLayout | Exercises API | C |
| `/coach/exercises/mine` | `CoachMyExercises` | CoachLayout | Exercises API | C |
| `/coach/exercises/templates` | `CoachExerciseTemplates` | CoachLayout | Templates API | C |
| `/coach/exercises/templates/create` | `CoachSessionTemplateEditor` | CoachLayout | Templates API | D |
| `/coach/exercises/templates/:templateId/edit` | `CoachSessionTemplateEditor` | CoachLayout | Templates API | D |

#### Annet

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/coach/training-plans/create` | `CoachTrainingPlanEditor` | CoachLayout | Plans API | C |
| `/coach/settings` | `CoachSettings` | CoachLayout | Settings API | D |
| `/coach/sessions/evaluations` | `CoachSessionEvaluations` | CoachLayout | Evaluations API | D |

---

### ADMIN (13 routes)

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/admin` | `AdminSystemOverview` | AdminLayout | System API | B |
| `/admin/users/coaches` | `AdminCoachManagement` | AdminLayout | Coaches API | B |
| `/admin/users/pending` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/users/invitations` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/tiers` | `AdminTierManagement` | AdminLayout | Tiers API | C |
| `/admin/tiers/features` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/feature-flags` | `AdminFeatureFlagsEditor` | AdminLayout | Feature flags API | C |
| `/admin/support` | `AdminEscalationSupport` | AdminLayout | Support API | C |
| `/admin/logs/audit` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/logs/errors` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/config/categories` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/config/tests` | `PlaceholderPage` | AdminLayout | N/A | D |
| `/admin/config/notifications` | `PlaceholderPage` | AdminLayout | N/A | D |

---

### MOBILE (5 routes)

| Path | Component | Layout | Data Dependencies | Prioritet |
|------|-----------|--------|-------------------|-----------|
| `/m/home` | `MobileHome` | MobileShell | Home API | C |
| `/m/plan` | `MobilePlan` | MobileShell | Plan API | C |
| `/m/log` | `MobileQuickLog` | MobileShell | Log API | C |
| `/m/calendar` | `MobileCalendar` | MobileShell | Calendar API | C |
| `/m/calibration` | `MobileCalibration` | MobileShell | Calibration API | D |

---

### DEV (4 routes) - kun i development

| Path | Component | Layout | Prioritet |
|------|-----------|--------|-----------|
| `/ui-lab` | `UILabContainer` | AuthenticatedLayout | D |
| `/stats-lab` | `StatsLab` | AuthenticatedLayout | D |
| `/appshell-lab` | `AppShellLab` | AuthenticatedLayout | D |
| `/calendar-lab` | `CalendarLab` | AuthenticatedLayout | D |

---

## Batch-plan for Visuell Oppgradering

### Batch A - Kritiske Skjermer (12 routes)
> **Fokus:** Dashboard + Video-system for begge roller

**Player:**
1. `/` og `/dashboard` - DashboardContainer + AKGolfDashboard
2. `/videos` - VideoLibraryPage
3. `/videos/:videoId/analyze` - VideoAnalysisPage
4. `/videos/compare` - VideoComparisonPage

**Coach:**
5. `/coach` - CoachDashboard
6. `/coach/athletes` - CoachAthleteList
7. `/coach/athletes/:athleteId` - CoachAthleteDetail
8. `/coach/videos` - CoachVideosDashboard
9. `/coach/videos/:videoId/analyze` - VideoAnalysisPage (shared)
10. `/coach/videos/compare` - VideoComparisonPage (shared)

**Shared Components:**
- `LoadingState`, `ErrorState`
- Video player components
- Dashboard widgets

---

### Batch B - Sekundære Nøkkelskjermer (18 routes)
> **Fokus:** Kalender, Mål, Stats, Booking

**Player:**
1. `/kalender` - CalendarPage
2. `/maalsetninger` og `/goals` - Goals
3. `/stats` - StatsPageV2
4. `/utvikling` - UtviklingsOversiktContainer
5. `/utvikling/breaking-points` - BreakingPointsContainer
6. `/videos/progress` - VideoProgressView
7. `/dashboard-v2` - DashboardPage

**Coach:**
8. `/coach/alerts` - CoachAlertsPage
9. `/coach/booking` - CoachBookingCalendar
10. `/coach/athletes/status` - CoachAthleteStatus
11. `/coach/athletes/:athleteId/plan` - CoachTrainingPlan
12. `/coach/reference-videos` - ReferenceLibrary
13. `/coach/proof` - CoachProofViewer
14. `/coach/stats` - CoachStatsOverview
15. `/coach/players/:playerId` - CoachPlayerPage

**Admin:**
16. `/admin` - AdminSystemOverview
17. `/admin/users/coaches` - AdminCoachManagement

---

### Batch C - Støtteskjermer (40+ routes)
> **Fokus:** Kommunikasjon, Grupper, Treningslogging, Notater

**Inkluderer:**
- Alle `/meldinger/*` routes
- Alle `/coach/groups/*` routes
- Alle `/coach/messages/*` routes
- Alle `/trening/*` routes
- Alle `/testing/*` routes
- Alle `/evaluering/*` routes
- Sessions (`/sessions`, `/session/*`)
- Stats sub-routes
- Tournament sub-routes
- Exercises
- Mobile routes (`/m/*`)

---

### Batch D - Edge Cases & Placeholders (30+ routes)
> **Fokus:** Sjelden brukte skjermer, placeholders, innstillinger

**Inkluderer:**
- `/login`
- Alle `/admin/` placeholder routes
- Innstillinger routes
- Arkiv, Ressurser, Skole
- Dev-only routes (`/ui-lab`, `/stats-lab`, etc.)
- Session reflection/evaluation forms
- Template editors

---

## UI Patterns Oppsummert

### Data-fetching Pattern
```jsx
const [state, setState] = useState('loading');
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// Fetch on mount with useCallback/useEffect
// Set state to 'loading' -> 'idle' | 'error'
```

### UI States
- **loading:** `<LoadingState message="..." />`
- **error:** `<ErrorState errorType={} message={} onRetry={} />`
- **empty:** Custom empty state per component
- **idle:** Main content render

### Common Primitives
- `Card` (custom)
- `Button`, `Input`, `Select` (Tailwind-based)
- `Modal` (custom)
- `LoadingState`, `ErrorState` (`src/components/ui/`)
- `StatsGridTemplate` (`src/ui/templates/`)
- Lucide icons

### Analytics
- `track(eventName, properties)` fra `src/analytics/track`
- Brukes for screen_view, user actions, uploads

---

## Filer å Undersøke Videre

For Batch A-oppgradering, prioriter disse filene:

```
src/features/dashboard/
├── DashboardContainer.jsx
├── AKGolfDashboard.jsx
└── DashboardPage.jsx

src/features/video-library/
├── VideoLibraryPage.jsx
└── VideoLibrary.jsx

src/features/video-analysis/
└── VideoAnalysisPage.jsx

src/features/video-comparison/
└── VideoComparisonPage.jsx

src/features/coach-dashboard/
├── CoachDashboard.tsx
└── widgets/

src/features/coach-athlete-list/
└── CoachAthleteList.tsx

src/features/coach-athlete-detail/
└── CoachAthleteDetail.tsx

src/features/coach-videos/
├── CoachVideosDashboard.jsx
└── ReferenceLibrary.jsx

src/components/ui/
├── LoadingState.jsx
└── ErrorState.jsx
```

---

## Notater

1. **Lazy Loading:** Alle feature-komponenter er lazy-loaded med `React.lazy()`
2. **Suspense:** Global `<Suspense fallback={<LoadingState />}>` wrapper
3. **Error Boundary:** Global `<ErrorBoundary>` wrapper
4. **Offline Support:** `useOnlineStatus()` hook + `OfflineBanner` component
5. **Notifications:** `Toast`, `VideoNotificationManager` globalt tilgjengelig
6. **Role-based:** Coach routes krever `requiredRole="coach"`, Admin krever `requiredRole="admin"`
