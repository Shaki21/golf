# Release Smoke Test

> AK Golf Academy - Pre-release Quality Assurance

## Canonical Routes (P0)

| Route | Beskrivelse | BottomNav |
|-------|-------------|-----------|
| `/dashboard-v2` | Hovedoversikt (ny versjon) | ✅ Dashboard |
| `/kalender` | Kalendervisning | ✅ Kalender |
| `/stats` | Statistikk | ✅ Statistikk |
| `/goals` | Målsettinger | ✅ Mål |

**Legacy:** `/dashboard` finnes fortsatt men BottomNav peker til `/dashboard-v2`.

---

## Pre-flight Checklist

| Item | Sjekk | Notater |
|------|-------|---------|
| API Running | `curl http://localhost:4000/api/v1/health` → 200 | Start backend først |
| Env Variables | `REACT_APP_API_URL` satt (eller localhost:4000 default) | Sjekk `.env` |
| Build Success | `npm run build` uten feil | Kjør før deploy |
| Browser | Chrome/Safari/Firefox siste versjon | Test på mobil viewport |

---

## P0 Smoke Test (10 minutter)

### 1. Dashboard Load

**URL:** `/dashboard-v2`

**Forventet:**
- [ ] Side laster uten feil
- [ ] Header viser tittel
- [ ] ThemeSwitcher synlig (3 ikoner: sol/måne/monitor)
- [ ] Stats cards vises (eller loading skeleton)
- [ ] Kommende økter-seksjon synlig
- [ ] BottomNav med 4 ikoner nederst

**Ved API-feil:** Skal vise error state med "Prøv igjen" knapp

---

### 2. Navigasjon via BottomNav

**Aksjon:** Naviger i rekkefølge:
1. Dashboard → Kalender → Stats → Mål → Dashboard

**Forventet:**

| Fra | Til | URL |
|-----|-----|-----|
| Dashboard | Kalender | `/kalender` |
| Kalender | Stats | `/stats` |
| Stats | Mål | `/goals` |
| Mål | Dashboard | `/dashboard-v2` |

- [ ] Hver navigasjon oppdaterer URL
- [ ] Aktiv tab markeres (farge endring)
- [ ] Ingen doble screen_view events (sjekk console/overlay)

---

### 3. Data States per Side

Test hver side for:

| Side | Loading | Error | Empty |
|------|---------|-------|-------|
| Dashboard | Skeleton vises | Error state | Minimal innhold |
| Kalender | Skeleton vises | Error state | Tom kalender |
| Stats | Skeleton vises | Error state | "Ingen data" |
| Goals | Skeleton vises | Error state | "Ingen mål" |

- [ ] Ingen blank screens
- [ ] Alle error states har "Prøv igjen"
- [ ] Empty states er brukervennlige (norsk)

---

### 4. Theme Switching

**Aksjon:** Klikk hver tema-knapp i header

| Mode | Resultat |
|------|----------|
| ☀️ Light | Lys bakgrunn, mørk tekst |
| 🌙 Dark | Mørk bakgrunn, lys tekst |
| 💻 System | Følger OS preferanse |

- [ ] Theme persisterer etter refresh
- [ ] Alle sider respekterer valgt tema
- [ ] localStorage inneholder `ak-golf-theme`

---

### 5. Analytics (DEV only)

**Forutsetning:** `NODE_ENV=development`

**Aksjon:**
1. Åpne DevTools console
2. Naviger mellom sider
3. (Valgfritt) Klikk 📊 knappen for debug overlay

**Forventet:**
- [ ] `[Analytics] screen_view` logg for hver navigasjon
- [ ] Ingen dupliserte events for samme side
- [ ] Debug overlay viser events (hvis aktivert)
- [ ] Payload inneholder kun: `screen`, `source`, `type`

---

### 6. Simulate State (DEV only)

**Forutsetning:** `NODE_ENV=development`

