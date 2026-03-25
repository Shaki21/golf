# External Data Sources

This folder contains external data files used for benchmarking and ranking in the IUP Golf platform.

## Folder Structure

```
data/
├── datagolf/
│   ├── performance/    # Season-level strokes gained data (2000-2026)
│   └── skills/         # Approach skill metrics
├── wagr/               # World Amateur Golf Ranking data
├── reference/          # Reference documentation
├── tests/              # Test data files
└── training/           # Training reference data
```

## DataGolf Performance Data

**Location:** `datagolf/performance/`

27 CSV files containing season-level strokes gained data from DataGolf:
- `dg_performance_2000.csv` through `dg_performance_2026.csv`
- ~400 players per season
- 11,271 total player-seasons

**Columns:**
| Column | Description |
|--------|-------------|
| player_name | Player name |
| events_played | Number of events |
| wins | Actual wins |
| x_wins | Expected wins |
| x_wins_majors | Expected major wins |
| rounds_played | Total rounds |
| shotlink_played | Rounds with ShotLink data |
| putt_true | Strokes Gained: Putting |
| arg_true | Strokes Gained: Around the Green |
| app_true | Strokes Gained: Approach |
| ott_true | Strokes Gained: Off the Tee |
| t2g_true | Strokes Gained: Tee to Green |
| total_true | Total Strokes Gained |

## DataGolf Skills Data

**Location:** `datagolf/skills/`

Approach skill metrics from DataGolf:
- `app_skill_l24_sg.csv` - Strokes gained approach
- `app_skill_l24_prox.csv` - Proximity metrics
- `app_skill_l24_gh.csv` - Going for green metrics
- `app_skill_l24_great.csv` - Great shots metrics
- `app_skill_l24_bad.csv` - Avoid bad shots metrics

## WAGR Rankings

**Location:** `wagr/`

World Amateur Golf Ranking data (2025):
- `Men_Ranking_FilteredBy_Year_2025.csv` - Men's rankings
- `Women_Ranking_FilteredBy_Year_2025.csv` - Women's rankings
- 8,302 total players

**Columns:**
| Column | Description |
|--------|-------------|
| Rank | Current world ranking |
| Move | Movement from previous week |
| Ctry | Country |
| Player | Player name |
| Divisor | Ranking divisor |
| Pts Avg | Points average |

## Import Scripts

Data is imported to the database using scripts in `apps/api/scripts/`:

| Script | Database Table | Description |
|--------|----------------|-------------|
| `import-datagolf-performance.ts` | `dg_player_seasons` | Import strokes gained data |
| `prisma/seeds/wagr-rankings.ts` | `wagr_rankings` | Import WAGR rankings |
| `golfbox-import.ts` | `golfbox_competitions`, `golfbox_results` | Import tournament results |

## Data Sources

- **DataGolf:** https://datagolf.com (API key required)
- **WAGR:** https://wagr.com
- **Golfbox:** https://scores.golfbox.dk

---

*Last updated: December 28, 2025*
