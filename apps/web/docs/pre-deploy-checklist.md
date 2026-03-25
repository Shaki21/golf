# Pre-Deploy Checklist

> AK Golf Academy - Deployment Gate

## 1. Environment Variables

### Required for Production

```bash
REACT_APP_API_URL=https://api.your-domain.com/api/v1
```

### Automatic Defaults

| Variable | Default | Notes |
|----------|---------|-------|
| `REACT_APP_API_URL` | `http://localhost:4000/api/v1` | **Må settes i PROD** |
| `NODE_ENV` | `production` (ved build) | Settes automatisk av CRA |

### Validation

App validerer env ved oppstart via `src/utils/envValidation.ts`:
- DEV: Logger til console
- PROD: Advarer hvis API URL mangler

---

## 2. Build Command

```bash
# Standard build
npm run build

# Med ESLint disabled (hvis linting-warnings blokkerer)
DISABLE_ESLINT_PLUGIN=true npm run build
```

**Output:** `build/` mappe klar for deploy

### Verifiser build:
- [ ] Ingen feil i terminal
- [ ] `build/static/js/main.*.js` eksisterer
- [ ] `build/static/css/main.*.css` eksisterer
- [ ] `build/index.html` eksisterer

---

## 3. Smoke Test

**Se:** [release-smoke-test.md](./release-smoke-test.md)

### Quick Sanity Check

```bash
# Lokal preview av build
npx serve -s build

# Åpne http://localhost:3000
```

Test minst:
- [ ] `/dashboard-v2` laster
- [ ] Theme switching fungerer
- [ ] BottomNav navigering fungerer
- [ ] Ingen console errors

---

## 4. DEV-Only Features (MÅ være disabled)

Disse features MÅ være deaktivert i produksjon:

| Feature | Fil | Hvordan deaktivert |
|---------|-----|-------------------|
| **UI Lab** | `src/App.jsx:358` | `{IS_DEV && ...}` wrapper |
| **State Simulation** | `src/dev/simulateState.ts` | Returnerer `null` når `!IS_DEV` |
| **Analytics Debug** | `src/analytics/AnalyticsDebug.tsx` | Returnerer `null` når `!IS_DEV` |
| **Console Logging** | `src/analytics/track.ts` | Kun logges når `IS_DEV` |
| **Env Validation Log** | `src/utils/envValidation.ts` | OK-logg kun i DEV |

### Verifisering i PROD build:

1. Serve build lokalt: `npx serve -s build`
2. Sjekk:
   - [ ] `/ui-lab` gir 404 eller redirect
   - [ ] `?state=loading` har ingen effekt
   - [ ] 📊 analytics-knapp ikke synlig
   - [ ] Ingen `[Analytics]` i console
   - [ ] Ingen `[EnvValidation] OK` i console

---

## 5. Security Checklist

- [ ] Ingen hardkodede API-nøkler i koden
- [ ] Ingen sensitiv data i localStorage (kun tokens)
- [ ] 401-håndtering: Tokens cleares, redirect til login
- [ ] 403-håndtering: Logger kun URL, ikke token/body
- [ ] Analytics payload saniteres (se `src/analytics/track.ts`)

---

## 6. Final Gate

| Sjekk | Status |
|-------|--------|
| Build grønn | ⬜ |
| Env vars satt | ⬜ |
| Smoke test PASS | ⬜ |
| DEV features disabled | ⬜ |
| Security OK | ⬜ |

---

## Deploy Commands (eksempel)

```bash
# Netlify
netlify deploy --prod --dir=build

# Vercel
vercel --prod

# Manual upload
# Kopier build/ til server
```

---

## Rollback Plan

Hvis deploy feiler:
1. Revert til forrige build
2. Sjekk console/network errors
3. Verifiser API URL er riktig
4. Kjør smoke test på nytt

---

## Sign-off

| Deployer | Dato | Commit | Miljø |
|----------|------|--------|-------|
| | | | STAGING / PROD |