**Test URLs:**
```
/dashboard-v2?state=loading
/dashboard-v2?state=error
/dashboard-v2?state=empty
/kalender?state=loading
/stats?state=error
/goals?state=empty
```

**Forventet:**
- [ ] Hver state vises korrekt
- [ ] Fjern `?state=` → normal visning
- [ ] **I PROD:** Query param ignoreres (ingen effekt)

---

### 7. Offline/Error Resilience

**Aksjon:**
1. DevTools → Network → Offline
2. Refresh eller klikk "Prøv igjen"
3. Aktiver nettverk igjen
4. Klikk "Prøv igjen"

**Forventet:**
- [ ] Error state vises (ikke blank)
- [ ] Feilmelding er brukervennlig (norsk)
- [ ] "Prøv igjen" knapp fungerer
- [ ] Data laster når nettverk aktiveres

---

## DEV-Only Features Verification

Disse MÅ være deaktivert i produksjon:

| Feature | Fil | Verifisering |
|---------|-----|--------------|
| State simulation | `src/dev/simulateState.ts` | `?state=X` har ingen effekt |
| Analytics debug | `src/analytics/AnalyticsDebug.tsx` | 📊 knapp ikke synlig |
| UI Lab | `/ui-lab` | Route returnerer 404 eller redirect |
| Console logs | Diverse | Ingen `[Analytics]` eller `[EnvValidation]` i PROD |

---

## Acceptance Criteria

| Test | Pass Kriterie |
|------|---------------|
| Dashboard | Laster, viser data eller error state |
| Calendar | Viser måned, dato-valg fungerer |
| Stats | Viser statistikk eller graceful error |
| Goals | Lister mål eller empty state |
| Theme | Alle 3 modes fungerer, persisterer |
| Offline | Error state vises, retry fungerer |
| Navigation | BottomNav fungerer på alle sider |
| DEV-only | Ingen DEV features i PROD build |

---

## Coach Video Features (P0)

### 8. Coach Video Dashboard

**URL:** `/coach/videos`

**Forventet:**
- [ ] Dashboard laster med CoachAppShell
- [ ] Player Video Feed viser spillervideoer
- [ ] Pending Review Queue viser uanalyserte videoer
- [ ] Filter/søk fungerer
- [ ] "Be om video" knapp synlig

### 9. Video Analysis

**URL:** `/coach/videos/:videoId/analyze`

**Forventet:**
- [ ] Video player laster med signed URL
- [ ] Mørk bakgrunn for video (immersive)
- [ ] Annotations kan opprettes
- [ ] "Marker som gjennomgått" knapp fungerer
- [ ] Back-knapp navigerer tilbake

### 10. Video Sharing (Coach Only)

**URL:** `/coach/videos` → Velg video → Del

**Forventet:**
- [ ] Share modal åpnes
- [ ] Spillerliste vises
- [ ] Dele til spillere fungerer
- [ ] Success feedback vises

### 11. Player Video Library

**URL:** `/videos`

**Forventet:**
- [ ] Viser spillerens egne videoer
- [ ] Viser delte videoer (med "Delt av trener" badge)
- [ ] Kan klikke video for analyse
- [ ] AppShell synlig (header, nav)

### 12. Player Video Analysis

**URL:** `/videos/:videoId/analyze`

**Forventet:**
- [ ] Video laster
- [ ] Wrapped i AuthenticatedLayout
- [ ] Dark theme for video viewer

---

## Common Issues

| Problem | Løsning |
|---------|---------|
| Blank screen | Sjekk browser console for feil |
| 401 redirect loop | Clear localStorage, logg inn på nytt |
| API errors | Verifiser REACT_APP_API_URL |
| Theme ikke persisterer | Sjekk localStorage for `ak-golf-theme` |
| DEV features i PROD | Verifiser `NODE_ENV=production` i build |

---

## Sign-off

| Tester | Dato | Miljø | Resultat |
|--------|------|-------|----------|
| | | DEV | PASS / FAIL |
| | | STAGING | PASS / FAIL |
| | | PROD | PASS / FAIL |
