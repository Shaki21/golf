import React, { useState } from 'react';
import {
  Award, CheckCircle, Circle,
  Info
} from 'lucide-react';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// MOCK DATA
// ============================================================================

const CURRENT_CATEGORY = 'C';
const TARGET_CATEGORY = 'B';

const CATEGORIES = [
  { level: 'K', minPoints: 0 },
  { level: 'J', minPoints: 100 },
  { level: 'I', minPoints: 200 },
  { level: 'H', minPoints: 300 },
  { level: 'G', minPoints: 400 },
  { level: 'F', minPoints: 500 },
  { level: 'E', minPoints: 600 },
  { level: 'D', minPoints: 700 },
  { level: 'C', minPoints: 800 },
  { level: 'B', minPoints: 900 },
  { level: 'A', minPoints: 1000 },
];

const CATEGORY_REQUIREMENTS = {
  'B': {
    tests: [
      {
        id: 'driving_distance',
        name: 'Driver avstand',
        category: 'Driving',
        requirement: 250,
        unit: 'm',
        current: 255,
        met: true,
        description: 'Gjennomsnittlig driveavstand over 5 slag',
      },
      {
        id: 'driving_accuracy',
        name: 'Fairway treff',
        category: 'Driving',
        requirement: 70,
        unit: '%',
        current: 68,
        met: false,
        description: 'Prosent av fairways truffet over 18 hull',
      },
      {
        id: 'gir',
        name: 'GIR (Greens in Regulation)',
        category: 'Jernspill',
        requirement: 60,
        unit: '%',
        current: 55,
        met: false,
        description: 'Prosent av greener natt i regulation',
      },
      {
        id: 'proximity',
        name: 'Naerhet til hull fra 100m',
        category: 'Jernspill',
        requirement: 8,
        unit: 'm',
        current: 9.5,
        met: false,
        lowerIsBetter: true,
        description: 'Gjennomsnittlig avstand til hull fra 100m',
      },
      {
        id: 'scrambling',
        name: 'Scrambling',
        category: 'Kortspill',
        requirement: 60,
        unit: '%',
        current: 58,
        met: false,
        description: 'Prosent up-and-down fra utenfor greenen',
      },
      {
        id: 'sand_saves',
        name: 'Sand saves',
        category: 'Kortspill',
        requirement: 50,
        unit: '%',
        current: 55,
        met: true,
        description: 'Prosent up-and-down fra bunker',
      },
      {
        id: 'putts_per_round',
        name: 'Putts per runde',
        category: 'Putting',
        requirement: 30,
        unit: '',
        current: 31.5,
        met: false,
        lowerIsBetter: true,
        description: 'Gjennomsnittlig antall putts per 18 hull',
      },
      {
        id: 'one_putt_pct',
        name: 'En-putt prosent',
        category: 'Putting',
        requirement: 40,
        unit: '%',
        current: 38,
        met: false,
        description: 'Prosent av greener med kun en putt',
      },
      {
        id: 'club_speed',
        name: 'Klubbfart driver',
        category: 'Fysisk',
        requirement: 105,
        unit: 'mph',
        current: 108,
        met: true,
        description: 'Gjennomsnittlig klubbhodefart med driver',
      },
      {
        id: 'core_strength',
        name: 'Core-test',
        category: 'Fysisk',
        requirement: 80,
        unit: 'sek',
        current: 90,
        met: true,
        description: 'Plankehold i sekunder',
      },
    ],
    rounds: {
      required: 10,
      completed: 8,
      handicapRequired: 8.0,
      currentHandicap: 9.2,
    },
  },
};

// ============================================================================
// REQUIREMENT CARD
// ============================================================================

const RequirementCard = ({ test }) => {
  const progressPercent = test.lowerIsBetter
    ? Math.min(100, (test.requirement / test.current) * 100)
    : Math.min(100, (test.current / test.requirement) * 100);

  const difference = test.lowerIsBetter
    ? test.requirement - test.current
    : test.current - test.requirement;

  return (
    <Card variant="default" padding="md">
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-2)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            marginBottom: 'var(--spacing-1)',
          }}>
            <Badge variant="accent" size="sm">{test.category}</Badge>
            {test.met ? (
              <CheckCircle size={14} color="var(--status-success)" />
            ) : (
              <Circle size={14} color="var(--text-tertiary)" />
            )}
          </div>
          <CardTitle style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {test.name}
          </CardTitle>
          <p style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            margin: '4px 0 0 0',
          }}>
            {test.description}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 'var(--spacing-2)' }}>
        <div style={{
          height: '6px',
          backgroundColor: 'var(--bg-neutral-subtle)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: test.met ? 'var(--status-success)' :
                           progressPercent >= 80 ? 'var(--status-warning)' : 'var(--status-error)',
            borderRadius: '3px',
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Krav</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {test.lowerIsBetter ? '≤' : '≥'} {test.requirement}{test.unit}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Din</div>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: test.met ? 'var(--status-success)' : 'var(--status-error)',
          }}>
            {test.current}{test.unit}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Differanse</div>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: difference >= 0 ? 'var(--status-success)' : 'var(--status-error)',
          }}>
            {difference >= 0 ? '+' : ''}{difference.toFixed(1)}{test.unit}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// CATEGORY SELECTOR
