# Performance Domain Module

Evidence-based performance tracking for golf training plans.

## Architecture

```
performance/
├── domain-mapping/       # Test domain → SG component mapping
├── category-constraints/ # Category advancement constraint analysis
├── bp-evidence/          # Breaking point evidence-based tracking
└── index.ts              # Unified exports
```

## Core Concepts

### Test Domain Codes

| Code    | SG Component | Description                      |
|---------|--------------|----------------------------------|
| TEE     | OTT          | Tee shots (driver, 3-wood)       |
| INN200  | APP          | Long approach (200+ m)           |
| INN150  | APP          | Medium-long approach (150-200 m) |
| INN100  | APP          | Medium approach (100-150 m)      |
| INN50   | APP          | Short approach (50-100 m)        |
| ARG     | ARG          | Around the green                 |
| PUTT    | PUTT         | Putting                          |
| PHYS    | TOTAL        | Physical fitness                 |

### Key Principle

> **Completion affects effort, NOT progress.**
> Progress only changes when a benchmark test shows improvement.

- `effortPercent`: Increases with completed training sessions
- `progressPercent`: Only changes via benchmark test evaluation

## Module: domain-mapping

Maps test domains to Strokes Gained components with proof metrics.

```typescript
import {
  mapTestDomainToComponent,
  getProofMetricsForDomain,
  parseSuccessRule,
  getDomainLabel
} from '@/domain/performance';

// Get SG component for a domain
const result = mapTestDomainToComponent('TEE');
// { sgComponent: 'OTT', relatedTestNumbers: [1, 2, 5, 6, 7] }

// Get proof metrics with category targets
const metrics = getProofMetricsForDomain('PUTT');
// [{ id: 'PUTT_3M_PCT', testNumber: 15, categoryTargets: {...} }]

// Get Norwegian label
getDomainLabel('ARG', 'no'); // "Rundt green"
```

## Module: category-constraints

Identifies binding constraints blocking category advancement.

```typescript
import {
  createCategoryConstraintsService,
  type BindingConstraint
} from '@/domain/performance';

const service = createCategoryConstraintsService(prisma);

// Get top binding constraints for a player
const result = await service.getBindingConstraints({
  playerId: '...',
  currentCategory: 'F',
  gender: 'M',
  targetCategory: 'E',
  maxConstraints: 2
});

// result.constraints: BindingConstraint[]
// Each has: domainCode, gapPercent, priority, severity
```

### Constraint Severity

| Level    | Gap Range | Description                    |
|----------|-----------|--------------------------------|
| critical | > 25%     | Far from target                |
| high     | 15-25%    | Significant improvement needed |
| medium   | 5-15%     | Moderate gap                   |
| low      | < 5%      | Close to target                |

## Module: bp-evidence

Evidence-based breaking point progress tracking.

```typescript
import {
  createBpEvidenceService,
  shouldTransitionStatus,
  type BpStatus
} from '@/domain/performance';

const service = createBpEvidenceService(prisma);

// Record training effort (sessions → effortPercent)
await service.recordTrainingEffort({
  breakingPointId: '...'
});

// Evaluate benchmark test (only way to change progressPercent)
await service.evaluateBenchmark({
  breakingPointId: '...',
  proofMetric: { metricId: 'DRIVER_DISTANCE_CARRY', direction: 'higher_better' },
  testValue: 235,
  testDate: new Date(),
  successRule: 'DRIVER_DISTANCE_CARRY:>=:230'
});
```

### BP Status Flow

```
not_started → identified → in_progress → awaiting_proof → resolved
                              ↓                              ↓
                           (regressed) ←───────────────── (regressed)
```

**Transition triggers:**
- `identified → in_progress`: First session completed
- `in_progress → awaiting_proof`: Effort ≥ 50%
- `awaiting_proof → resolved`: Benchmark meets success criteria
- `resolved → regressed`: Performance drops below threshold

### Success Rules

```
"METRIC_ID:>=:THRESHOLD"      # Metric must meet threshold
"TEST_ID:pass"                # Test must be passed
"improvement:percent:VALUE"   # Must improve by percentage
```

## Session Selection Integration

Session selection now returns `selectionReasons` explaining why a template was chosen:

```typescript
interface SelectionReasons {
  domainMatch: boolean;      // Template trains domain with active BP
  constraintMatch: boolean;  // Template trains top-2 constraint
  periodizationFit: number;  // 0-150 score for period match
  proofCoverage: boolean;    // Template includes proof-metric exercise
  scoreBreakdown?: {...};    // Detailed scoring components
}
```

## V2 Scoring Bonuses

| Factor              | Points | Description                            |
|---------------------|--------|----------------------------------------|
| Period match        | +100   | Template matches current period        |
| Learning phase      | +50    | Template matches learning phase        |
| Domain coverage     | +50    | Trains domain with active BP           |
| Constraint relevance| +40    | Trains top binding constraint          |
| Proof progress      | +30    | Includes proof-metric exercise         |
| Recent usage        | -20    | Penalty per use in last 7 days         |
