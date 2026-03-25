# DataGolf Focus Engine

The Focus Engine uses DataGolf professional golf statistics to determine which areas a player should prioritize in training. It combines IUP test results with pro-level component weights to generate personalized training recommendations.

## Overview

The Focus Engine provides:
- **Component-based training focus** (OTT/APP/ARG/PUTT)
- **Recommended training split** with floor/ceiling constraints
- **Team heatmaps** for coaches
- **At-risk player identification** based on training adherence

## Quick Start

### 1. Run Database Migration

```bash
cd apps/api
npx prisma migrate deploy
```

### 2. Ingest DataGolf Data

Place `Archive.zip` in project root or specify a custom path.

Data files are located in:
- `<project-root>/data/datagolf/performance/` - Season strokes gained CSVs
- `<project-root>/data/datagolf/skills/` - Approach skill CSVs
- `<project-root>/data/wagr/` - WAGR ranking CSVs

```bash
# Via API (admin only)
curl -X POST http://localhost:3000/api/v1/focus-engine/internal/ingest \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"forceReprocess": false}'
```

### 3. Compute Component Weights

```bash
curl -X POST http://localhost:3000/api/v1/focus-engine/internal/compute-weights \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"windowSize": 3, "minPlayers": 100}'
```

### 4. Get Player Focus

```bash
# For current user
curl http://localhost:3000/api/v1/focus-engine/me/focus \
  -H "Authorization: Bearer <token>"

# For specific user
curl http://localhost:3000/api/v1/focus-engine/users/{userId}/focus \
  -H "Authorization: Bearer <token>"
```

## API Endpoints

### Admin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/internal/ingest` | Ingest DataGolf data from Archive.zip |
| `POST` | `/internal/compute-weights` | Compute component weights from pro data |

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/weights` | Get current component weights |
| `GET` | `/users/{userId}/focus` | Get focus for specific user |
| `GET` | `/me/focus` | Get focus for current user |
| `GET` | `/coaches/{coachId}/teams/{teamId}/focus` | Get team focus heatmap |
| `GET` | `/stats` | Get ingestion statistics |

## Data Model

### Database Tables

```
dg_player_seasons
├── player_id (player_name as ID)
├── season (2000-2026)
├── ott_true, app_true, arg_true, putt_true, t2g_true, total_true
├── rounds_played, events_played, wins, x_wins
└── source_version, ingested_at

dg_approach_skills_l24
├── player_id
├── bucket (50_100, 100_150, 150_200, over_200, under_150, over_150)
├── lie (fairway, rough)
├── stat (sg_per_shot, proximity_ft, green_hit_rate, good_shot_rate, poor_shot_avoidance)
├── value, shot_count
└── source_version, ingested_at

dg_component_weights
├── window_start_season, window_end_season
├── w_ott, w_app, w_arg, w_putt (sum to 1.0)
├── computed_at, is_active
└── created_at, updated_at

test_component_mappings
├── test_number (1-20)
├── component (OTT, APP, ARG, PUTT)
└── weight (contribution weight)

player_focus_cache
├── player_id (UUID)
├── focus_component, focus_scores, recommended_split
├── reason_codes, confidence
└── computed_at, expires_at
```

### Test-to-Component Mapping

| Test | Name | Component | Weight |
|------|------|-----------|--------|
| 1 | Driver Avstand | OTT | 1.0 |
| 2 | 3-tre Avstand | OTT | 0.8 |
| 5 | Klubbhastighet | OTT | 1.0 |
| 6 | Ballhastighet | OTT | 1.0 |
| 7 | Smash Factor | OTT | 0.8 |
| 3 | 5-jern Avstand | APP | 0.8 |
| 4 | Wedge Avstand | APP | 0.6 |
| 8-11 | Approach 25-100m | APP | 0.8-1.0 |
| 17 | Chipping | ARG | 1.0 |
| 18 | Bunker | ARG | 1.0 |
| 15 | Putting 3m | PUTT | 1.0 |
| 16 | Putting 6m | PUTT | 1.0 |

## Focus Calculation Logic

### 1. Component Weights

Weights are calculated from pro player data variance:
- Extract stddev for each SG component (OTT, APP, ARG, PUTT)
- Normalize to sum = 1.0
- Higher variance → Higher weight (more differentiating)

Typical weights (2022-2024):
- APP: ~0.35 (approach has highest variance)
- OTT: ~0.25
- ARG: ~0.20
- PUTT: ~0.20

### 2. Weakness Detection

For each component:
```
weakness_c = clamp(0..1, (target_percentile - user_percentile_c) / 100)
priority_c = weakness_c * weight_c
```

Focus component = highest priority

### 3. Training Split

```
raw_split = priority_c / sum(priorities)
final_split = apply_constraints(raw_split)
  - min: 10%
  - max: 50%
  - sum: 100%
```

### 4. Confidence Levels

| Level | Criteria |
|-------|----------|
| `high` | 6+ test results |
| `med` | 3-5 test results |
| `low` | < 3 test results |

### 5. Reason Codes

- `weak_ott_test_cluster` - OTT tests below target percentile
- `weak_app_test_cluster` - APP tests below target percentile
- `high_weight_app` - APP has high weight (>0.3)
- `approach_150_200_gap` - Specific approach bucket weakness
- `insufficient_test_data` - Low confidence due to few tests

## UI Components

### Player Widget (`FocusWidget.jsx`)

```jsx
import { FocusWidget } from '@/features/focus-engine';

// In player dashboard
<FocusWidget className="col-span-1" />
```

Displays:
- Focus component (e.g., "Approach")
- Reason for focus
- Recommended training split (progress bars)
- CTAs: "Start økt" / "Oppdater plan"

### Coach Heatmap (`TeamFocusHeatmap.jsx`)

```jsx
import { TeamFocusHeatmap } from '@/features/focus-engine';

// In coach dashboard
<TeamFocusHeatmap coachId={coachId} teamId={teamId} />
```

Displays:
- 4-cell heatmap (player count per component)
- Top reason codes
- At-risk players (low adherence)

## Production Deployment

### Environment Variables

```bash
# No additional env vars required
# Uses existing DATABASE_URL, JWT_SECRET, etc.
```

### Scheduled Jobs

Set up cron for daily weight recomputation:

```bash
# Daily at 03:00 UTC
0 3 * * * curl -X POST http://localhost:3000/api/v1/focus-engine/internal/compute-weights \
  -H "Authorization: Bearer <service-token>"
```

### Data Refresh

1. Update `Archive.zip` with new DataGolf data
2. Call `/internal/ingest` endpoint
3. Weights auto-update based on new data

## Troubleshooting

### No weights available

```bash
# Check if data was ingested
curl http://localhost:3000/api/v1/focus-engine/stats

# If playerSeasons = 0, run ingestion first
```

### Focus calculation fails

Check:
1. Player exists in tenant
2. Test results exist for player
3. Test-component mappings are seeded (migration includes defaults)

### Low confidence results

Player needs more test data. Encourage completing tests in all areas.

## Not Implemented (Out of Scope)

- Score prediction
- Weather/course normalization
- Pro-level comparison claims
- Historical trend analysis