// ============================================================================

const CategorySelector = ({ selected, onChange }) => (
  <Card variant="default" padding="md" style={{ marginBottom: 'var(--spacing-5)' }}>
    <SubSectionTitle style={{
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: 'var(--spacing-3)',
    }}>
      Velg kategori
    </SubSectionTitle>
    <div style={{
      display: 'flex',
      gap: 'var(--spacing-2)',
      overflowX: 'auto',
      paddingBottom: 'var(--spacing-1)',
    }}>
      {CATEGORIES.slice().reverse().map((cat) => {
        const isCurrent = cat.level === CURRENT_CATEGORY;
        const isSelected = cat.level === selected;

        return (
          <Button
            key={cat.level}
            onClick={() => onChange(cat.level)}
            variant={isSelected ? 'primary' : isCurrent ? 'ghost' : 'ghost'}
            size="sm"
            style={{
              border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
              backgroundColor: isCurrent && !isSelected ? 'var(--bg-success-subtle)' : undefined,
              color: isCurrent && !isSelected ? 'var(--status-success)' : undefined,
            }}
          >
            {cat.level}
            {isCurrent && ' ✓'}
          </Button>
        );
      })}
    </div>
  </Card>
);

// ============================================================================
// SUMMARY CARD
// ============================================================================

const SummaryCard = ({ requirements, targetCategory }) => {
  const tests = requirements?.tests || [];
  const metCount = tests.filter((t) => t.met).length;
  const totalCount = tests.length;
  const rounds = requirements?.rounds;

  return (
    <Card variant="default" padding="md" style={{ marginBottom: 'var(--spacing-5)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-4)',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-warning-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Award size={24} color="var(--status-warning)" />
        </div>
        <div>
          <SectionTitle style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            Krav for Kategori {targetCategory}
          </SectionTitle>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: '2px 0 0 0',
          }}>
            {metCount} av {totalCount} testkrav oppfylt
          </p>
        </div>
      </div>

      {/* Progress Ring */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-3)',
      }}>
        <div style={{
          padding: 'var(--spacing-3)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: metCount === totalCount ? 'var(--status-success)' : 'var(--accent)',
          }}>
            {metCount}/{totalCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Tester oppfylt
          </div>
        </div>

        {rounds && (
          <>
            <div style={{
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: rounds.completed >= rounds.required ? 'var(--status-success)' : 'var(--status-warning)',
              }}>
                {rounds.completed}/{rounds.required}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Runder spilt
              </div>
            </div>

            <div style={{
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: rounds.currentHandicap <= rounds.handicapRequired ? 'var(--status-success)' : 'var(--status-error)',
              }}>
                {rounds.currentHandicap}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Hcp (krav: ≤{rounds.handicapRequired})
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KategoriKravContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState(TARGET_CATEGORY);
  const requirements = CATEGORY_REQUIREMENTS[selectedCategory];

  const groupedTests = requirements?.tests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {}) || {};

  return (
    <div className="w-full">
        <PageHeader
          title="Kategorikrav (A-K)"
          subtitle="Spor fremgang mot neste kategori"
          helpText="Oversikt over krav for kategoriopprykk i A-K systemet. Se din nåværende kategori, målkategori og fremgang mot neste nivå. Spor testresultater for driving, jern, naerspill, putting og turneringer. Se hvilke krav som er oppfylt og hva som gjenstår."
        />
        {/* AI Coach Guide */}
        <AICoachGuide config={GUIDE_PRESETS.categoryRequirements} />

        {/* Category Selector */}
        <CategorySelector
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />

        {/* Summary */}
        {requirements && (
          <SummaryCard
            requirements={requirements}
            targetCategory={selectedCategory}
          />
        )}

        {/* Requirements by Category */}
        {Object.entries(groupedTests).map(([category, tests]) => (
          <div key={category} style={{ marginBottom: 'var(--spacing-6)' }}>
            <SubSectionTitle style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}>
              {category}
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                ({tests.filter((t) => t.met).length}/{tests.length} oppfylt)
              </span>
            </SubSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {tests.map((test) => (
                <RequirementCard key={test.id} test={test} />
              ))}
            </div>
          </div>
        ))}

        {!requirements && (
          <StateCard
            variant="empty"
            icon={Info}
            title="Ingen krav definert for denne kategorien"
          />
        )}
    </div>
  );
};

export default KategoriKravContainer;
